import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import type { User, UserProfile, CreateUserData, UpdateUserData } from '../types/user';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (userData: CreateUserData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updateData: UpdateUserData) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile from database
  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await userService.getUserProfile(uid);
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Failed to load user profile:', err.message);
      // Profile might not exist yet, which is okay
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up
  const signUp = async (userData: CreateUserData) => {
    try {
      setError(null);
      setLoading(true);
      
      const user = await authService.signUp(userData);
      
      // Create user profile in database
      const profile = await userService.createUserProfile({
        uid: user.uid,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
      });
      
      setUserProfile(profile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.signIn(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const user = await authService.signInWithGoogle();
      
      // Try to load profile, create if doesn't exist
      try {
        const profile = await userService.getUserProfile(user.uid);
        setUserProfile(profile);
      } catch {
        // Create profile if it doesn't exist
        const profile = await userService.createUserProfile({
          uid: user.uid,
          email: user.email || '',
          fullName: user.displayName || '',
          phone: user.phoneNumber || '',
        });
        setUserProfile(profile);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const user = await authService.signInWithFacebook();
      
      // Try to load profile, create if doesn't exist
      try {
        const profile = await userService.getUserProfile(user.uid);
        setUserProfile(profile);
      } catch {
        // Create profile if it doesn't exist
        const profile = await userService.createUserProfile({
          uid: user.uid,
          email: user.email || '',
          fullName: user.displayName || '',
          phone: user.phoneNumber || '',
        });
        setUserProfile(profile);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Update profile
  const updateProfile = async (updateData: UpdateUserData) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      // Update Firebase profile if displayName is being updated
      if (updateData.fullName) {
        await authService.updateUserProfile(updateData.fullName, updateData.photoURL);
      }

      // Update profile in database
      const updatedProfile = await userService.updateUserProfile(
        currentUser.uid,
        updateData
      );
      
      setUserProfile(updatedProfile);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update email
  const updateEmail = async (newEmail: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.updateUserEmail(newEmail);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.updateUserPassword(newPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      // Delete user profile from database
      await userService.deleteUserProfile(currentUser.uid);
      
      // Delete Firebase auth account
      await currentUser.delete();
      
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
