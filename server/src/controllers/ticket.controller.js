import * as ticketService from '../services/ticket.service.js';
import { generateTicketSummary } from '../services/summary.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user.id);
    return sendSuccess(res, ticket, 'Ticket created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const listTickets = async (req, res, next) => {
  try {
    const { status, priority, category_id, search, page = 1, limit = 20 } = req.query;
    const result = await ticketService.getTickets({
      user: req.user,
      status,
      priority,
      categoryId: category_id,
      search,
      page: Number(page),
      limit: Number(limit)
    });
    return sendSuccess(res, result.tickets, 'Tickets retrieved successfully', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (err) {
    next(err);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await ticketService.getTicketById(id, req.user);
    if (!ticket) {
      return sendError(res, 'Ticket not found or access denied', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, ticket, 'Ticket details retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;
    const updated = await ticketService.updateTicketStatus(id, status, resolution_notes, req.user);
    if (!updated) {
      return sendError(res, 'Ticket not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, updated, `Ticket status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

export const assignAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;
    const updated = await ticketService.assignAgent(id, agent_id, req.user);
    if (!updated) {
      return sendError(res, 'Ticket not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, updated, 'Ticket agent assigned successfully');
  } catch (err) {
    next(err);
  }
};

export const addResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, is_internal, status_update } = req.body;
    const response = await ticketService.addTicketResponse(
      id,
      { message, is_internal, status_update },
      req.user
    );
    return sendSuccess(res, response, 'Response posted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await ticketService.getTicketById(id, req.user);
    if (!ticket) {
      return sendError(res, 'Ticket not found or access denied', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, ticket.activity, 'Ticket activity history retrieved');
  } catch (err) {
    next(err);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const feedback = await ticketService.submitFeedback(id, { rating, comment }, req.user.id);
    return sendSuccess(res, feedback, 'Feedback submitted successfully', 201);
  } catch (err) {
    return sendError(res, err.message, 400, 'FEEDBACK_ERROR');
  }
};

export const getAiSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await ticketService.getTicketById(id, req.user);
    if (!ticket) {
      return sendError(res, 'Ticket not found', 404, 'NOT_FOUND');
    }
    const summary = await generateTicketSummary(ticket.subject, ticket.description, ticket.responses || []);
    return sendSuccess(res, summary, 'AI Ticket summary generated');
  } catch (err) {
    next(err);
  }
};

