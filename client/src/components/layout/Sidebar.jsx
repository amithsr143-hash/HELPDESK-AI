import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Ticket,
  BookOpen,
  Bell,
  User,
  Users,
  BarChart3,
  Settings,
  Headphones,
  LifeBuoy,
  FolderTree,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { role, switchDemoRole } = useAuth();
  const navigate = useNavigate();


  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/chat', label: 'AI Chatbot', icon: Bot, highlight: true },
    { to: '/customer/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/customer/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
    { to: '/customer/profile', label: 'My Profile', icon: User }
  ];

  const agentLinks = [
    { to: '/agent/dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
    { to: '/agent/tickets', label: 'Assigned Tickets', icon: Ticket, highlight: true },
    { to: '/agent/customers', label: 'Customers', icon: Users },
    { to: '/customer/chat', label: 'AI Assistant', icon: Bot },
    { to: '/customer/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { to: '/agent/profile', label: 'Agent Profile', icon: User }
  ];


  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/tickets', label: 'All Tickets', icon: Ticket },
    { to: '/admin/customers', label: 'User Management', icon: Users },
    { to: '/admin/agents', label: 'Support Agents', icon: Headphones },
    { to: '/admin/categories', label: 'Category Management', icon: FolderTree },
    { to: '/admin/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { to: '/admin/analytics', label: 'AI Analytics', icon: BarChart3, highlight: true },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings }
  ];

  let links = customerLinks;
  if (role === 'agent') links = agentLinks;
  if (role === 'admin') links = adminLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container - Fixed and Pinned */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 md:z-auto w-64 shrink-0 h-full glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col justify-between overflow-hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar min-h-0">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {role === 'admin' ? 'Administration' : role === 'agent' ? 'Agent Workspace' : 'Customer Portal'}
          </div>


          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/20 via-brand-500/10 to-transparent text-brand-700 dark:text-brand-300 font-bold border-l-4 border-brand-500 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400 scale-110'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{link.label}</span>
                    {link.highlight && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-glow-sm" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Fixed Footer Area (Role Switcher + Help Info) */}
        <div className="shrink-0 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
          {/* Quick Role Switcher in Sidebar */}
          <div className="p-3 mx-3 mb-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Switch Role</span>
              <span className="capitalize text-brand-600 dark:text-brand-400 font-extrabold">{role}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => {
                  switchDemoRole('customer');
                  navigate('/customer/dashboard');
                  toast.success('Switched to Customer (David)');
                }}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition ${
                  role === 'customer'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
                title="Customer Portal"
              >
                Customer
              </button>
              <button
                onClick={() => {
                  switchDemoRole('agent');
                  navigate('/agent/dashboard');
                  toast.success('Switched to Support Agent (Alex)');
                }}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition ${
                  role === 'agent'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
                title="Agent Workspace"
              >
                Agent
              </button>
              <button
                onClick={() => {
                  switchDemoRole('admin');
                  navigate('/admin/dashboard');
                  toast.success('Switched to Admin (Sarah)');
                }}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition ${
                  role === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
                title="Admin Console"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Bottom Help info */}
          <div className="p-4 mx-3 mb-3 bg-gradient-to-br from-brand-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-brand-950/30 rounded-2xl border border-brand-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <LifeBuoy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Need Assistance?</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2.5">
              Ask Gemini AI for instant support answers or escalation to a human specialist.
            </p>
            <NavLink
              to="/customer/chat"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
            >
              Launch AI Assistant
            </NavLink>
          </div>
        </div>
      </aside>

    </>
  );
};

