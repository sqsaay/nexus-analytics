import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandlerMiddleware';
import { setupSwagger } from './docs/swaggerDocs';

const app = express();

// Security Header Hardening via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for Swagger UI compatibility
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' }, // Clickjacking protection
    noSniff: true, // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true, // X-XSS-Protection header
    hidePoweredBy: true, // Removes X-Powered-By header
  })
);

// Strict CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.CORS_ORIGIN,
        'http://localhost:3000',
        'http://localhost:5173',
      ];
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation: Origin not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global API Rate Limiting (Anti-DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded. Please try again later.' },
});
app.use('/api', limiter);

// Payload Size Limiting (Anti-Decompression / Oversized payload DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Swagger OpenAPI Documentation
setupSwagger(app);

// API Routes
app.use('/api', routes);

// Root Endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'NexusAnalytics REST API Suite',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: 'http://localhost:5000/api-docs',
    healthCheck: 'http://localhost:5000/health',
    frontendApp: 'http://localhost:3000',
  });
});

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'NexusAnalytics API Service',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
