import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Lock,
  Send,
  User,
  CheckCircle2,
  AlertCircle,
  History,
  Shield,
  Loader2,
  UserCheck
} from 'lucide-react';
import { ticketService } from '../../services/ticket.service';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/tickets/TicketStatusBadge';
import { TicketTimeline } from '../../components/tickets/TicketTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AgentTicketDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await ticketService.getTicket(id);
      if (res?.data) {
        setTicket(res.data);
        setStatusUpdate(res.data.status);
        setResolutionNotes(res.data.resolution_notes || '');
      }
    } catch (err) {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusUpdate(newStatus);
    setUpdatingStatus(true);
    try {
      await ticketService.updateStatus(id, {
        status: newStatus,
        resolution_notes: resolutionNotes || undefined
      });
      toast.success(`Ticket marked as ${newStatus}`);
      fetchTicket();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleClaimTicket = async () => {
    try {
      await ticketService.assignAgent(id, user.id);
      toast.success('Ticket successfully assigned to you!');
      fetchTicket();
    } catch (err) {
      toast.error('Failed to claim ticket');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      await ticketService.addResponse(id, {
        message: replyMessage,
        is_internal: isInternal,
        status_update: statusUpdate !== ticket.status ? statusUpdate : undefined
      });
      toast.success(isInternal ? 'Internal note saved (private to staff)' : 'Reply sent to customer');
      setReplyMessage('');
      setIsInternal(false);
      fetchTicket();
    } catch (err) {
      toast.error(err.message || 'Failed to send response');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading ticket console..." />;
  if (!ticket) return <div className="text-center py-12">Ticket not found</div>;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/agent/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assigned Queue
        </Link>

        {/* Claim button if unassigned */}
        {!ticket.assigned_agent_id && (
          <button
            onClick={handleClaimTicket}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
          >
            <UserCheck className="w-4 h-4" /> Claim & Assign to Me
          </button>
        )}
      </div>

      {/* Main Ticket Header & Controls */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg">
              #{ticket.ticket_number}
            </span>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>

          {/* Status Changer Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Update Status:
            </span>
            <select
              value={statusUpdate}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_customer">Waiting for Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {ticket.subject}
        </h1>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </div>

        {/* Resolution Notes field if ticket is resolving/resolved */}
        {['resolved', 'closed'].includes(statusUpdate) && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Official Resolution Notes (Visible to Customer upon closing)
            </label>
            <input
              type="text"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Detail root cause and action taken (e.g. Refund transaction settled, patch deployed)..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* AI Intelligence Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-brand-50 via-indigo-50/40 to-white dark:from-slate-900 dark:via-brand-950/30 dark:to-slate-900 border border-brand-200/80 dark:border-brand-800/60 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900 dark:text-brand-300">
              Gemini AI Diagnostic Summary
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-brand-950 dark:text-brand-200 leading-relaxed">
            {ticket.ai_summary || 'Analysis completed: customer inquiry awaiting agent triage.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs pt-1 text-slate-500 dark:text-slate-400">
            <span>
              AI Priority Suggestion:{' '}
              <strong className="text-brand-600 capitalize">{ticket.ai_suggested_priority || ticket.priority}</strong>
            </span>
            <span>•</span>
            <span>
              Customer Sentiment:{' '}
              <strong className="capitalize text-slate-700 dark:text-slate-300">{ticket.ai_sentiment || 'Neutral'}</strong>
            </span>
          </div>
        </div>

        {/* Customer Snippet */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Customer Information
          </span>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
              {ticket.customer_name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{ticket.customer_name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{ticket.customer_email}</p>
            </div>
          </div>
          <Link
            to={`/agent/customers`}
            className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold hover:underline block pt-1"
          >
            View customer profile & past tickets →
          </Link>
        </div>
      </div>

      {/* Response Thread & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages & Internal Notes Thread (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Responses & Internal Staff Notes ({ticket.responses?.length || 0})
          </h3>

          <div className="space-y-3">
            {ticket.responses?.length > 0 ? (
              ticket.responses.map((resp) => (
                <div
                  key={resp.id}
                  className={`p-4 rounded-2xl border ${
                    resp.is_internal
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                      : resp.sender_role === 'agent' || resp.sender_role === 'admin'
                      ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600">
                        {resp.sender_name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {resp.sender_name}
                      </span>
                      {resp.is_internal ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          <Lock className="w-3 h-3" /> Internal Staff Note (Private)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                          {resp.sender_role || 'Agent'}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {resp.created_at ? format(new Date(resp.created_at), 'h:mm a, MMM d') : 'Recently'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-9">
                    {resp.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                No replies or internal notes on this ticket yet.
              </div>
            )}
          </div>

          {/* Agent Reply & Note Form */}
          <form
            onSubmit={handleSendReply}
            className={`p-5 rounded-2xl border transition-all ${
              isInternal
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {isInternal ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Send className="w-3.5 h-3.5 text-brand-600" />}
                <span>{isInternal ? 'Add Internal Note (Hidden from Customer)' : 'Reply to Customer'}</span>
              </label>

              {/* Internal Note Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Internal Staff Note
                </span>
              </label>
            </div>

            <textarea
              rows={4}
              required
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder={
                isInternal
                  ? 'Write a private note for other support agents or administrators...'
                  : 'Write a response that will be sent directly to the customer...'
              }
              className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <div className="flex items-center justify-between pt-3">
              <span className="text-[11px] text-slate-400">
                {isInternal ? 'Private: Only visible to agents & admins' : 'Public: Customer will receive a notification'}
              </span>

              <button
                type="submit"
                disabled={!replyMessage.trim() || submittingReply}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 transition ${
                  isInternal ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {submittingReply ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isInternal ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Save Private Note
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Response
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Activity History Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Audit Activity Log</span>
          </div>

          <TicketTimeline activities={ticket.activity || []} />
        </div>
      </div>
    </div>
  );
};

