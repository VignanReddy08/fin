import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AppLayout from './components/layout/AppLayout';

// Dashboards
import MainDashboard from './pages/dashboards/MainDashboard';
import TicketManagement from './pages/dashboards/TicketManagement';
import AIAgentWorkflow from './pages/dashboards/AIAgentWorkflow';
import HumanApproval from './pages/dashboards/HumanApproval';
import AuditLogs from './pages/dashboards/AuditLogs';
import AdminSettings from './pages/dashboards/AdminSettings';
import CustomerPortal from './pages/dashboards/CustomerPortal';

// New Pages for Support Center SaaS
import RaiseTicket from './pages/dashboards/RaiseTicket';
import KnowledgeBase from './pages/dashboards/KnowledgeBase';
import Reports from './pages/dashboards/Reports';

// Auth Module Enhanced Pages
import InvitationAcceptPage from './pages/InvitationAcceptPage';
import SecurityCenterPage from './pages/SecurityCenterPage';
import ProfileCompletionPage from './pages/ProfileCompletionPage';
import AuthNotificationsPage from './pages/AuthNotificationsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/invite/:token" element={<InvitationAcceptPage />} />
        <Route path="/profile-setup" element={<ProfileCompletionPage />} />
        
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<MainDashboard />} />
          
          {/* Customer Support & Operations Routes */}
          <Route path="tickets" element={<TicketManagement />} />
          <Route path="tickets/new" element={<RaiseTicket />} />
          <Route path="customer-portal" element={<CustomerPortal />} />
          
          {/* Admin Command Center Routes */}
          <Route path="ai-workspace" element={<AIAgentWorkflow />} />
          <Route path="ai-workflow" element={<AIAgentWorkflow />} /> {/* Alias route for safety */}
          <Route path="users" element={<AdminSettings />} />
          <Route path="settings" element={<AdminSettings />} />
          
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="approvals" element={<HumanApproval />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="reports" element={<Reports />} />
          
          {/* Personal Settings & Notifications */}
          <Route path="profile" element={<SecurityCenterPage />} />
          <Route path="notifications" element={<AuthNotificationsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
