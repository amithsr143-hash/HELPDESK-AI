import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as ticketController from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { updateUserRoleSchema, updateUserStatusSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

router.use(authenticate);

// Allow both admin and agent to view directory / users
router.get('/users', authorize(['admin', 'agent']), adminController.listUsers);

// Admin-only operations
router.use(authorize(['admin']));

router.get('/dashboard', adminController.getAdminDashboard);
router.patch('/users/:id/role', validateBody(updateUserRoleSchema), adminController.updateUserRole);
router.patch('/users/:id/status', validateBody(updateUserStatusSchema), adminController.updateUserStatus);
router.get('/agents', adminController.listAgents);
router.post('/agents', validateBody(registerSchema), adminController.createAgent);
router.get('/tickets', ticketController.listTickets);
router.get('/analytics', adminController.getAIAnalytics);


export default router;

