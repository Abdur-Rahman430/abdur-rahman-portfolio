import { Router } from 'express';
import { loginAdmin, getCurrentAdmin } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = Router();

router.post('/login', loginAdmin);
router.get('/me', authenticateAdmin, getCurrentAdmin);

export default router;
