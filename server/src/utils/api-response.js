/**
 * Standardized API response format conforming to Section 12.9
 */

export const sendSuccess = (res, data = {}, message = 'Operation completed successfully', statusCode = 200, meta = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    details
  });
};

