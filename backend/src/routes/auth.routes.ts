import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';

const router = Router();

// Public auth routes
router.post('/verify', authController.verifyToken);

// Protected routes (require authentication)
router.get('/me', verifyFirebaseToken, authController.getCurrentUser);
router.post('/revoke', verifyFirebaseToken, authController.revokeTokens);
router.delete('/account/:uid', verifyFirebaseToken, authController.deleteAccount);

// Admin only routes
router.post('/verify-email', verifyFirebaseToken, checkRole(['admin']), authController.verifyEmail);

export default router;
