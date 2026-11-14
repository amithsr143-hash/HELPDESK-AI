import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Search, UserCheck, ArrowRight, User } from 'lucide-react';
import { ticketService } from '../../services/ticket.service';
import { adminService } from '../../services/admin.service';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/tickets/TicketStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, aRes] = await Promise.all([
        ticketService.getTickets({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          search: search || undefined
        }),
        adminService.getAgents()
      ]);
      if (tRes?.data) setTickets(tRes.data);
      if (aRes?.data) setAgents(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  const handleAssignAgent = async (ticketId, agentId) => {
    try {
      await ticketService.assignAgent(ticketId, agentId || null);
      toast.success('Agent assignment updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to assign agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Master Tickets Roster</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global view across all customers and agents. Reassign specialists, inspect AI sentiment, and update statuses.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            placeholder="Search all tickets..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
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

      {/* Tickets Master Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving all system tickets..." />
      ) : tickets.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    #{t.ticket_number}
                  </span>
                  <Link
                    to={`/agent/tickets/${t.id}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    {t.subject}
                  </Link>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {t.ai_summary || t.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Customer: {t.customer_name || 'Customer'}
                  </span>
                  <span>•</span>
                  <span>Category: {t.category_name || 'General'}</span>
                  <span>•</span>
                  <span>
                    Created: {t.created_at ? format(new Date(t.created_at), 'MMM d, yyyy') : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <TicketPriorityBadge priority={t.priority} />
                <TicketStatusBadge status={t.status} />

                {/* Agent assignment selector */}
                <select
                  value={t.assigned_agent_id || ''}
                  onChange={(e) => handleAssignAgent(t.id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.full_name}
                    </option>
                  ))}
                </select>

                <Link
                  to={`/agent/tickets/${t.id}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Ticket} title="No tickets match criteria" />
      )}
    </div>
  );
};

