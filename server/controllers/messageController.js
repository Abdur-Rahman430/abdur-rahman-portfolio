import ContactMessage from '../models/ContactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Public contact submission
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const newMessage = await ContactMessage.create({
    name,
    email,
    subject: subject || '',
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      id: newMessage._id,
      createdAt: newMessage.createdAt,
    },
  });
});

// Admin: Get all messages with pagination and newest first
export const getMessages = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.read === 'true') {
    filter.read = true;
  } else if (req.query.read === 'false') {
    filter.read = false;
  }

  const [total, messages] = await Promise.all([
    ContactMessage.countDocuments(filter),
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    totalPages,
    page,
    limit,
    data: messages,
  });
});

// Admin: Update message read status
export const updateMessageReadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { read } = req.body;

  const message = await ContactMessage.findById(id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found',
    });
  }

  message.read = read;
  await message.save();

  res.status(200).json({
    success: true,
    message: `Message marked as ${message.read ? 'read' : 'unread'}`,
    data: message,
  });
});

