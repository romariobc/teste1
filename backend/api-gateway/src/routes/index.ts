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
    // Headers que não devem ser repassados (hop-by-hop headers)
    const headersToSkip = [
      'host',
      'connection',
      'keep-alive',
      'transfer-encoding',
      'upgrade',
      'content-length', // Será recalculado pelo axios
    ];

    // Filtrar e preparar headers para proxy
    const proxyHeaders: Record<string, string> = {};

    Object.keys(req.headers).forEach((key) => {
      const lowerKey = key.toLowerCase();

      // Pular headers que não devem ser repassados
      if (headersToSkip.includes(lowerKey)) {
        return;
      }

      // Garantir que o valor seja string
      const value = req.headers[key];
      if (typeof value === 'string') {
        proxyHeaders[key] = value;
      } else if (Array.isArray(value)) {
        proxyHeaders[key] = value[0];
      }
    });

    // Log para debug (remover em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Proxy] ${req.method} ${req.path} -> ${serviceUrl}`);
      console.log('[Proxy] Authorization:', proxyHeaders.authorization ? 'Present' : 'Missing');
    }

    const response = await axios({
      method: req.method,
      url: `${serviceUrl}${req.path.replace('/api', '')}`,
      data: req.body,
      headers: proxyHeaders,
      params: req.query,
      // Não seguir redirects automaticamente
      maxRedirects: 0,
      // Validar status para não lançar erro em 4xx/5xx
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`[Proxy Error] ${serviceUrl}:`, error.message);

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
