import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import { createRoute, getRoutes } from '../controllers/route.controller';

const router = express.Router();

router.post('/routes', verifyFirebaseToken, checkRole(['operator', 'admin']), createRoute);
router.get('/routes', verifyFirebaseToken, checkRole(['operator', 'admin']), getRoutes);

export default router;
