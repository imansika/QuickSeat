import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import {
  registerBus,
  getOperatorBuses,
  getBusById,
  updateBus,
  deleteBus,
  searchBuses,
} from '../controllers/bus.controller';

const router = express.Router();

// Public routes
router.get('/buses/search', searchBuses); // Search buses (for passengers)

// Protected routes (require operator authentication)
router.post('/buses', verifyFirebaseToken, checkRole(['operator', 'admin']), registerBus); // Register a new bus
router.get('/buses', verifyFirebaseToken, checkRole(['operator', 'admin']), getOperatorBuses); // Get all operator's buses
router.get('/buses/:id', verifyFirebaseToken, checkRole(['operator', 'admin']), getBusById); // Get single bus
router.put('/buses/:id', verifyFirebaseToken, checkRole(['operator', 'admin']), updateBus); // Update bus
router.delete('/buses/:id', verifyFirebaseToken, checkRole(['operator', 'admin']), deleteBus); // Deactivate bus

export default router;
