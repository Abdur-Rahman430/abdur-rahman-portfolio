import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import profileRoutes from './profileRoutes.js';
import skillRoutes from './skillRoutes.js';
import projectRoutes from './projectRoutes.js';
import educationRoutes from './educationRoutes.js';
import experienceRoutes from './experienceRoutes.js';
import socialLinkRoutes from './socialLinkRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import messageRoutes from './messageRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/profile', profileRoutes);
router.use('/skills', skillRoutes);
router.use('/projects', projectRoutes);
router.use('/education', educationRoutes);
router.use('/experience', experienceRoutes);
router.use('/social-links', socialLinkRoutes);
router.use('/settings', settingsRoutes);
router.use('/website-settings', settingsRoutes);
router.use('/messages', messageRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
