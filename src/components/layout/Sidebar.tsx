import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Settings, 
  Bot,
  Users,
  ShieldCheck,
  History,
  BarChart3,
  UserCheck,
  Bell,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCurrentUser, logout } from '../../lib/authStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getCurrentUser() || { 
    fullName: 'Guest User', 
    role: 'customer',
    avatarUrl: ''
  };
  const getNavItems = () => {
    switch (user.role) {
      case 'customer':
        return [
          { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
          { name: 'Raise Ticket', path: '/app/tickets/new', icon: Ticket },
          { name: 'My Tickets', path: '/app/tickets', icon: Ticket },
          { name: 'Profile', path: '/app/profile', icon: ShieldCheck }
        ];
      case 'super_admin':
        return [
          { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
          { name: 'Tickets', path: '/app/tickets', icon: Ticket },
          { name: 'Users', path: '/app/users', icon: Users },
          { name: 'Approvals', path: '/app/approvals', icon: UserCheck },
          { name: 'Audit Logs', path: '/app/audit-logs', icon: History },
          { name: 'Reports', path: '/app/reports', icon: BarChart3 },
          { name: 'Settings', path: '/app/settings', icon: Settings }
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
          { name: 'Tickets', path: '/app/tickets', icon: Ticket },
          { name: 'Approvals', path: '/app/approvals', icon: UserCheck },
          { name: 'Reports', path: '/app/reports', icon: BarChart3 }
        ];
      case 'auditor':
        return [
          { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
          { name: 'Audit Logs', path: '/app/audit-logs', icon: History },
          { name: 'Reports', path: '/app/reports', icon: BarChart3 }
        ];
      case 'ops_executive':
        return [
          { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
          { name: 'Tickets', path: '/app/tickets', icon: Ticket },
          { name: 'Approvals', path: '/app/approvals', icon: UserCheck }
        ];
      case 'ai_engineer':
        return [
          { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
          { name: 'Audit Logs', path: '/app/audit-logs', icon: History }
        ];
      default:
        return [
          { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard }
        ];
    }
  };

  const navItems = getNavItems();

  const userInitials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 border-r border-border bg-card/50 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-white tracking-tight">FinMatrix</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/app/tickets'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-gray-400 hover:text-gray-100 hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-primary text-xs font-bold">{userInitials}</span>
            )}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
            <p className="text-xs text-gray-500 truncate uppercase tracking-wider font-semibold">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
