import { query } from '../utils/database';
import { hashPassword } from '../utils/password';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new user
 */
export const createUser = async (input: CreateUserInput): Promise<UserResponse> => {
  const { email, password, name } = input;

  // Hash password
  const passwordHash = await hashPassword(password);

  const result = await query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [email, passwordHash, name]
  );

  return result.rows[0];
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, email, password_hash, name, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string): Promise<UserResponse | null> => {
  const result = await query(
    `SELECT id, email, name, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Update user
 */
export const updateUser = async (
  id: string,
  updates: { name?: string; email?: string }
): Promise<UserResponse | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name) {
    fields.push(`name = $${paramCount}`);
    values.push(updates.name);
    paramCount++;
  }

  if (updates.email) {
    fields.push(`email = $${paramCount}`);
    values.push(updates.email);
    paramCount++;
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);

  const result = await query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING id, email, name, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await query(`DELETE FROM users WHERE id = $1`, [id]);
  return (result.rowCount || 0) > 0;
};

/**
 * Check if email exists
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const result = await query(
    `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists`,
    [email]
  );
  return result.rows[0].exists;
};
