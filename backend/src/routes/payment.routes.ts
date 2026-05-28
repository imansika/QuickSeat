import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import {
  createPayment,
  getMyPayments,
  updatePaymentStatus,
} from '../controllers/payment.controller';

const router = express.Router();

// Protected routes
router.post('/payments', verifyFirebaseToken, createPayment);
router.get('/payments/me', verifyFirebaseToken, getMyPayments);
router.patch(
  '/payments/:id/status',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  updatePaymentStatus
);

export default router;
