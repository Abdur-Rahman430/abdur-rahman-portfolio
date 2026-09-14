import { Router } from 'express';
import {
  getSocialLinks,
  getAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../controllers/socialLinkController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import {
  validateSocialLinkBody,
  validateSocialLinkId,
} from '../middleware/validateSocialLink.js';

const router = Router();

// Public — active links only
router.get('/', getSocialLinks);

// Admin only — all links including inactive
router.get('/all', authenticateAdmin, getAllSocialLinks);

// Admin only — write operations
router.post('/', authenticateAdmin, validateSocialLinkBody, createSocialLink);
router.put('/:id', authenticateAdmin, validateSocialLinkId, validateSocialLinkBody, updateSocialLink);
router.delete('/:id', authenticateAdmin, validateSocialLinkId, deleteSocialLink);

export default router;
