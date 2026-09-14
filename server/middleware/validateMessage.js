import mongoose from 'mongoose';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMessage(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const { name, email, subject, message } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be a non-empty string',
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must not exceed 100 characters',
    });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedEmail.length > 255 || !emailRegex.test(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
    });
  }

  if (subject !== undefined && typeof subject !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Subject must be a string if provided',
    });
  }

  if (subject && subject.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Subject must not exceed 200 characters',
    });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message is required and must be a non-empty string',
    });
  }

  if (message.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Message must not exceed 5000 characters',
    });
  }

  // Sanitize req.body to prevent mass assignment of read or custom fields
  req.body = {
    name: name.trim(),
    email: trimmedEmail,
    subject: subject ? subject.trim() : '',
    message: message.trim(),
  };

  next();
}

export function validateMessageId(req, res, next) {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid message ID format',
    });
  }

  next();
}

export function validateReadStatus(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const { read } = req.body;

  if (typeof read !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Field "read" is required and must be a boolean (true or false)',
    });
  }

  next();
}

