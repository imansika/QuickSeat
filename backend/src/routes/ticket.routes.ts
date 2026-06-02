import express from 'express';
import { checkRole, verifyFirebaseToken } from '../middleware/auth.middleware';
import { downloadBookingTickets, resendBookingTickets, validateTicketQrCode } from '../controllers/ticket.controller';

const router = express.Router();

router.post('/tickets/validate', verifyFirebaseToken, checkRole(['operator', 'admin']), validateTicketQrCode);
router.get('/tickets/:bookingId/download', verifyFirebaseToken, downloadBookingTickets);
router.post('/tickets/:bookingId/resend', verifyFirebaseToken, resendBookingTickets);

export default router;