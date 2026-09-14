import { Router } from 'express';
import {
  createMessage,
  getMessages,
  updateMessageReadStatus,
} from '../controllers/messageController.js';
import {
  validateMessage,
  validateMessageId,
  validateReadStatus,
} from '../middleware/validateMessage.js';
import { messageRateLimiter } from '../middleware/rateLimiter.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = Router();

// Public contact submission (rate-limited and validated)
router.post('/', messageRateLimiter, validateMessage, createMessage);

// Admin-only message management
router.get('/', authenticateAdmin, getMessages);
router.patch('/:id/read', authenticateAdmin, validateMessageId, validateReadStatus, updateMessageReadStatus);

export default router;


