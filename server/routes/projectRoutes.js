import { Router } from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
} from '../controllers/projectController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import {
  validateProjectBody,
  validateProjectId,
} from '../middleware/validateProject.js';
import { uploadProjectImageMiddleware } from '../middleware/upload.js';

const router = Router();

// Public endpoint
router.get('/', getProjects);

// Admin-only write endpoints
router.post('/', authenticateAdmin, validateProjectBody, createProject);
router.put('/:id', authenticateAdmin, validateProjectId, validateProjectBody, updateProject);
router.delete('/:id', authenticateAdmin, validateProjectId, deleteProject);

// Admin-only image upload endpoints
router.post('/:id/image', authenticateAdmin, validateProjectId, uploadProjectImageMiddleware, uploadProjectImage);
router.post('/upload-image', authenticateAdmin, uploadProjectImageMiddleware, uploadProjectImage);

export default router;
