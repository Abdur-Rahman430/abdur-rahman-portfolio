import mongoose from 'mongoose';

export const VALID_CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Databases',
  'Developer Tools',
  'Cybersecurity',
];

export function validateSkillBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const { name, category, icon, order } = req.body;

  // Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Skill name is required and cannot be empty',
    });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Skill name cannot exceed 100 characters',
    });
  }

  // Category validation
  if (!category || typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Skill category is required and cannot be empty',
    });
  }
  if (category.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Skill category cannot exceed 100 characters',
    });
  }

  // Icon validation
  if (icon !== undefined && icon !== null && typeof icon !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Skill icon must be a string identifier',
    });
  }
  if (icon && icon.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Skill icon cannot exceed 50 characters',
    });
  }

  // Order validation
  let parsedOrder = 0;
  if (order !== undefined && order !== null && String(order).trim() !== '') {
    parsedOrder = Number(order);
    if (isNaN(parsedOrder) || parsedOrder < 0 || !Number.isInteger(parsedOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Order must be a valid non-negative integer',
      });
    }
  }

  // Sanitize fields
  req.body = {
    name: name.trim(),
    category: category.trim(),
    icon: icon ? icon.trim() : '',
    order: parsedOrder,
  };

  next();
}

export function validateSkillId(req, res, next) {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid skill ID format',
    });
  }

  next();
}
