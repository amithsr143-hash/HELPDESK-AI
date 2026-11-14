import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  assignAgentSchema,
  createTicketResponseSchema
} from '../schemas/ticket.schema.js';
import { submitFeedbackSchema } from '../schemas/feedback.schema.js';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(createTicketSchema), ticketController.createTicket);
router.get('/', ticketController.listTickets);
router.get('/:id', ticketController.getTicket);
router.get('/:id/summary', ticketController.getAiSummary);
router.patch('/:id/status', authorize(['agent', 'admin', 'customer']), validateBody(updateTicketStatusSchema), ticketController.updateTicketStatus);
router.patch('/:id/assign', authorize(['agent', 'admin']), validateBody(assignAgentSchema), ticketController.assignAgent);
router.post('/:id/responses', validateBody(createTicketResponseSchema), ticketController.addResponse);
router.get('/:id/activity', ticketController.getActivity);
router.post('/:id/feedback', authorize(['customer']), validateBody(submitFeedbackSchema), ticketController.submitFeedback);

export default router;

