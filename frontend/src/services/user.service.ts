import type { UserProfile, UpdateUserData } from '../types/user';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
  // Get authorization headers
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await authService.getIdToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Create user profile in database
  async createUserProfile(userData: {
    uid: string;
    email: string;
    fullName: string;
    phone: string;
  }): Promise<UserProfile> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user profile');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user profile');
    }
  }

  // Get user profile by ID
  async getUserProfile(uid: string): Promise<UserProfile> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/users/${uid}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user profile');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updateData: UpdateUserData): Promise<UserProfile> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/users/${uid}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user profile');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user profile');
    }
  }

  // Delete user profile
  async deleteUserProfile(uid: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/users/${uid}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user profile');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete user profile');
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }
}

export const userService = new UserService();
