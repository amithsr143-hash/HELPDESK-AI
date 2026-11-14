import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// List active categories (accessible to all authenticated users)
router.get('/', categoryController.listCategories);

// Category Management (Admin only)
router.post('/', authorize(['admin']), categoryController.createCategory);
router.put('/:id', authorize(['admin']), categoryController.updateCategory);
router.delete('/:id', authorize(['admin']), categoryController.deleteCategory);

export default router;

