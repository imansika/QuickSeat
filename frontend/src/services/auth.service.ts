import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase';
import type { CreateUserData } from '../types/user';

class AuthService {
  // Sign up with email and password
  async signUp(userData: CreateUserData): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

    
      await updateProfile(userCredential.user, {
        displayName: userData.fullName,
      });

      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  }

  // email and password
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  }


  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  
  // Update user profile
  async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in');
      }

      await updateProfile(auth.currentUser, {
        displayName,
        ...(photoURL && { photoURL }),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Update user email
  async updateUserEmail(newEmail: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in');
      }

      await updateEmail(auth.currentUser, newEmail);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update email');
    }
  }

  // Update user password
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in');
      }

      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Get ID token
  async getIdToken(): Promise<string | null> {
    try {
      if (!auth.currentUser) {
        return null;
      }
      return await auth.currentUser.getIdToken();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get ID token');
    }
  }
}

export const authService = new AuthService();
