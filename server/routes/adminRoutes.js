import { Router } from 'express';
import { getAdminStats } from '../controllers/adminStatsController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = Router();

router.get('/stats', authenticateAdmin, getAdminStats);

export default router;
