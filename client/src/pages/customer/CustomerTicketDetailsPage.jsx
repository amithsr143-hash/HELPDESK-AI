import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  User,
  Send,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  Headphones,
  History
} from 'lucide-react';
import { ticketService } from '../../services/ticket.service';
import { TicketStatusBadge, TicketPriorityBadge } from '../../components/tickets/TicketStatusBadge';
import { TicketTimeline } from '../../components/tickets/TicketTimeline';
import { FeedbackModal } from '../../components/tickets/FeedbackModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const CustomerTicketDetailsPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await ticketService.getTicket(id);
      if (res?.data) {
        setTicket(res.data);
      }
    } catch (err) {
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmittingReply(true);
    try {
      await ticketService.addResponse(id, {
        message: replyMessage,
        is_internal: false
      });
      toast.success('Your response has been sent to the support agent');
      setReplyMessage('');
      fetchTicket();
    } catch (err) {
      toast.error(err.message || 'Failed to submit response');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading ticket details..." />;
  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Ticket not found</h2>
        <Link to="/customer/tickets" className="text-xs text-brand-600 font-semibold mt-2 inline-block">
          Return to tickets
        </Link>
      </div>
    );
  }

  const isResolved = ['resolved', 'closed'].includes(ticket.status);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <Link
        to="/customer/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Tickets
      </Link>

      {/* Main Ticket Header Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg">
              #{ticket.ticket_number}
            </span>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>

          <span className="text-xs text-slate-400">
            Created: {ticket.created_at ? format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a') : 'Recently'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {ticket.subject}
        </h1>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block text-[11px]">Category</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {ticket.category_name || 'General Inquiry'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Assigned Specialist</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {ticket.agent_name || 'Assigned soon'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Customer Sentiment</span>
            <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
              {ticket.ai_sentiment || 'Neutral'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Summary Banner */}
      {ticket.ai_summary && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50/50 to-purple-50/30 dark:from-brand-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-brand-200/80 dark:border-brand-800/60 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-brand-900 dark:text-brand-200 uppercase tracking-wider">
              Gemini AI Summary & Triage Note
            </h4>
            <p className="text-xs text-brand-800 dark:text-brand-300 leading-relaxed">
              {ticket.ai_summary}
            </p>
          </div>
        </div>
      )}

      {/* Feedback Prompt Banner if Resolved */}
      {isResolved && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                This ticket has been marked as {ticket.status.toUpperCase()}
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                {ticket.resolution_notes || 'The issue has been addressed by our support specialist.'}
              </p>
            </div>
          </div>

          {ticket.feedback ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Rated: {ticket.feedback.rating}/5</span>
            </div>
          ) : (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition"
            >
              <Star className="w-4 h-4" /> Rate Experience
            </button>
          )}
        </div>
      )}

      {/* Conversation Thread & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Thread (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Support Conversation ({ticket.responses?.length || 0})
          </h3>

          <div className="space-y-3">
            {ticket.responses?.length > 0 ? (
              ticket.responses.map((resp) => (
                <div
                  key={resp.id}
                  className={`p-4 rounded-2xl border ${
                    resp.sender_role === 'agent' || resp.sender_role === 'admin'
                      ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {resp.sender_name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {resp.sender_name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                        {resp.sender_role || 'Customer'}
                      </span>
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
                An agent will respond to your ticket shortly. You can also add more notes below.
              </div>
            )}
          </div>

          {/* Reply Form */}
          {!['closed'].includes(ticket.status) && (
            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              <textarea
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type a reply to your support specialist..."
                className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!replyMessage.trim() || submittingReply}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition"
                >
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Activity History */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Ticket Activity Log</span>
          </div>

          <TicketTimeline activities={ticket.activity || []} />
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        ticketId={ticket.id}
        onSubmitted={() => fetchTicket()}
      />
    </div>
  );
};

