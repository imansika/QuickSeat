import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import admin from '../config/firebase.admin';
import { User } from '../models/User.model';

export class AuthController {
  // Verify token and return user info
  async verifyToken(req: AuthRequest, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split('Bearer ')[1];

      // Verify the token with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get user from database
      const user = await User.findOne({ uid: decodedToken.uid });

      res.status(200).json({
        message: 'Token is valid',
        user: user ? {
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          photoURL: user.photoURL,
          role: user.role,
          isActive: user.isActive,
        } : {
          uid: decodedToken.uid,
          email: decodedToken.email,
        },
      });
    } catch (error: any) {
      console.error('Token verification error:', error);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  }

  // Get current authenticated user info
  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user from database
      const user = await User.findOne({ uid: req.user.uid });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        user: {
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          photoURL: user.photoURL,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: error.message || 'Failed to get user info' });
    }
  }

  // Revoke user tokens (logout from all devices)
  async revokeTokens(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Revoke all refresh tokens for the user
      await admin.auth().revokeRefreshTokens(req.user.uid);

      res.status(200).json({
        message: 'All tokens revoked successfully',
      });
    } catch (error: any) {
      console.error('Revoke tokens error:', error);
      res.status(500).json({ message: error.message || 'Failed to revoke tokens' });
    }
  }

  // Verify user email (admin only)
  async verifyEmail(req: AuthRequest, res: Response) {
    try {
      const { uid } = req.body;

      if (!uid || typeof uid !== 'string') {
        return res.status(400).json({ message: 'Valid User ID is required' });
      }

      // Update email verification status in Firebase
      await admin.auth().updateUser(uid, {
        emailVerified: true,
      });

      res.status(200).json({
        message: 'Email verified successfully',
      });
    } catch (error: any) {
      console.error('Verify email error:', error);
      res.status(500).json({ message: error.message || 'Failed to verify email' });
    }
  }

  // Delete user account (admin or self)
  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { uid } = req.params;

      if (!uid || typeof uid !== 'string') {
        return res.status(400).json({ message: 'Valid User ID is required' });
      }

      // Check authorization: users can only delete their own account unless admin
      const requestingUser = await User.findOne({ uid: req.user.uid });
      if (req.user.uid !== uid && requestingUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own account' });
      }

      // Delete user from Firebase Authentication
      await admin.auth().deleteUser(uid);

      // Delete user from database
      await User.findOneAndDelete({ uid });

      res.status(200).json({
        message: 'Account deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: error.message || 'Failed to delete account' });
    }
  }
}

export const authController = new AuthController();
