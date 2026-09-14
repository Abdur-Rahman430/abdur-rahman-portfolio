import { Router } from 'express';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  seedInitialSkills,
} from '../controllers/skillController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import {
  validateSkillBody,
  validateSkillId,
} from '../middleware/validateSkill.js';

const router = Router();

// Public endpoint
router.get('/', getSkills);

// Admin-only write endpoints
router.post('/', authenticateAdmin, validateSkillBody, createSkill);
router.put('/:id', authenticateAdmin, validateSkillId, validateSkillBody, updateSkill);
router.delete('/:id', authenticateAdmin, validateSkillId, deleteSkill);
router.post('/seed', authenticateAdmin, seedInitialSkills);

export default router;
