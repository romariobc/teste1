import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

/**
 * GET /profile
 * Get current user profile
 */
router.get('/profile', getProfile);

/**
 * PUT /profile
 * Update current user profile
 */
router.put('/profile', updateProfile);

export default router;
