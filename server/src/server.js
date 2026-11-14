import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(` HELPDESK AI Backend Server running on port ${PORT}`);
  logger.info(` Environment: ${env.NODE_ENV}`);
  logger.info(` Health endpoint: http://localhost:${PORT}/api/v1/health`);
  logger.info(` API Base URL:    http://localhost:${PORT}/api/v1`);
  logger.info(`=======================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Closing HTTP server gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

