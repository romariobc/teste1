import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Service URLs from environment
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3004';
const RECEIPT_SERVICE_URL = process.env.RECEIPT_SERVICE_URL || 'http://localhost:3001';
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3003';

// Helper function to proxy requests
const proxyRequest = async (req: Request, res: Response, serviceUrl: string) => {
  try {
    // Build headers, explicitly including authorization
    const headers: Record<string, string> = {
      'content-type': req.headers['content-type'] || 'application/json',
    };

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    const response = await axios({
      method: req.method,
      url: `${serviceUrl}${req.path.replace('/api', '')}`,
      data: req.body,
      headers,
      params: req.query,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`Error proxying to ${serviceUrl}:`, error.message);

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(503).json({
        error: 'Service Unavailable',
        message: `Could not reach ${serviceUrl}`,
      });
    }
  }
};

// Auth routes (User Service) - Public
router.post('/auth/register', (req, res) => proxyRequest(req, res, USER_SERVICE_URL));
router.post('/auth/login', (req, res) => proxyRequest(req, res, USER_SERVICE_URL));

// Password reset routes (User Service) - Public
router.post('/auth/forgot-password', (req, res) => proxyRequest(req, res, USER_SERVICE_URL));
router.get('/auth/reset-password/:token', (req, res) => proxyRequest(req, res, USER_SERVICE_URL));
router.post('/auth/reset-password', (req, res) => proxyRequest(req, res, USER_SERVICE_URL));

// User routes (User Service) - Protected
router.use('/users', authMiddleware);
router.all('/users*', (req, res) => proxyRequest(req, res, USER_SERVICE_URL));

// Receipt routes (Receipt Service) - Protected
router.use('/receipts', authMiddleware);
router.all('/receipts*', (req, res) => proxyRequest(req, res, RECEIPT_SERVICE_URL));

// Product routes (Products Service) - Protected
router.use('/products', authMiddleware);
router.all('/products*', (req, res) => proxyRequest(req, res, PRODUCTS_SERVICE_URL));

// Analytics routes (Analytics Service) - Protected
router.use('/analytics', authMiddleware);
router.all('/analytics*', (req, res) => proxyRequest(req, res, ANALYTICS_SERVICE_URL));

export default router;
