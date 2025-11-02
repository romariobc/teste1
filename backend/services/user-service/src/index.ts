import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import pool from './utils/database';
import { testEmailConfiguration } from './services/email.service';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'OK',
      service: 'User Service',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      service: 'User Service',
      database: 'Disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'User Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      register: 'POST /register',
      login: 'POST /login',
      profile: 'GET /profile (requires authentication)',
      updateProfile: 'PUT /profile (requires authentication)',
      forgotPassword: 'POST /forgot-password',
      validateResetToken: 'GET /reset-password/:token',
      resetPassword: 'POST /reset-password',
    },
  });
});

// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', passwordResetRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🔐 User Service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);

  // Test email configuration
  await testEmailConfiguration();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

export default app;
