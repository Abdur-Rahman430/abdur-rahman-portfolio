import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import { validateAppearanceBody } from '../middleware/validateSettings.js';

const router = Router();

// Public
router.get('/', getSettings);

// Admin only
router.put('/', authenticateAdmin, validateAppearanceBody, updateSettings);

export default router;
