import { Request, Response } from 'express';
import { forgotPasswordSchema, resetPasswordSchema } from '../utils/validation';
import { findUserByEmail } from '../models/User';
import {
  createPasswordResetToken,
  findValidToken,
  findTokenByValue,
  markTokenAsUsed,
  invalidateUserTokens,
  countActiveTokensForUser,
} from '../models/PasswordResetToken';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../services/email.service';
import { hashPassword } from '../utils/password';
import { query } from '../utils/database';

/**
 * Request password reset
 * POST /forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    // Find user by email
    const user = await findUserByEmail(email);

    // SECURITY: Always return same message whether user exists or not
    // This prevents email enumeration attacks
    const successMessage = {
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação.',
    };

    // If user doesn't exist, still return success (but don't send email)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json(successMessage);
    }

    // Check if user has too many active tokens (prevent spam)
    const activeTokenCount = await countActiveTokensForUser(user.id);
    if (activeTokenCount >= 3) {
      console.log(`User ${user.id} has too many active reset tokens`);
      // Still return success message for security
      return res.status(200).json(successMessage);
    }

    // Create password reset token
    const resetToken = await createPasswordResetToken({
      userId: user.id,
      expiresInHours: 1, // Token expires in 1 hour
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken.token
    );

    if (!emailSent) {
      console.error(`Failed to send password reset email to ${user.email}`);
      // Still return success for security, but log the error
    } else {
      console.log(`Password reset email sent to ${user.email}`);
    }

    return res.status(200).json(successMessage);
  } catch (error: any) {
    console.error('Forgot password error:', error);

    // Validation error
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not process password reset request',
    });
  }
};

/**
 * Validate reset token
 * GET /reset-password/:token
 */
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token is required',
        valid: false,
      });
    }

    // Check if token exists and is valid
    const resetToken = await findValidToken(token);

    if (!resetToken) {
      // Check if token exists at all (to give more specific error)
      const anyToken = await findTokenByValue(token);

      if (!anyToken) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Token inválido',
          valid: false,
        });
      }

      // Token exists but is expired or used
      if (anyToken.used) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Este token já foi utilizado',
          valid: false,
        });
      }

      if (new Date(anyToken.expires_at) < new Date()) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Este token expirou. Solicite uma nova recuperação de senha.',
          valid: false,
        });
      }

      // Shouldn't reach here, but just in case
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token inválido',
        valid: false,
      });
    }

    // Token is valid
    return res.status(200).json({
      message: 'Token válido',
      valid: true,
    });
  } catch (error: any) {
    console.error('Validate token error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not validate token',
      valid: false,
    });
  }
};

/**
 * Reset password
 * POST /reset-password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = resetPasswordSchema.parse(req.body);
    const { token, password } = validatedData;

    // Find and validate token
    const resetToken = await findValidToken(token);

    if (!resetToken) {
      // Check if token exists to provide specific error
      const anyToken = await findTokenByValue(token);

      if (!anyToken) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Token inválido',
        });
      }

      if (anyToken.used) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Este token já foi utilizado',
        });
      }

      if (new Date(anyToken.expires_at) < new Date()) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Este token expirou. Solicite uma nova recuperação de senha.',
        });
      }

      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token inválido',
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user's password
    await query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await markTokenAsUsed(token);

    // Invalidate all other tokens for this user
    await invalidateUserTokens(resetToken.user_id);

    // Get user info for confirmation email
    const userResult = await query(
      `SELECT email, name FROM users WHERE id = $1`,
      [resetToken.user_id]
    );

    const user = userResult.rows[0];

    // Send confirmation email (optional, don't block on failure)
    if (user) {
      sendPasswordChangedEmail(user.email, user.name).catch((error) => {
        console.error('Failed to send password changed confirmation email:', error);
      });
    }

    console.log(`Password reset successful for user ${resetToken.user_id}`);

    return res.status(200).json({
      message: 'Senha redefinida com sucesso',
      success: true,
    });
  } catch (error: any) {
    console.error('Reset password error:', error);

    // Validation error
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not reset password',
    });
  }
};
