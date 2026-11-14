import { Router } from 'express';
import * as agentController from '../controllers/agent.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['agent', 'admin']));

router.get('/dashboard', agentController.getAgentDashboard);
router.get('/tickets', agentController.getAgentTickets);
router.get('/performance', agentController.getAgentPerformance);
router.get('/customers', agentController.listCustomers);
router.get('/customers/:id', agentController.getCustomerInfo);


export default router;

