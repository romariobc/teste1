import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'Receipt Service',
    timestamp: new Date().toISOString(),
  });
});

// Placeholder routes (will be implemented in Phase 3)
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Receipt Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      upload: 'POST /upload (coming in Phase 3)',
      list: 'GET / (coming in Phase 3)',
      details: 'GET /:id (coming in Phase 3)',
    },
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
app.listen(PORT, () => {
  console.log(`🧾 Receipt Service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
