import * as categoryService from '../services/category.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const listCategories = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoryService.listCategories({ includeInactive });
    return sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (err) {
    next(err);
  }
};


export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 'Category not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, updated, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const success = await categoryService.deleteCategory(req.params.id);
    if (!success) {
      return sendError(res, 'Category not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, { id: req.params.id }, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
};
