import { Router } from 'express';
import {
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experienceController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import {
  validateExperienceBody,
  validateTimelineId,
} from '../middleware/validateTimeline.js';

const router = Router();

// Public
router.get('/', getExperience);

// Admin only
router.post('/', authenticateAdmin, validateExperienceBody, createExperience);
router.put('/:id', authenticateAdmin, validateTimelineId, validateExperienceBody, updateExperience);
router.delete('/:id', authenticateAdmin, validateTimelineId, deleteExperience);

export default router;
