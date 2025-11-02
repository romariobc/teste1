import { query } from '../utils/database';
import crypto from 'crypto';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface CreateTokenInput {
  userId: string;
  expiresInHours?: number; // Default: 1 hour
}

/**
 * Generate a cryptographically secure random token
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new password reset token
 */
export const createPasswordResetToken = async (
  input: CreateTokenInput
): Promise<PasswordResetToken> => {
  const { userId, expiresInHours = 1 } = input;

  // Generate secure random token
  const token = generateSecureToken();

  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const result = await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token, expires_at, used, created_at`,
    [userId, token, expiresAt]
  );

  return result.rows[0];
};

/**
 * Find a valid password reset token (not expired, not used)
 */
export const findValidToken = async (
  token: string
): Promise<PasswordResetToken | null> => {
  const result = await query(
    `SELECT id, user_id, token, expires_at, used, created_at
     FROM password_reset_tokens
     WHERE token = $1
       AND used = FALSE
       AND expires_at > NOW()`,
    [token]
  );

  return result.rows[0] || null;
};

/**
 * Find any token (even if expired or used) - for validation messages
 */
export const findTokenByValue = async (
  token: string
): Promise<PasswordResetToken | null> => {
  const result = await query(
    `SELECT id, user_id, token, expires_at, used, created_at
     FROM password_reset_tokens
     WHERE token = $1`,
    [token]
  );

  return result.rows[0] || null;
};

/**
 * Mark a token as used
 */
export const markTokenAsUsed = async (token: string): Promise<boolean> => {
  const result = await query(
    `UPDATE password_reset_tokens
     SET used = TRUE
     WHERE token = $1`,
    [token]
  );

  return (result.rowCount || 0) > 0;
};

/**
 * Invalidate all tokens for a user (mark as used)
 * Useful when password is successfully reset
 */
export const invalidateUserTokens = async (userId: string): Promise<number> => {
  const result = await query(
    `UPDATE password_reset_tokens
     SET used = TRUE
     WHERE user_id = $1 AND used = FALSE`,
    [userId]
  );

  return result.rowCount || 0;
};

/**
 * Delete expired tokens (cleanup function)
 * Should be called periodically to keep table clean
 */
export const deleteExpiredTokens = async (): Promise<number> => {
  const result = await query(
    `DELETE FROM password_reset_tokens
     WHERE expires_at < NOW()`,
    []
  );

  return result.rowCount || 0;
};

/**
 * Count active tokens for a user
 * Useful to prevent spam/abuse
 */
export const countActiveTokensForUser = async (userId: string): Promise<number> => {
  const result = await query(
    `SELECT COUNT(*) as count
     FROM password_reset_tokens
     WHERE user_id = $1
       AND used = FALSE
       AND expires_at > NOW()`,
    [userId]
  );

  return parseInt(result.rows[0].count, 10);
};
