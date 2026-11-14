import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { updateProfileSchema } from '../schemas/auth.schema.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['customer', 'admin']));

router.get('/dashboard', customerController.getCustomerDashboard);
router.get('/profile', customerController.getCustomerProfile);
router.put('/profile', validateBody(updateProfileSchema), customerController.updateCustomerProfile);
router.get('/tickets', customerController.getCustomerTickets);
router.get('/notifications', notificationController.listNotifications);

export default router;

