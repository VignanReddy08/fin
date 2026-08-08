import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Settings,
  Shield,
  Webhook,
  Bot,
  Database,
  Users,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Mail,
  Send,
  RefreshCw,
  Clock,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import {
  getUsers,
  toggleUserActive,
  updateUserRole,
  deleteUser,
  getInvitations,
  createInvitation,
  cancelInvitation,
  resendInvitation,
  getInvitationStats,
  getUserStats,
  ROLES,
  ROLE_LABELS,
  EMPLOYEE_ROLES,
  type Role,
  type User,
  type Invitation
} from '../../lib/authStore';

type TabName = 'ai' | 'users' | 'invitations' | 'security' | 'api' | 'data' | 'general';

const TAB_CONFIG: { icon: typeof Bot; name: string; tab: TabName }[] = [
  { icon: Bot, name: 'AI Models & Agents', tab: 'ai' },
  { icon: Users, name: 'User Management', tab: 'users' },
  { icon: Send, name: 'Employee Invitations', tab: 'invitations' },
  { icon: Shield, name: 'Security & Access', tab: 'security' },
  { icon: Webhook, name: 'API Integrations', tab: 'api' },
  { icon: Database, name: 'Data & Privacy', tab: 'data' },
  { icon: Settings, name: 'General Settings', tab: 'general' },
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (): TabName => {
    if (location.pathname.includes('users')) return 'users';
    if (location.pathname.includes('settings')) return 'general';
    return 'users';
  };

  const [activeTab, setActiveTab] = useState<TabName>(getTabFromPath());
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = async () => {
    setUsers(await getUsers());
    setInvitations(await getInvitations());
  };

  useEffect(() => {
    setActiveTab(getTabFromPath());
    refreshData();
  }, [location.pathname]);
  
  // Create Invitation form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMobile, setInviteMobile] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [inviteDesig, setInviteDesig] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(ROLES.MANAGER);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const handleCreateInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    if (!inviteName || !inviteEmail || !inviteMobile || !inviteDept || !inviteDesig) {
      setInviteError('All fields are required');
      return;
    }

    const res = await createInvitation({
      fullName: inviteName,
      email: inviteEmail,
      mobile: inviteMobile.replace(/\D/g, '').slice(-10),
      department: inviteDept,
      designation: inviteDesig,
      role: inviteRole,
    });

    if (res.success && res.invitation) {
      setInviteSuccess('Invitation generated successfully!');
      setInviteName('');
      setInviteEmail('');
      setInviteMobile('');
      setInviteDept('');
      setInviteDesig('');
      setInviteRole(ROLES.MANAGER);
      await refreshData();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
      }, 1500);
    } else {
      setInviteError(res.error || 'Failed to create invitation');
    }
  };

  const handleCancelInvite = async (id: string) => {
    await cancelInvitation(id);
    await refreshData();
  };

  const handleResendInvite = async (id: string) => {
    await resendInvitation(id);
    await refreshData();
  };

  const handleToggleActive = async (userId: string) => {
    await toggleUserActive(userId);
    await refreshData();
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    await refreshData();
  };

  const handleRoleChange = async (userId: string, role: Role) => {
    await updateUserRole(userId, role);
    await refreshData();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile.includes(searchQuery)
  );

  const filteredInvites = invitations.filter(
    (i) =>
      i.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.mobile.includes(searchQuery)
  );

  // Stats states
  const [userStats, setUserStats] = useState({ total: 0, active: 0, employees: 0, mfaEnabled: 0 });
  const [inviteStats, setInviteStats] = useState({ total: 0, pending: 0, accepted: 0, expired: 0, cancelled: 0 });

  useEffect(() => {
    getUserStats().then(setUserStats);
    getInvitationStats().then(setInviteStats);
  }, [users, invitations]);

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto py-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Platform Settings</h1>
        <p className="text-sm text-gray-400">
          Manage AI model configurations, invitations, user workstations, and governance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Navigation Tabs */}
        <div className="space-y-2">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.tab}
              onClick={() => { setActiveTab(t.tab); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.tab
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-gray-400 hover:bg-card hover:text-white'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.name}
            </button>
          ))}
        </div>

        {/* Contents Grid col-span-2 */}
        <div className="md:col-span-2 space-y-6">
          
          {/* AI Models Config Tab */}
          {activeTab === 'ai' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Configuration</CardTitle>
                  <CardDescription>Select the foundational models powering your agents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Decision Agent Model</label>
                    <select className="w-full flex h-9 rounded-md border border-border bg-card px-3 py-1 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Gemini 1.5 Pro</option>
                      <option>GPT-4o</option>
                      <option>Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Fast/Routing Agent Model</label>
                    <select className="w-full flex h-9 rounded-md border border-border bg-card px-3 py-1 text-sm text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Gemini 1.5 Flash</option>
                      <option>Claude 3 Haiku</option>
                      <option>GPT-4o mini</option>
                    </select>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button>Save Configuration</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approval Thresholds</CardTitle>
                  <CardDescription>Configure when AI operations require human-in-the-loop.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Max Auto-Refund ($)</label>
                      <Input defaultValue="500.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 font-sans">Min Confidence Score (%)</label>
                      <Input defaultValue="85" />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button variant="outline">Update Thresholds</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">User Workstations Directory</h2>
                  <p className="text-sm text-gray-400">View and manage authenticated customer and staff access accounts.</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or mobile…"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-gray-400">
                          <th className="text-left py-3 px-4 font-medium">Name</th>
                          <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Email</th>
                          <th className="text-left py-3 px-4 font-medium">Role</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-right py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-medium text-white block">{user.fullName}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-300 hidden md:table-cell font-mono text-xs">{user.email}</td>
                            <td className="py-3 px-4">
                              {user.role === ROLES.SUPER_ADMIN ? (
                                <span className="text-xs text-amber-400 font-semibold uppercase">{ROLE_LABELS[user.role]}</span>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                  className="h-7 rounded border border-border bg-card px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                  {EMPLOYEE_ROLES.map((r) => (
                                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                  ))}
                                  <option value={ROLES.CUSTOMER}>{ROLE_LABELS[ROLES.CUSTOMER]}</option>
                                </select>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                                user.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {user.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {user.role !== ROLES.SUPER_ADMIN && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={() => handleToggleActive(user.id)} className="p-1 hover:bg-card text-gray-400 hover:text-white">
                                    {user.isActive ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4" />}
                                  </button>
                                  <button onClick={() => handleDeleteUser(user.id)} className="p-1 hover:bg-card text-gray-400 hover:text-red-400">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Stats overview cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Workstations', value: userStats.total, color: 'text-primary' },
                  { label: 'Active Status', value: userStats.active, color: 'text-emerald-400' },
                  { label: 'Total Employees', value: userStats.employees, color: 'text-amber-400' },
                  { label: 'MFA Verified', value: userStats.mfaEnabled, color: 'text-purple-400' }
                ].map((st) => (
                  <Card key={st.label}>
                    <CardContent className="p-4 text-center">
                      <p className={`text-2xl font-bold ${st.color}`}>{st.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{st.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Invitation Onboarding System Tab */}
          {activeTab === 'invitations' && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Employee Onboarding Invitations</h2>
                  <p className="text-sm text-gray-400">Generate secure credentials-free invitations for employees onboarding.</p>
                </div>
                <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Invite Employee
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search invitations by name, email, or mobile…"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Invite Modal Form card */}
              {showInviteModal && (
                <Card className="border-primary/30 bg-card/90">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Invite New Staff Member</CardTitle>
                      <CardDescription>Onboarding invitations expire in 7 days</CardDescription>
                    </div>
                    <button onClick={() => setShowInviteModal(false)} className="text-gray-500 hover:text-white">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inviteError && (
                      <div className="flex items-center gap-2 p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                        <XCircle className="h-4 w-4" />
                        <span>{inviteError}</span>
                      </div>
                    )}
                    {inviteSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{inviteSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateInviteSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-300">Full Name</label>
                        <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Sneha Kulkarni" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-300">Official Work Email</label>
                        <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="sneha@agentic.fi" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-300">Mobile Number</label>
                        <Input value={inviteMobile} onChange={(e) => setInviteMobile(e.target.value)} placeholder="9876543210" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-300">Department</label>
                        <Input value={inviteDept} onChange={(e) => setInviteDept(e.target.value)} placeholder="Engineering" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-300">Designation</label>
                        <Input value={inviteDesig} onChange={(e) => setInviteDesig(e.target.value)} placeholder="ML Ops Engineer" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-300">Platform Role</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as Role)}
                          className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {EMPLOYEE_ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                        <Button type="submit">Send Workstation Onboarding Code</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Invitations Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-gray-400">
                          <th className="text-left py-3 px-4 font-medium">Invitee</th>
                          <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Role</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium hidden lg:table-cell font-sans">Expiry</th>
                          <th className="text-right py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInvites.map((invite) => (
                          <tr key={invite.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-medium text-white block">{invite.fullName}</span>
                              <span className="text-xs text-gray-500 block">{invite.email}</span>
                              <span className="text-[10px] text-gray-600 block sm:hidden">Link: /invite/{invite.token}</span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <p className="text-gray-300 font-medium text-xs">{ROLE_LABELS[invite.role]}</p>
                              <p className="text-[10px] text-gray-500">{invite.department} • {invite.designation}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[invite.status]}`}>
                                {invite.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell text-xs text-gray-400">
                              {new Date(invite.expiresAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {invite.status === 'pending' && (
                                  <>
                                    {/* Action link */}
                                    <button
                                      onClick={() => navigate(`/invite/${invite.token}`)}
                                      className="p-1.5 rounded hover:bg-card text-xs text-primary font-medium hover:underline"
                                      title="Open onboarding wizard"
                                    >
                                      Onboard UI
                                    </button>
                                    <button onClick={() => handleCancelInvite(invite.id)} className="p-1 hover:bg-card text-gray-400 hover:text-red-400" title="Cancel invitation">
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                {(invite.status === 'pending' || invite.status === 'expired') && (
                                  <button onClick={() => handleResendInvite(invite.id)} className="p-1 hover:bg-card text-gray-400 hover:text-white" title="Resend invitation">
                                    <RefreshCw className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Invite statistics count */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Invites', value: inviteStats.total, color: 'text-primary' },
                  { label: 'Pending Outbox', value: inviteStats.pending, color: 'text-amber-400' },
                  { label: 'Accepted Status', value: inviteStats.accepted, color: 'text-emerald-400' },
                  { label: 'Expired/Cancelled', value: inviteStats.expired + inviteStats.cancelled, color: 'text-gray-500' }
                ].map((is) => (
                  <Card key={is.label}>
                    <CardContent className="p-4 text-center">
                      <p className={`text-2xl font-bold ${is.color}`}>{is.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{is.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Placeholder tabs */}
          {activeTab !== 'ai' && activeTab !== 'users' && activeTab !== 'invitations' && (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  {TAB_CONFIG.find((t) => t.tab === activeTab)?.name}
                </h3>
                <p className="text-sm text-gray-500">This section is under development and will be available soon.</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
