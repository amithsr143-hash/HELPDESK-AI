import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bot,
  ArrowRight,
  Plus,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/tickets/TicketStatusBadge';
import { CreateTicketModal } from '../../components/tickets/CreateTicketModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/customers/dashboard');
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching customer dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading customer dashboard..." />;

  const metrics = data?.metrics || {
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Support Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name || 'Customer'}!
          </h1>
          <p className="mt-2 text-brand-100 text-xs sm:text-sm leading-relaxed">
            Need quick answers or technical assistance? Our Gemini AI assistant resolves inquiries instantly, or you can submit and track an escalated support ticket below.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/customer/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-brand-700 hover:bg-brand-50 shadow-md transition"
            >
              <Bot className="w-4 h-4 text-brand-600" /> Ask AI Chatbot
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition"
            >
              <Plus className="w-4 h-4" /> New Support Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards with Rich Visual Depth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {metrics.totalTickets}
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-cyan transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Open Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {metrics.openTickets}
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.inProgressTickets}
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-emerald transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.resolvedTickets}
          </p>
        </div>
      </div>

      {/* Recent Tickets & Quick Help Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Table (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Support Tickets</h2>
            <Link
              to="/customer/tickets"
              className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentTickets?.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.recentTickets.map((t) => (
                <Link
                  key={t.id}
                  to={`/customer/tickets/${t.id}`}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                        #{t.ticket_number}
                      </span>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate max-w-xs sm:max-w-md">
                        {t.subject}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                      {t.ai_summary || t.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <TicketPriorityBadge priority={t.priority} />
                    <TicketStatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No tickets created yet. Use the button above to submit your first inquiry!
            </div>
          )}
        </div>

        {/* Quick Knowledge Base Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              Knowledge Base & FAQs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Browse our curated collection of verified guides for billing, password resets, returns, and order delivery.
            </p>
            <div className="space-y-2">
              <Link
                to="/customer/knowledge-base"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                • 30-Day Money Back & Refund Policy
              </Link>
              <Link
                to="/customer/knowledge-base"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                • Real-Time Delivery Tracking Guide
              </Link>
              <Link
                to="/customer/knowledge-base"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                • Password Reset & Recovery
              </Link>
            </div>
          </div>

          <Link
            to="/customer/knowledge-base"
            className="mt-6 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Explore Knowledge Base <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => fetchDashboardData()}
      />
    </div>
  );
};

