import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './utils/database';
import analyticsRoutes from './routes/analyticsRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with database connection test
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      service: 'Analytics Service',
      database: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      service: 'Analytics Service',
      database: 'Disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Analytics Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      summary: 'GET /summary',
      topProducts: 'GET /products/top',
      spendingTrend: 'GET /spending-trend',
      priceFluctuation: 'GET /price-fluctuation/:productId',
      storesCompare: 'GET /stores/compare',
    },
  });
});

// Analytics routes
app.use('/', analyticsRoutes);

// Error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📊 Analytics Service running on port ${PORT}`);
  console.log(`📈 Environment: ${process.env.NODE_ENV}`);
});

export default app;
