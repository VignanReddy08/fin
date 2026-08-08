import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { Resend } from 'resend';
import bcrypt from 'bcrypt';
import db from './db.js';
import { OAuth2Client } from 'google-auth-library';
// Load environment variables from .env file
dotenv.config();

const app = express();

app.get('/api/debug-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 as connected');
    res.json({ 
      success: true, 
      host: process.env.DB_HOST ? 'Set' : 'Missing',
      user: process.env.DB_USER ? 'Set' : 'Missing'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code,
      host: process.env.DB_HOST || 'localhost (missing env)'
    });
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = 'llama-3.1-8b-instant';

// In-Memory Database for Hackathon
let approvalQueue = [];
let resolvedTickets = [];

// Resend Email Setup
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('Resend initialized with API Key.');
} else {
  console.log('No RESEND_API_KEY provided. OTPs will only be printed to console.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AgenticFi Backend is running' });
});

// AI Chat Endpoint (for Copilot)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const prompt = `You are the AgenticFi AI Support Agent. You help users with their financial platform issues. The customer says: "${message}". Keep your answer helpful, concise, professional, and directly address the user's inquiry.`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
    });
    
    res.json({ text: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// ─── MYSQL DATABASE ROUTES ────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, mobile, password, role = 'customer', isAdmin } = req.body;
    
    // Validate email
    const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = (isAdmin ? 'admin-' : 'cust-') + Date.now();
    
    await db.query(`
      INSERT INTO users (id, fullName, email, mobile, password, role, isVerified, emailVerified, profileCompleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, fullName, email, mobile || null, hashedPassword, role, 
      isAdmin, isAdmin, isAdmin
    ]);
    
    res.json({ success: true, user: { id: userId, fullName, email, role } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { credential, password } = req.body;
    
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ? OR mobile = ?', 
      [credential, credential, credential]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    if (!user.isActive) return res.status(403).json({ success: false, error: 'Account deactivated' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    await db.query('UPDATE users SET lastLogin = NOW(), loginCount = loginCount + 1 WHERE id = ?', [user.id]);
    
    delete user.password;
    res.json({ success: true, user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // In a real app, verify with your actual CLIENT_ID
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
    const client = new OAuth2Client(clientId);
    
    // Skip verification if placeholder is used (for demo purposes)
    let payload;
    if (clientId === 'YOUR_GOOGLE_CLIENT_ID' || token === 'mock_google_token') {
       payload = {
         email: 'googleuser@example.com',
         name: 'Google User',
         picture: ''
       };
    } else {
      // useGoogleLogin from @react-oauth/google returns an access_token, not an id_token.
      // We must fetch the user info from Google's userinfo endpoint.
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      
      payload = await userInfoResponse.json();
    }
    
    const { email, name, picture } = payload;
    
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    let user;
    if (users.length === 0) {
      // Register new user
      const userId = 'cust-' + Date.now();
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      
      await db.query(`
        INSERT INTO users (id, fullName, email, password, role, isVerified, emailVerified, profileCompleted)
        VALUES (?, ?, ?, ?, 'customer', true, true, false)
      `, [userId, name, email, randomPassword]);
      
      const [newUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      user = newUsers[0];
    } else {
      user = users[0];
      if (!user.isActive) return res.status(403).json({ success: false, error: 'Account deactivated' });
      await db.query('UPDATE users SET lastLogin = NOW(), loginCount = loginCount + 1 WHERE id = ?', [user.id]);
    }
    
    delete user.password;
    // Inject google picture if missing local photo (concept)
    if (picture) user.avatarUrl = picture;
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, fullName, email, mobile, role, isActive, isVerified, createdAt, department, designation FROM users');
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    await db.query('UPDATE users SET role = ? WHERE id = ? AND role != "super_admin"', [role, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

app.post('/api/users/:id/active', async (req, res) => {
  try {
    await db.query('UPDATE users SET isActive = NOT isActive WHERE id = ? AND role != "super_admin"', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle active status' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role != "super_admin"', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/invitations', async (req, res) => {
  try {
    const [invitations] = await db.query('SELECT * FROM invitations');
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

app.post('/api/invitations', async (req, res) => {
  try {
    const { fullName, email, mobile, department, designation, role } = req.body;
    
    const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });
    
    const token = 'inv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const id = 'inv-' + Date.now();
    
    await db.query(`
      INSERT INTO invitations (id, fullName, email, mobile, department, designation, role, token, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
    `, [id, fullName, email, mobile, department, designation, role, token]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Invite Error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// ─── EMAIL OTP ROUTE ───────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    if (!resend) {
      console.log(`[MOCK EMAIL] To: ${email} | OTP: ${otp}`);
      return res.json({ success: true, message: 'OTP logged to console (No Resend API Key configured)' });
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your AgenticFi Verification Code',
      text: `Welcome to AgenticFi! Your email verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>AgenticFi Email Verification</h2>
          <p>Welcome to AgenticFi!</p>
          <p>Your verification code is: <strong><span style="font-size: 24px;">${otp}</span></strong></p>
          <p>Please enter this code on the registration screen to complete your signup.</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(500).json({ error: 'Failed to send OTP via Resend' });
    }
    
    console.log(`Email sent: ${data?.id}`);

    res.json({ 
      success: true, 
      message: 'OTP Sent successfully'
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send OTP email: ' + (error.message || String(error)) });
  }
});

// ─── TICKET AI AGENT ROUTES ────────────────────────────────────────

// Submit a Ticket for AI Analysis
app.post('/api/tickets', async (req, res) => {
  try {
    const { customerName, type, amount, description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const prompt = `
      Analyze this customer support ticket for a financial platform.
      Customer Name: ${customerName || 'Unknown'}
      Ticket Type: ${type || 'General'}
      Amount Involved: $${amount || 0}
      Description: "${description}"
      
      Evaluate the risk and priority. If the amount is very high (over $1000) or it mentions fraud, account takeover, or security issues, it is Critical and needs human approval. 
      If it is a simple refund under $1000, password reset, or general inquiry, it is Low/Medium and can be auto-resolved by AI.

      You must respond ONLY with a valid JSON object matching exactly this structure (no markdown, no extra text):
      {
        "priority": "Low" | "Medium" | "High" | "Critical",
        "needsHumanApproval": boolean,
        "confidenceScore": number (0-100),
        "reasoning": "short explanation",
        "suggestedResolution": "automated resolution text"
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });
    
    const responseText = completion.choices[0]?.message?.content || "{}";
    const aiDecision = JSON.parse(responseText);

    const ticketRecord = {
      id: 'TKT-' + Math.floor(Math.random() * 10000),
      customerName,
      type,
      amount,
      description,
      ...aiDecision,
      createdAt: new Date().toISOString()
    };

    if (aiDecision.needsHumanApproval) {
      ticketRecord.status = 'pending';
      approvalQueue.push(ticketRecord);
      res.json({ 
        message: 'Ticket flagged for Human Approval',
        autoResolved: false,
        ticket: ticketRecord
      });
    } else {
      ticketRecord.status = 'auto-resolved';
      resolvedTickets.push(ticketRecord);
      res.json({
        message: 'Ticket successfully auto-resolved by AI',
        autoResolved: true,
        ticket: ticketRecord
      });
    }

  } catch (error) {
    console.error('Ticket AI Error:', error);
    res.status(500).json({ error: 'Failed to analyze ticket' });
  }
});

// Get Human Approval Queue
app.get('/api/approvals', (req, res) => {
  res.json(approvalQueue);
});

// Resolve a Ticket in the Approval Queue (Human Admin action)
app.post('/api/approvals/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  const ticketIndex = approvalQueue.findIndex(t => t.id === id);
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found in approval queue' });
  }

  const ticket = approvalQueue[ticketIndex];
  ticket.status = action === 'approve' ? 'human-approved' : 'human-rejected';
  
  // Remove from queue and add to resolved
  approvalQueue.splice(ticketIndex, 1);
  resolvedTickets.push(ticket);

  res.json({ message: `Ticket ${id} has been ${action}d.`, ticket });
});

// --- Profile & Account Center Endpoints ---
// Mock in-memory profile store for demonstration
let userProfile = {
  firstName: 'Ha',
  lastName: 'Customer',
  displayName: 'ha_customer',
  email: 'ha@agentic.fi',
  mobile: '1234567890',
  dob: '',
  gender: '',
  language: 'English',
  timezone: 'UTC',
  customerId: 'CUST-883921',
  registrationDate: '2026-08-01T10:00:00Z',
  photoBase64: null,
  emailVerified: true,
  mobileVerified: true,
  preferences: {
    emailNotifications: true,
    inAppNotifications: true,
    ticketUpdates: true,
    aiRecommendations: false,
    securityAlerts: true,
    marketingEmails: false,
    knowledgeUpdates: false,
    systemAnnouncements: true,
  }
};

let userActivity = [
  { id: 1, type: 'login', description: 'Successful login', date: new Date().toISOString(), icon: 'LogIn' },
  { id: 2, type: 'ticket_created', description: 'Ticket TKT-1029 created', date: new Date(Date.now() - 86400000).toISOString(), icon: 'Ticket' }
];

let userSessions = [
  { id: 'sess-1', device: 'Chrome on Windows', ip: '192.168.1.5', lastActive: 'Just now', current: true },
  { id: 'sess-2', device: 'Safari on iPhone', ip: '10.0.0.12', lastActive: '2 days ago', current: false }
];

app.get('/api/v1/profile', (req, res) => res.json(userProfile));
app.put('/api/v1/profile', (req, res) => {
  userProfile = { ...userProfile, ...req.body };
  res.json({ message: 'Profile updated successfully', profile: userProfile });
});
app.post('/api/v1/profile/photo', (req, res) => {
  userProfile.photoBase64 = req.body.photoBase64;
  res.json({ message: 'Photo uploaded successfully' });
});
app.delete('/api/v1/profile/photo', (req, res) => {
  userProfile.photoBase64 = null;
  res.json({ message: 'Photo deleted successfully' });
});
app.put('/api/v1/profile/preferences', (req, res) => {
  userProfile.preferences = { ...userProfile.preferences, ...req.body };
  res.json({ message: 'Preferences updated successfully', preferences: userProfile.preferences });
});
app.get('/api/v1/profile/activity', (req, res) => res.json(userActivity));
app.get('/api/v1/profile/statistics', (req, res) => {
  res.json({
    totalTickets: 12,
    openTickets: 2,
    inProgress: 1,
    resolved: 8,
    closed: 1,
    avgResolutionTime: '4.5 hrs',
    latestTicket: 'TKT-1029'
  });
});
app.get('/api/v1/profile/sessions', (req, res) => res.json(userSessions));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
