import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import {
  createBooking,
  getBookedSeatsByBusAndDate,
  getTripPassengerDetails,
  getMyPastBookings,
  getMyBookings,
  getMyUpcomingBookings,
  updateBookingStatus,
} from '../controllers/booking.controller';

const router = express.Router();

// Protected routes
router.post('/bookings', verifyFirebaseToken, createBooking);
router.get('/bookings/seats', verifyFirebaseToken, getBookedSeatsByBusAndDate);
router.get('/bookings/trip-passengers', verifyFirebaseToken, checkRole(['operator', 'admin']), getTripPassengerDetails);
router.get('/bookings/me', verifyFirebaseToken, getMyBookings);
router.get('/bookings/me/upcoming', verifyFirebaseToken, getMyUpcomingBookings);
router.get('/bookings/me/past', verifyFirebaseToken, getMyPastBookings);
router.patch(
  '/bookings/:id/status',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  updateBookingStatus
);

export default router;
