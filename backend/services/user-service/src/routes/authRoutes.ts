import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

/**
 * POST /register
 * Register a new user
 */
router.post('/register', register);

/**
 * POST /login
 * Login user
 */
router.post('/login', login);

export default router;
