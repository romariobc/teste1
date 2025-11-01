import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../utils/validation';
import { createUser, findUserByEmail, emailExists } from '../models/User';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

/**
 * Register a new user
 * POST /register
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Check if email already exists
    const exists = await emailExists(validatedData.email);
    if (exists) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await createUser(validatedData);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user and token
    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);

    // Validation error
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    // Database error
    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email already registered',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not register user',
    });
  }
};

/**
 * Login user
 * POST /login
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const user = await findUserByEmail(validatedData.email);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password_hash!
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user and token (without password hash)
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);

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
      message: 'Could not login',
    });
  }
};
