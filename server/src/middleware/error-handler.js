import { sendError } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method
  }, 'Unhandled Exception caught by centralized error handler');

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation Error', 400, 'VALIDATION_ERROR', err.errors);
  }

  if (err.statusCode) {
    return sendError(res, err.message, err.statusCode, err.code || 'REQUEST_FAILED', err.details || null);
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message,
    500,
    'INTERNAL_SERVER_ERROR'
  );
};

