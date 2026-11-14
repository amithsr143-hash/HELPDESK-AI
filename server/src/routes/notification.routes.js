import { Router } from 'express';
import * as notifController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', notifController.listNotifications);
router.patch('/:id/read', notifController.markAsRead);
router.patch('/read-all', notifController.markAllAsRead);

export default router;

