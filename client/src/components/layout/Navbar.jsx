import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Bell,
  LogOut,
  User,
  Shield,
  Headphones,
  Sparkles,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { notificationService } from '../../services/notification.service';
import toast from 'react-hot-toast';

export const Navbar = ({ onMobileMenuToggle }) => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user?.id) {
      notificationService
        .getNotifications()
        .then((res) => {
          if (res?.data) {
            const count = res.data.filter((n) => !n.is_read).length;
            setUnreadCount(count);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'admin':
        return { label: 'Admin', icon: Shield, bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' };
      case 'agent':
        return { label: 'Agent', icon: Headphones, bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' };
      default:
        return { label: 'Customer', icon: User, bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
    }
  };

  const currentRoleInfo = getRoleBadge(role);
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  HELPDESK AI
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/70 dark:text-brand-300">
                  <Sparkles className="w-2.5 h-2.5" /> 2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block leading-none">
                Instant Answers. Smarter Support.
              </p>
            </div>
          </Link>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition ${currentRoleInfo.bg}`}
              title="Click to switch demo role"
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{currentRoleInfo.label} View</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-fadeIn"
                onMouseLeave={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Switch Role Persona
                </div>
                <button
                  onClick={() => {
                    switchDemoRole('customer');
                    setShowRoleMenu(false);
                    navigate('/customer/dashboard');
                    toast.success('Switched to Customer persona');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    role === 'customer' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" /> Customer (David)
                  </span>
                  {role === 'customer' && <span className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded">Active</span>}
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('agent');
                    setShowRoleMenu(false);
                    navigate('/agent/dashboard');
                    toast.success('Switched to Support Agent persona');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    role === 'agent' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-blue-500" /> Support Agent (Alex)
                  </span>
                  {role === 'agent' && <span className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded">Active</span>}
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('admin');
                    setShowRoleMenu(false);
                    navigate('/admin/dashboard');
                    toast.success('Switched to Administrator persona');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    role === 'admin' ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" /> Administrator (Sarah)
                  </span>
                  {role === 'admin' && <span className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded">Active</span>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <Link
            to={role === 'customer' ? '/customer/notifications' : '#'}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/30 transition"
            >
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.full_name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-fadeIn"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to={role === 'customer' ? '/customer/profile' : role === 'agent' ? '/agent/profile' : '/admin/settings'}
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <User className="w-4 h-4 text-slate-400" /> My Profile
                </Link>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

