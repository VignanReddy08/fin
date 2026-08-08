import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Shield, Bell, Activity, Clock, ShieldCheck,
  Smartphone, Monitor, Globe, KeyRound, Lock, Trash2, Camera, Check,
  AlertTriangle, UploadCloud, ChevronRight, CheckCircle2, Ticket,
  MessageSquare, Settings, HelpCircle, Download, X, LogOut, CheckSquare
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import OTPInput from '../components/auth/OTPInput';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/authStore';

const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-700'}`}
  >
    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
  </button>
);

export default function SecurityCenterPage() {
  const navigate = useNavigate();
  
  // Data States
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit States
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  
  // Photo Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState('');

  // OTP Verification States
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [otpError, setOtpError] = useState(false);
  
  // Load initial data
  useEffect(() => {
    Promise.all([
      fetch('/api/v1/profile/statistics').then(r => r.json()),
      fetch('/api/v1/profile/activity').then(r => r.json()),
      fetch('/api/v1/profile/sessions').then(r => r.json())
    ]).then(([st, act, sess]) => {
      const currentUser = getCurrentUser();
      const realProfile = {
        firstName: currentUser?.fullName?.split(' ')[0] || 'Unknown',
        lastName: currentUser?.fullName?.split(' ').slice(1).join(' ') || '',
        displayName: currentUser?.fullName || '',
        email: currentUser?.email || '',
        dob: 'Not provided',
        gender: 'Not provided',
        language: 'English',
        timezone: 'UTC',
        customerId: currentUser?.id || 'Unknown',
        registrationDate: currentUser?.createdAt || new Date().toISOString(),
        photoBase64: (currentUser as any)?.avatarUrl || null,
        emailVerified: currentUser?.emailVerified || false,
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
      
      setProfile(realProfile);
      setEditForm(realProfile);
      setStats(st);
      setActivity(act);
      setSessions(sess);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load profile data', err);
      setLoading(false);
    });
  }, []);

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      setProfile(data.profile);
      setIsEditingPersonal(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size must be less than 5MB');
      return;
    }
    setPhotoError('');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result;
      try {
        await fetch('/api/v1/profile/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoBase64: base64 })
        });
        setProfile((prev: any) => ({ ...prev, photoBase64: base64 }));
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePreferenceToggle = async (key: string) => {
    const newPrefs = { ...profile.preferences, [key]: !profile.preferences[key] };
    setProfile({ ...profile, preferences: newPrefs });
    try {
      await fetch('/api/v1/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newPrefs[key] })
      });
    } catch (e) {
      console.error(e);
      // Revert on error (skipped for brevity)
    }
  };

  const handleOTPComplete = (type: 'email' | 'mobile', otp: string) => {
    if (otp === '123456') {
      setOtpError(false);
      setProfile((prev: any) => ({
        ...prev,
        [type === 'email' ? 'emailVerified' : 'mobileVerified']: true
      }));
      if (type === 'email') setVerifyingEmail(false);
      else setVerifyingMobile(false);
    } else {
      setOtpError(true);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      
      {/* HEADER / TOP PROFILE CARD */}
      <Card className="glass border-white/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-transparent"></div>
        <CardContent className="pt-16 pb-8 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-gray-800 flex items-center justify-center">
              {profile.photoBase64 ? (
                <img src={profile.photoBase64} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
            </div>
            <div 
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handlePhotoUpload} 
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-bold text-white">{profile.firstName} {profile.lastName}</h1>
              {profile.emailVerified && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
            </div>
            <div className="text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span>{profile.email}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Customer ID: {profile.customerId}</Badge>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
            <Button onClick={() => setIsEditingPersonal(true)} variant="outline" className="w-full border-white/10 hover:bg-white/5">
              Edit Profile
            </Button>
            {photoError && <p className="text-xs text-red-500 text-center">{photoError}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PERSONAL INFO */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isEditingPersonal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">First Name</label>
                    <Input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Last Name</label>
                    <Input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Display Name</label>
                    <Input value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Date of Birth</label>
                    <Input type="date" value={editForm.dob} onChange={e => setEditForm({...editForm, dob: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Gender</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                      value={editForm.gender} 
                      onChange={e => setEditForm({...editForm, gender: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Language</label>
                    <Input value={editForm.language} onChange={e => setEditForm({...editForm, language: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={() => setIsEditingPersonal(false)}>Cancel</Button>
                    <Button onClick={handleSavePersonal} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                    <p className="font-medium text-white">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Display Name</p>
                    <p className="font-medium text-white">{profile.displayName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Date of Birth</p>
                    <p className="font-medium text-white">{profile.dob || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Gender</p>
                    <p className="font-medium text-white">{profile.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Language / Timezone</p>
                    <p className="font-medium text-white">{profile.language} / {profile.timezone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
                    <p className="font-medium text-white">{new Date(profile.registrationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CONTACT INFO */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Email */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg bg-black/20 border border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-white">{profile.email}</span>
                    {profile.emailVerified ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">Unverified</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Primary email for security alerts and notifications.</p>
                </div>
                {!profile.emailVerified ? (
                  verifyingEmail ? (
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <OTPInput onComplete={(otp) => handleOTPComplete('email', otp)} error={otpError} />
                      <Button variant="ghost" size="sm" onClick={() => setVerifyingEmail(false)} className="text-xs">Cancel</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => { setVerifyingEmail(true); setOtpError(false); }}>Verify Email</Button>
                  )
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setProfile({...profile, emailVerified: false})}>Change Email</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SECURITY & SESSIONS */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Security & Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="flex justify-between items-center p-4 rounded-lg bg-black/20 border border-border/50">
                <div className="space-y-1">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> Password
                  </h4>
                  <p className="text-xs text-gray-400">Last changed 3 months ago</p>
                </div>
                <Button variant="outline">Update Password</Button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">Active Sessions</h4>
                <div className="space-y-2">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="flex justify-between items-center p-3 rounded border border-border/30 bg-black/10">
                      <div className="flex items-center gap-3">
                        {sess.device.includes('iPhone') || sess.device.includes('Mobile') ? <Smartphone className="w-5 h-5 text-gray-400" /> : <Monitor className="w-5 h-5 text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {sess.device} {sess.current && <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-400 text-[9px] border-emerald-500/20">Current</Badge>}
                          </p>
                          <p className="text-xs text-gray-500">{sess.ip} • Last active: {sess.lastActive}</p>
                        </div>
                      </div>
                      {!sess.current && (
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400"><LogOut className="w-4 h-4" /></Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* SUPPORT STATS */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass border-white/10 bg-primary/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Ticket className="w-6 h-6 text-primary mb-2" />
                <p className="text-3xl font-bold text-white">{stats.totalTickets}</p>
                <p className="text-xs text-gray-400">Total Tickets</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10 bg-emerald-500/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <CheckSquare className="w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-3xl font-bold text-white">{stats.resolved}</p>
                <p className="text-xs text-gray-400">Resolved</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10 bg-yellow-500/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className="w-6 h-6 text-yellow-500 mb-2" />
                <p className="text-3xl font-bold text-white">{stats.openTickets}</p>
                <p className="text-xs text-gray-400">Open Tickets</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10 bg-blue-500/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Activity className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-xl font-bold text-white mt-1">{stats.avgResolutionTime}</p>
                <p className="text-xs text-gray-400 mt-1">Avg Resolution</p>
              </CardContent>
            </Card>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                { key: 'inAppNotifications', label: 'In-App Notifications', desc: 'Show alerts inside the dashboard' },
                { key: 'ticketUpdates', label: 'Ticket Updates', desc: 'Alerts when your support tickets change status' },
                { key: 'securityAlerts', label: 'Security Alerts', desc: 'New logins from unrecognized devices' },
                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotions, newsletters, and offers' },
              ].map(pref => (
                <div key={pref.key} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white">{pref.label}</p>
                    <p className="text-[10px] text-gray-500">{pref.desc}</p>
                  </div>
                  <Switch 
                    checked={profile.preferences[pref.key]} 
                    onChange={() => handlePreferenceToggle(pref.key)} 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY TIMELINE */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative">
              <div className="absolute left-[33px] top-6 bottom-6 w-px bg-border/50"></div>
              <div className="space-y-6">
                {activity.map(item => (
                  <div key={item.id} className="flex gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-black border border-border flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon === 'LogIn' ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <Ticket className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.description}</p>
                      <p className="text-[11px] text-gray-500">{new Date(item.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PRIVACY & DATA */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs border-border/50 text-gray-300">
                <Download className="w-3.5 h-3.5" /> Download My Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20">
                <Trash2 className="w-3.5 h-3.5" /> Request Account Deletion
              </Button>
            </CardContent>
          </Card>
          
          {/* SUPPORT SHORTCUTS */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary" onClick={() => navigate('/app/tickets/new')}>
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Raise Ticket</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-black/20 hover:bg-black/40 border-border/50 text-gray-300" onClick={() => navigate('/app/knowledge-base')}>
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <span className="text-xs">Help Center</span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
