import * as kbService from '../services/knowledge-base.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

export const listPublished = async (req, res, next) => {
  try {
    const { query, category_id } = req.query;
    const articles = await kbService.getPublishedArticles(query, category_id);
    return sendSuccess(res, articles, 'Published articles retrieved');
  } catch (err) {
    next(err);
  }
};

export const listAdminAll = async (req, res, next) => {
  try {
    const { query, category_id } = req.query;
    const articles = await kbService.getAllArticlesAdmin(query, category_id);
    return sendSuccess(res, articles, 'All articles retrieved for admin');
  } catch (err) {
    next(err);
  }
};

export const getArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await kbService.getArticleById(id);
    if (!article) {
      return sendError(res, 'Article not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, article, 'Article retrieved');
  } catch (err) {
    next(err);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const article = await kbService.createArticle(req.body, req.user.id);
    return sendSuccess(res, article, 'Knowledge base article created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await kbService.updateArticle(id, req.body);
    if (!article) {
      return sendError(res, 'Article not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, article, 'Knowledge base article updated');
  } catch (err) {
    next(err);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await kbService.deleteArticle(id);
    if (!deleted) {
      return sendError(res, 'Article not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, null, 'Knowledge base article deleted');
  } catch (err) {
    next(err);
  }
};

