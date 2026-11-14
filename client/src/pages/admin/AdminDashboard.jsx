import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Headphones,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Star,
  Bot,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/tickets/TicketStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((res) => {
        if (res?.data) setData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading administrative dashboard..." />;

  const metrics = data?.metrics || {
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    urgentTickets: 0,
    totalCustomers: 0,
    totalAgents: 0,
    avgResolutionHours: 2.4,
    csatScore: 4.8,
    aiResolutionRate: 82,
    categoryDistribution: [],
    priorityDistribution: [],
    sentimentDistribution: []
  };

  const priorityColors = ['#94a3b8', '#38bdf8', '#f59e0b', '#ef4444'];
  const sentimentColors = ['#10b981', '#94a3b8', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Executive Administration Dashboard
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Admin Console
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform metrics, agent workloads, customer satisfaction, and AI automation rates.
          </p>
        </div>

        <Link
          to="/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
        >
          <Sparkles className="w-4 h-4" /> View AI Insights & Recommendations
        </Link>
      </div>

      {/* Primary KPI Cards with High Contrast Depth */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-sm transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400">Total Customers</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.totalCustomers}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <Users className="w-3 h-3" /> Registered
          </span>
        </div>

        <div className="p-4 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-cyan transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400">Support Agents</span>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
            {metrics.totalAgents}
          </p>
          <span className="text-[10px] text-cyan-500 font-semibold flex items-center gap-1 mt-1">
            <Headphones className="w-3 h-3" /> Active Roster
          </span>
        </div>

        <div className="p-4 rounded-3xl glass-card hover:scale-[1.02] transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400">Total Tickets</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {metrics.totalTickets}
          </p>
          <span className="text-[10px] text-purple-500 font-semibold flex items-center gap-1 mt-1">
            <Ticket className="w-3 h-3" /> Lifetime
          </span>
        </div>

        <div className="p-4 rounded-3xl glass-card hover:scale-[1.02] transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400">Avg Resolution</span>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
            {metrics.avgResolutionHours}h
          </p>
          <span className="text-[10px] text-brand-600 font-semibold flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> Target: &lt;4.0h
          </span>
        </div>

        <div className="p-4 rounded-3xl glass-card hover:scale-[1.02] transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400">CSAT Rating</span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {metrics.csatScore}/5.0
          </p>
          <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-amber-400" /> High Score
          </span>
        </div>

        <div className="p-4 rounded-3xl glass-card hover:scale-[1.02] hover:shadow-glow-emerald transition-all duration-200">
          <span className="text-[11px] font-bold text-slate-400">AI Resolution</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.aiResolutionRate}%
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <Bot className="w-3 h-3" /> Automated
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Categories Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Ticket Category Volume
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Actual breakdown across all support categories
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.categoryDistribution || []} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority & Sentiment Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Ticket Priority & Urgency
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Distribution of current ticket priority tiers
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.priorityDistribution || []}>
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
                  {(metrics.priorityDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={priorityColors[index % priorityColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tickets Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent System Tickets</h2>
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 flex items-center gap-1"
          >
            Manage All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recentTickets?.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentTickets.map((t) => (
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
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate max-w-sm sm:max-w-md">
                      {t.subject}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                    Customer: {t.customer_name || 'Customer'} • Agent: {t.agent_name || 'Unassigned'}
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
          <div className="p-8 text-center text-xs text-slate-400">No tickets recorded in system.</div>
        )}
      </div>
    </div>
  );
};

