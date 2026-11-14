import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { apiRateLimiter } from './middleware/rate-limiter.js';
import { errorHandler } from './middleware/error-handler.js';
import { sendError } from './utils/api-response.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import customerRoutes from './routes/customer.routes.js';
import agentRoutes from './routes/agent.routes.js';
import adminRoutes from './routes/admin.routes.js';
import kbRoutes from './routes/knowledge-base.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import categoryRoutes from './routes/category.routes.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/api/v1/health'
      }
    })
  );
}

// Request parsers
app.use(express.json({ limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));

// Rate limiting for API protection
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HELPDESK AI API',
    version: '1.0.0'
  });
});

// Mount modular REST API routes (both /api/v1 and root aliases)
app.use(['/api/v1/auth', '/auth'], authRoutes);
app.use(['/api/v1/chat', '/chat'], chatRoutes);
app.use(['/api/v1/tickets', '/tickets'], ticketRoutes);
app.use(['/api/v1/customers', '/customers'], customerRoutes);
app.use(['/api/v1/agents', '/agents'], agentRoutes);
app.use(['/api/v1/admin', '/admin'], adminRoutes);
app.use(['/api/v1/knowledge-base', '/knowledge-base'], kbRoutes);
app.use(['/api/v1/notifications', '/notifications'], notificationRoutes);
app.use(['/api/v1/categories', '/categories'], categoryRoutes);

// 404 Route Not Found handler
app.use((req, res) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;

