import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.middleware';
import { createRoute, getRoutes, updateRoute } from '../controllers/route.controller';

const router = express.Router();

router.post('/routes', verifyFirebaseToken, checkRole(['operator', 'admin']), createRoute);
router.get('/routes', verifyFirebaseToken, checkRole(['operator', 'admin']), getRoutes);
router.patch('/routes/:routeNumber', verifyFirebaseToken, checkRole(['operator', 'admin']), updateRoute);

export default router;
