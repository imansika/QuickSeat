import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import {
  setAvailability,
  getAvailabilityByDate,
  getOperatorAvailability,
  deleteAvailability,
} from '../controllers/availability.controller';

const router = express.Router();

// Protected routes (require operator authentication)
router.post('/availability', verifyFirebaseToken, checkRole(['operator', 'admin']), setAvailability); // Create/update availability
router.get('/availability', verifyFirebaseToken, checkRole(['operator', 'admin']), getAvailabilityByDate); // Get availability by date
router.get('/availability/all', verifyFirebaseToken, checkRole(['operator', 'admin']), getOperatorAvailability); // Get all operator's availability
router.delete('/availability/:id', verifyFirebaseToken, checkRole(['operator', 'admin']), deleteAvailability); // Delete availability record

export default router;
