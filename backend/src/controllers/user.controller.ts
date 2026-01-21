import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
  // Create user profile
  async createUser(req: AuthRequest, res: Response) {
    try {
      const { uid, email, fullName, phone, role } = req.body;
      console.log('Received user creation request:', { uid, email, fullName, phone, role });

      // Check if user already exists
      const existingUser = await User.findOne({ uid });
      if (existingUser) {
        console.log('User already exists:', uid);
        return res.status(400).json({ message: 'User already exists' });
      }

      // Validate role
      const validRoles = ['user', 'operator', 'admin'];
      const userRole = role && validRoles.includes(role) ? role : 'user';

      const user = new User({
        uid,
        email,
        fullName,
        phone,
        role: userRole,
      });

      await user.save();
      console.log('User created successfully in MongoDB:', user.uid);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          photoURL: user.photoURL,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({ message: error.message || 'Failed to create user' });
    }
  }

  // Get user by UID
  async getUserByUid(req: AuthRequest, res: Response) {
    try {
      const { uid } = req.params;

      // Check authorization: users can only access their own data unless admin
      if (req.user?.uid !== uid && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        photoURL: user.photoURL,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch user' });
    }
  }

  // Update user profile
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { uid } = req.params;
      const { fullName, phone, photoURL } = req.body;

      // Check authorization: users can only update their own data unless admin
      if (req.user?.uid !== uid && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const user = await User.findOneAndUpdate(
        { uid },
        {
          ...(fullName && { fullName }),
          ...(phone && { phone }),
          ...(photoURL !== undefined && { photoURL }),
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User updated successfully',
        user: {
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          photoURL: user.photoURL,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ message: error.message || 'Failed to update user' });
    }
  }

  // Delete user
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { uid } = req.params;

      // Check authorization: users can only delete their own account unless admin
      if (req.user?.uid !== uid && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const user = await User.findOneAndDelete({ uid });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: error.message || 'Failed to delete user' });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await User.find({ isActive: true }).select('-__v');

      res.status(200).json({
        count: users.length,
        users: users.map(user => ({
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          photoURL: user.photoURL,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      });
    } catch (error: any) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch users' });
    }
  }

  // Soft delete / deactivate user
  async deactivateUser(req: AuthRequest, res: Response) {
    try {
      const { uid } = req.params;

      // Only admin can deactivate users
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const user = await User.findOneAndUpdate(
        { uid },
        { isActive: false },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User deactivated successfully',
      });
    } catch (error: any) {
      console.error('Deactivate user error:', error);
      res.status(500).json({ message: error.message || 'Failed to deactivate user' });
    }
  }

  // Request operator role
  async requestOperatorRole(req: AuthRequest, res: Response) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'operator') {
        return res.status(400).json({ message: 'User is already an operator' });
      }

      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Admin cannot request operator role' });
      }

      // Update role to operator
      user.role = 'operator';
      await user.save();

      res.status(200).json({
        message: 'Operator role granted successfully',
        user: {
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error('Request operator role error:', error);
      res.status(500).json({ message: error.message || 'Failed to request operator role' });
    }
  }

  // Update user role (admin only)
  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { uid } = req.params;
      const { role } = req.body;

      // Only admin can update roles
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const validRoles = ['user', 'operator', 'admin'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      const user = await User.findOneAndUpdate(
        { uid },
        { role },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User role updated successfully',
        user: {
          uid: user.uid,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: error.message || 'Failed to update user role' });
    }
  }
}

export const userController = new UserController();
