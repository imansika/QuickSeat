import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';

import {
  registerBus,
  getOperatorBuses,
  getDepartureTimesByBusNumber,
  getWeekdayOperatingBuses,
  getWeekendOperatingBuses,
  getBusById,
  updateBus,
  deleteBus,
  searchBuses,
  searchAvailableBuses,
} from '../controllers/bus.controller';

const router = express.Router();

console.log('Bus routes module loaded');


// ================= PUBLIC ROUTES =================
router.get('/buses/search/available', (req, res, next) => {
  console.log('Hit /buses/search/available');
  next();
}, searchAvailableBuses);

router.get('/buses/search', searchBuses);


// ================= OPERATING ROUTES =================
router.get(
  '/buses/operating/weekday',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  getWeekdayOperatingBuses
);

router.get(
  '/buses/operating/weekend',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  getWeekendOperatingBuses
);


// ================= MAIN BUS ROUTES =================
router.post(
  '/buses',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  registerBus
);

router.get(
  '/buses',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  getOperatorBuses
);

router.get(
  '/buses/:busNumber/departure-times',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  getDepartureTimesByBusNumber
);


// ================= DYNAMIC ROUTES (LAST) =================
router.get(
  '/buses/:id',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  getBusById
);

router.put(
  '/buses/:id',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  updateBus
);

router.delete(
  '/buses/:id',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  deleteBus
);

export default router;