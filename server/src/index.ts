import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.isDev ? false : undefined,
  crossOriginEmbedderPolicy: false,
}));

// CORS — restrict origins in production
app.use(cors({
  origin: config.isDev
    ? true // Allow all in development
    : (process.env.CORS_ORIGIN || 'https://gigdrive.app').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Global rate limit — 100 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
}));

app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api/v1', routes);

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`GigDrive API running on port ${config.port}`);
});

export default app;
