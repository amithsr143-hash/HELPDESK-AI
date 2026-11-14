import React from 'react';
import { Clock, CheckCircle2, UserCheck, AlertCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export const TicketTimeline = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return <p className="text-xs text-slate-400 py-3">No activity recorded yet.</p>;
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'status_changed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'agent_assigned':
        return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
      case 'priority_changed':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      case 'ticket_created':
        return <Clock className="w-3.5 h-3.5 text-brand-500" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatActivityText = (act) => {
    switch (act.activity_type) {
      case 'ticket_created':
        return `Ticket created by ${act.actor_name || 'Customer'}`;
      case 'status_changed':
        return `Status changed to "${act.new_value?.status}"`;
      case 'agent_assigned':
        return `Agent assigned`;
      case 'priority_changed':
        return `Priority updated to "${act.new_value?.priority}"`;
      default:
        return `Updated by ${act.actor_name || 'User'}`;
    }
  };

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
      {activities.map((act) => (
        <div key={act.id} className="relative flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 z-10 shadow-xs">
            {getActivityIcon(act.activity_type)}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {formatActivityText(act)}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {act.created_at ? format(new Date(act.created_at), 'MMM d, yyyy h:mm a') : 'Recent'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

