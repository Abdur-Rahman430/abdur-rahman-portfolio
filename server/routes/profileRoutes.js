import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadResume,
} from '../controllers/profileController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import { validateProfile } from '../middleware/validateProfile.js';
import {
  uploadProfileImageMiddleware,
  uploadResumeMiddleware,
} from '../middleware/upload.js';

const router = Router();

// Public endpoint to get profile
router.get('/', getProfile);

// Admin-only endpoints to create or update profile
router.post('/', authenticateAdmin, validateProfile, updateProfile);
router.put('/', authenticateAdmin, validateProfile, updateProfile);

// Admin-only upload endpoints
router.post('/image', authenticateAdmin, uploadProfileImageMiddleware, uploadProfileImage);
router.post('/resume', authenticateAdmin, uploadResumeMiddleware, uploadResume);

export default router;
