import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { verifyFirebaseToken, verifyFirebaseTokenOnly, checkRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes (require authentication only)
router.post('/users', verifyFirebaseTokenOnly, userController.createUser);
router.get('/users/:uid', verifyFirebaseToken, userController.getUserByUid);
router.put('/users/:uid', verifyFirebaseToken, userController.updateUser);
router.delete('/users/:uid', verifyFirebaseToken, userController.deleteUser);

// Operator role management
router.post('/users/operator/request', verifyFirebaseToken, userController.requestOperatorRole);

// Admin only routes
router.get('/users', verifyFirebaseToken, checkRole(['admin']), userController.getAllUsers);
router.patch('/users/:uid/deactivate', verifyFirebaseToken, checkRole(['admin']), userController.deactivateUser);
router.patch('/users/:uid/role', verifyFirebaseToken, checkRole(['admin']), userController.updateUserRole);

export default router;
