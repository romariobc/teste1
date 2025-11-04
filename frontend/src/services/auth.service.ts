import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth.types';

/**
 * Auth Service
 * Handles all authentication-related API calls
 */

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/api/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/api/users/profile', data);
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post('/api/auth/forgot-password', { email });
  },

  /**
   * Validate password reset token
   */
  async validateResetToken(token: string): Promise<boolean> {
    try {
      const response = await api.get(`/api/auth/reset-password/${token}`);
      return response.data.valid === true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token inválido ou expirado');
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    const response = await api.post('/api/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });
    return response.data;
  },
};
