import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Shield, Headphones, User, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const UnauthorizedPage = () => {
  const { role, user, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const attemptedPath = location.state?.from || '/';
  const allowedRoles = location.state?.allowedRoles || [];

  const handleSwitchAndGo = (targetRole, defaultDestination) => {
    switchDemoRole(targetRole);
    toast.success(`Switched to ${targetRole.toUpperCase()} persona!`);
    // If the attempted path was allowed for this target role, go there; otherwise go to destination
    if (allowedRoles.includes(targetRole) && attemptedPath !== '/') {
      navigate(attemptedPath, { replace: true });
    } else {
      navigate(defaultDestination, { replace: true });
    }
  };

  const currentRoleLabel =
    role === 'admin' ? 'Administrator' : role === 'agent' ? 'Support Agent' : 'Customer';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10 space-y-6">
        {/* Shield Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-600/30 via-rose-500/20 to-purple-500/20 border border-rose-500/40 text-rose-400 shadow-glow-sm animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            Access Restricted (HTTP 403)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            403 – Role Permission Required
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            You are currently viewing HELPDESK AI as{' '}
            <span className="font-bold text-white px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
              {currentRoleLabel} ({user?.full_name || 'Active User'})
            </span>
            .
            {attemptedPath && attemptedPath !== '/' && (
              <span className="block mt-1 text-xs text-slate-400">
                The resource <code className="text-brand-300 bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-800/60">{attemptedPath}</code> requires elevated permissions.
              </span>
            )}
          </p>
        </div>

        {/* Quick Persona Switcher Cards */}
        <div className="mt-8 p-6 glass-panel rounded-3xl border border-slate-800/80 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" /> Switch Demo Persona to Continue
              </h2>
              <p className="text-xs text-slate-400">
                HELPDESK AI supports instant multi-role exploration. Click any persona below:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Admin Card */}
            <button
              onClick={() => handleSwitchAndGo('admin', '/admin/dashboard')}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                role === 'admin'
                  ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/30'
                  : 'bg-slate-900/60 hover:bg-purple-950/20 border-slate-800 hover:border-purple-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  {role === 'admin' ? (
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Unlock &rarr;
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                  Administrator
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Sarah Connor
                </p>
                <p className="text-[10px] text-slate-500 mt-2">
                  All Tickets, Agents, KB, Categories & Analytics
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                Switch to Admin <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Agent Card */}
            <button
              onClick={() => handleSwitchAndGo('agent', '/agent/dashboard')}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                role === 'agent'
                  ? 'bg-blue-950/40 border-blue-500/60 ring-2 ring-blue-500/30'
                  : 'bg-slate-900/60 hover:bg-blue-950/20 border-slate-800 hover:border-blue-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Headphones className="w-4 h-4" />
                  </div>
                  {role === 'agent' ? (
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Unlock &rarr;
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                  Support Agent
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Alex Rivera
                </p>
                <p className="text-[10px] text-slate-500 mt-2">
                  Assigned Tickets, Customer Records & Resolutions
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                Switch to Agent <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Customer Card */}
            <button
              onClick={() => handleSwitchAndGo('customer', '/customer/dashboard')}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                role === 'customer'
                  ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900/60 hover:bg-emerald-950/20 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  {role === 'customer' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Select &rarr;
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  Customer
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  David Miller
                </p>
                <p className="text-[10px] text-slate-500 mt-2">
                  AI Chatbot, My Tickets & Knowledge Base
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                Select Customer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* Back and Home links */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs">
          <button
            onClick={() => {
              if (role === 'admin') navigate('/admin/dashboard');
              else if (role === 'agent') navigate('/agent/dashboard');
              else navigate('/customer/dashboard');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Dashboard ({currentRoleLabel})
          </button>

          <Link
            to="/"
            className="text-slate-400 hover:text-white transition font-medium underline-offset-4 hover:underline"
          >
            Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};
