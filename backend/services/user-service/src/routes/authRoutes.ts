import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

/**
 * POST /register
 * POST /auth/register
 * Register a new user
 */
router.post('/register', register);
router.post('/auth/register', register);

/**
 * POST /login
 * POST /auth/login
 * Login user
 */
router.post('/login', login);
router.post('/auth/login', login);

export default router;
