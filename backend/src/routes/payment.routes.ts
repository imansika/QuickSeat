import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import {
  createPayment,
  getMyPayments,
  handlePayhereNotify,
  handlePayhereReturn,
  handlePayhereCancel,
  preparePayherePayment,
  updatePaymentStatus,
} from '../controllers/payment.controller';

const router = express.Router();

// Protected routes
router.post('/payments', verifyFirebaseToken, createPayment);
router.post('/payments/payhere/prepare', verifyFirebaseToken, preparePayherePayment);
router.post('/payments/notify', handlePayhereNotify);
router.get('/payments/return', handlePayhereReturn);
router.get('/payments/cancel', handlePayhereCancel);
router.get('/payments/me', verifyFirebaseToken, getMyPayments);
router.patch(
  '/payments/:id/status',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  updatePaymentStatus
);

export default router;
