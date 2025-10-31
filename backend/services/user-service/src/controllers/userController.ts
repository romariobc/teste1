import { Request, Response } from 'express';
import { findUserById, updateUser } from '../models/User';
import { updateUserSchema } from '../utils/validation';

/**
 * Get current user profile
 * GET /profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User ID comes from auth middleware
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Find user
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get user profile',
    });
  }
};

/**
 * Update current user profile
 * PUT /profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // User ID comes from auth middleware
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Validate input
    const validatedData = updateUserSchema.parse(req.body);

    // Check if there's anything to update
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No fields to update',
      });
    }

    // Update user
    const updatedUser = await updateUser(userId, validatedData);

    if (!updatedUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);

    // Validation error
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    // Duplicate email error
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email already in use',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not update profile',
    });
  }
};
