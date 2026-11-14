import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import { chatMessageSchema, escalateChatSchema } from '../schemas/chat.schema.js';

const router = Router();

router.use(authenticate);

router.post('/message', validateBody(chatMessageSchema), chatController.sendMessage);
router.get('/conversations', chatController.listConversations);
router.get('/conversations/:id', chatController.getConversation);
router.post('/escalate', validateBody(escalateChatSchema), chatController.escalateToTicket);

export default router;

