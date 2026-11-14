import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Search, ArrowRight, Clock, User } from 'lucide-react';
import { api } from '../../services/api';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/tickets/TicketStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { format } from 'date-fns';

export const AgentTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/agents/tickets', {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined
      });
      if (res?.data) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Error fetching agent tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Assigned Support Queue</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review, triage, and respond to support tickets assigned to you or in the active queue.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by customer, subject, or number..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open (Unassigned)</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_for_customer">Waiting for Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <LoadingSpinner text="Loading tickets..." />
      ) : tickets.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {tickets.map((t) => (
            <Link
              key={t.id}
              to={`/agent/tickets/${t.id}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    #{t.ticket_number}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                    {t.subject}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {t.ai_summary || t.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <User className="w-3 h-3 text-slate-400" />
                    {t.customer_name || 'Customer'}
                  </span>
                  <span>•</span>
                  <span>Category: {t.category_name || 'General'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t.created_at ? format(new Date(t.created_at), 'MMM d, h:mm a') : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <TicketPriorityBadge priority={t.priority} />
                <TicketStatusBadge status={t.status} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title="No tickets found"
          description="There are currently no tickets matching your search or queue filters."
        />
      )}
    </div>
  );
};

