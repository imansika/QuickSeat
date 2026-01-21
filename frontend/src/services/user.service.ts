import type { UserProfile, UpdateUserData } from '../types/user';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    role?: 'user' | 'operator' | 'admin';
  }): Promise<UserProfile> {
    try {
      console.log('Creating user profile:', userData);
      const headers = await this.getAuthHeaders();
      console.log('API URL:', `${API_URL}/users`);
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const error = await response.json();
        console.error('Error response:', error);
        throw new Error(error.message || 'Failed to create user profile');
      }

      const result = await response.json();
      console.log('User profile created successfully:', result);
      return result;
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

  // Request operator role
  async requestOperatorRole(): Promise<{ message: string; user: UserProfile }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/users/operator/request`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request operator role');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to request operator role');
    }
  }
}

export const userService = new UserService();
