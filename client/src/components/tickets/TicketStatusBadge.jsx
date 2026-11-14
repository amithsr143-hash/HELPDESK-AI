import React from 'react';
import { Badge } from '../common/Badge';

export const TicketStatusBadge = ({ status }) => {
  const configs = {
    open: { label: 'Open', variant: 'info' },
    assigned: { label: 'Assigned', variant: 'primary' },
    in_progress: { label: 'In Progress', variant: 'warning' },
    waiting_for_customer: { label: 'Waiting for Customer', variant: 'default' },
    resolved: { label: 'Resolved', variant: 'success' },
    closed: { label: 'Closed', variant: 'default' }
  };

  const conf = configs[status] || { label: status || 'Unknown', variant: 'default' };

  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const TicketPriorityBadge = ({ priority }) => {
  const configs = {
    low: { label: 'Low', variant: 'default' },
    medium: { label: 'Medium', variant: 'info' },
    high: { label: 'High', variant: 'warning' },
    urgent: { label: 'Urgent', variant: 'danger' }
  };

  const conf = configs[priority] || { label: priority || 'Medium', variant: 'default' };

  return (
    <Badge variant={conf.variant} className="font-semibold uppercase tracking-wider">
      {conf.label}
    </Badge>
  );
};

