import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, validateBody(updateProfileSchema), authController.updateProfile);

export default router;

