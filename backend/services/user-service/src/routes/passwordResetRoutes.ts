import { Router } from 'express';
import {
  forgotPassword,
  validateResetToken,
  resetPassword,
} from '../controllers/passwordResetController';

const router = Router();

/**
 * Password reset routes (all public - no auth required)
 */

// Request password reset
router.post('/forgot-password', forgotPassword);

// Validate reset token
router.get('/reset-password/:token', validateResetToken);

// Reset password with token
router.post('/reset-password', resetPassword);

export default router;
