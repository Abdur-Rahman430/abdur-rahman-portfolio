import { Router } from 'express';
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from '../controllers/educationController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import {
  validateEducationBody,
  validateTimelineId,
} from '../middleware/validateTimeline.js';

const router = Router();

// Public
router.get('/', getEducation);

// Admin only
router.post('/', authenticateAdmin, validateEducationBody, createEducation);
router.put('/:id', authenticateAdmin, validateTimelineId, validateEducationBody, updateEducation);
router.delete('/:id', authenticateAdmin, validateTimelineId, deleteEducation);

export default router;
