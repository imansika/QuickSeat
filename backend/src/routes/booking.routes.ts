import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import {
  createBooking,
  getBookedSeatsByBusAndDate,
  getMyBookings,
  updateBookingStatus,
} from '../controllers/booking.controller';

const router = express.Router();

// Protected routes
router.post('/bookings', verifyFirebaseToken, createBooking);
router.get('/bookings/seats', verifyFirebaseToken, getBookedSeatsByBusAndDate);
router.get('/bookings/me', verifyFirebaseToken, getMyBookings);
router.patch(
  '/bookings/:id/status',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  updateBookingStatus
);

export default router;
