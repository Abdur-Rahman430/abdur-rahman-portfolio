import Education from '../models/Education.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/education  — public
export const getEducation = asyncHandler(async (_req, res) => {
  const education = await Education.find()
    .sort({ order: 1, startDate: -1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    success: true,
    count: education.length,
    data: education,
  });
});

// POST /api/education  — admin only
export const createEducation = asyncHandler(async (req, res) => {
  const entry = await Education.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Education entry created successfully',
    data: entry,
  });
});

// PUT /api/education/:id  — admin only
export const updateEducation = asyncHandler(async (req, res) => {
  const entry = await Education.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Education entry not found',
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
    message: 'Education entry updated successfully',
    data: entry,
  });
});

// DELETE /api/education/:id  — admin only
export const deleteEducation = asyncHandler(async (req, res) => {
  const entry = await Education.findByIdAndDelete(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Education entry not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Education entry deleted successfully',
  });
});
