import { sendError } from '../utils/api-response.js';

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errorMessages);
  }
  req.body = result.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errorMessages = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    return sendError(res, 'Query validation failed', 400, 'VALIDATION_ERROR', errorMessages);
  }
  req.query = result.data;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const errorMessages = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    return sendError(res, 'Parameter validation failed', 400, 'VALIDATION_ERROR', errorMessages);
  }
  req.params = result.data;
  next();
};

