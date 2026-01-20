import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.admin';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const checkRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user from database to check role
      const { User } = require('../models/User.model');
      const user = await User.findOne({ uid: req.user.uid });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
