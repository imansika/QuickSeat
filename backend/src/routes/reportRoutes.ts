import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import { getDailyReportController, getMonthlyReportController } from '../controllers/report.controller';

const router = express.Router();

router.get(
  '/reports/daily',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  getDailyReportController
);

router.get(
  '/reports/monthly',
  verifyFirebaseToken,
  checkRole(['operator', 'admin']),
  getMonthlyReportController
);

export default router;