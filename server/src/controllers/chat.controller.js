import * as chatService from '../services/chat.service.js';
import * as ticketService from '../services/ticket.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { conversation_id, message } = req.body;
    const result = await chatService.processChatMessage({
      customerId: req.user.id,
      conversationId: conversation_id,
      messageText: message
    });
    return sendSuccess(res, result, 'Message processed successfully');
  } catch (err) {
    next(err);
  }
};

export const listConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getCustomerConversations(req.user.id);
    return sendSuccess(res, conversations, 'Conversations retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await chatService.getConversationById(id, req.user.id, req.user.role);
    if (!conversation) {
      return sendError(res, 'Conversation not found or access denied', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, conversation, 'Conversation details retrieved');
  } catch (err) {
    next(err);
  }
};

export const escalateToTicket = async (req, res, next) => {
  try {
    const { conversation_id, subject, description, category_id, priority } = req.body;

    const ticket = await ticketService.createTicket(
      {
        subject,
        description,
        category_id,
        priority
      },
      req.user.id
    );

    return sendSuccess(
      res,
      ticket,
      `Your support ticket #${ticket.ticket_number} has been created and escalated to our specialist team.`,
      201
    );
  } catch (err) {
    next(err);
  }
};

