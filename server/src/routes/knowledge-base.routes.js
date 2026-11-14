import { Router } from 'express';
import * as kbController from '../controllers/knowledge-base.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { createKnowledgeBaseSchema, updateKnowledgeBaseSchema } from '../schemas/knowledge-base.schema.js';

const router = Router();

// Publicly readable articles
router.get('/', kbController.listPublished);
router.get('/articles/:id', kbController.getArticle);

// Admin article management
router.get('/admin/all', authenticate, authorize(['admin']), kbController.listAdminAll);
router.post('/admin', authenticate, authorize(['admin']), validateBody(createKnowledgeBaseSchema), kbController.createArticle);
router.put('/admin/:id', authenticate, authorize(['admin']), validateBody(updateKnowledgeBaseSchema), kbController.updateArticle);
router.delete('/admin/:id', authenticate, authorize(['admin']), kbController.deleteArticle);

export default router;

