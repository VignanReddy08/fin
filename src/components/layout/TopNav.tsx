import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, ChevronRight, LogOut } from 'lucide-react';
import { Input } from '../ui/input';
import NotificationCenter from '../notifications/NotificationCenter';
import { getCurrentUser, logout } from '../../lib/authStore';

export default function TopNav() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = getCurrentUser() || { fullName: 'Guest User', avatarUrl: '' };
  const userInitials = user.fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  // Format pathname for breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPage = pathParts.length > 0 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1).replace('-', ' ')
    : 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <button className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Breadcrumb */}
        <div className="hidden md:flex items-center text-sm">
          <span className="text-muted-foreground">AgenticFi</span>
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          <span className="text-foreground font-medium">{currentPage}</span>
        </div>

        <div className="relative hidden sm:block w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search tickets, transactions, AI logs..." 
            className="pl-9 bg-black/20 border-border h-9 rounded-full focus-visible:ring-primary/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="relative h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-card"></span>
          </button>
          
          <NotificationCenter 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        </div>

        {/* User Avatar */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
          ) : (
            <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{userInitials}</span>
            </div>
          )}
        </div>

        {/* Mobile Logout */}
        <button
          onClick={handleLogout}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
