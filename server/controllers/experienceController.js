import Experience from '../models/Experience.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/experience  — public
export const getExperience = asyncHandler(async (_req, res) => {
  const experience = await Experience.find()
    .sort({ order: 1, startDate: -1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    success: true,
    count: experience.length,
    data: experience,
  });
});

// POST /api/experience  — admin only
export const createExperience = asyncHandler(async (req, res) => {
  const entry = await Experience.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Experience entry created successfully',
    data: entry,
  });
});

// PUT /api/experience/:id  — admin only
export const updateExperience = asyncHandler(async (req, res) => {
  const entry = await Experience.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Experience entry not found',
    });
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      entry[key] = req.body[key];
    }
  });

  await entry.save();

  res.status(200).json({
    success: true,
    message: 'Experience entry updated successfully',
    data: entry,
  });
});

// DELETE /api/experience/:id  — admin only
export const deleteExperience = asyncHandler(async (req, res) => {
  const entry = await Experience.findByIdAndDelete(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Experience entry not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Experience entry deleted successfully',
  });
});
