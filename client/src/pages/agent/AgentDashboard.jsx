import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Headphones,
  UserCheck,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { api } from '../../services/api';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/tickets/TicketStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAgentDashboard = async () => {
    try {
      const res = await api.get('/agents/dashboard');
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching agent dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDashboard();
  }, []);

  const handleClaimTicket = async (ticketId) => {
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { agent_id: user.id });
      toast.success('Ticket assigned to you!');
      fetchAgentDashboard();
    } catch (err) {
      toast.error('Failed to claim ticket');
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading agent console..." />;

  const metrics = data?.metrics || {
    totalAssigned: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    urgentTickets: 0,
    unassignedInQueue: 0
  };

  const priorityColors = {
    Low: '#94a3b8',
    Medium: '#38bdf8',
    High: '#f59e0b',
    Urgent: '#ef4444'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Agent Workspace
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Active Shift
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resolve assigned issues, triage unassigned tickets, and collaborate on customer complaints.
          </p>
        </div>

        <Link
          to="/agent/tickets"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
        >
          <Ticket className="w-4 h-4" /> View All Assigned Tickets
        </Link>
      </div>

      {/* Stat Cards with Rich Visual Depth */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-sm transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned to Me</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {metrics.totalAssigned}
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-cyan transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Triage</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {metrics.pendingTickets}
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.inProgressTickets}
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-rose transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Urgent Priority</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {metrics.urgentTickets}
          </p>
        </div>

        <div className="p-5 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-emerald transition-all duration-200 col-span-2 lg:col-span-1">
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

      {/* Grid: Tickets Queue & Priority Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Tickets (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              My Active Tickets Queue
            </h2>
            <Link
              to="/agent/tickets"
              className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 flex items-center gap-1"
            >
              All Assigned <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentlyAssignedTickets?.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.recentlyAssignedTickets.map((t) => (
                <Link
                  key={t.id}
                  to={`/agent/tickets/${t.id}`}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                        #{t.ticket_number}
                      </span>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate max-w-sm sm:max-w-md">
                        {t.subject}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                      Customer: {t.customer_name || 'Customer'} • {t.category_name || 'General'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <TicketPriorityBadge priority={t.priority} />
                    <TicketStatusBadge status={t.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No tickets currently assigned to you. Check the unassigned queue below!
            </div>
          )}
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Ticket Priority Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Assigned workload by urgency level
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.priorityDistribution || []}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {(data?.priorityDistribution || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={priorityColors[entry.name] || '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>High SLA Priority: Urgent within 2h</span>
            <span className="font-semibold text-rose-500">{metrics.urgentTickets} Active</span>
          </div>
        </div>
      </div>

      {/* Unassigned Tickets Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Unassigned Incoming Queue ({metrics.unassignedInQueue})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Available to Claim</span>
        </div>

        {data?.unassignedTicketsQueue?.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.unassignedTicketsQueue.map((t) => (
              <div
                key={t.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      #{t.ticket_number}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.subject}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {t.ai_summary || t.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <TicketPriorityBadge priority={t.priority} />
                  <button
                    onClick={() => handleClaimTicket(t.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Claim Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Queue is clear. No unassigned tickets pending.
          </div>
        )}
      </div>
    </div>
  );
};

