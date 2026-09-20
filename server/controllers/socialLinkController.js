import SocialLink from '../models/SocialLink.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/social-links  — public (active only, ordered)
export const getSocialLinks = asyncHandler(async (_req, res) => {
  const socialLinks = await SocialLink.find({ active: true })
    .sort({ order: 1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    success: true,
    count: socialLinks.length,
    data: socialLinks,
  });
});

// GET /api/social-links/all  — admin only (all, including inactive)
export const getAllSocialLinks = asyncHandler(async (_req, res) => {
  const socialLinks = await SocialLink.find()
    .sort({ order: 1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    success: true,
    count: socialLinks.length,
    data: socialLinks,
  });
});

// POST /api/social-links  — admin only
export const createSocialLink = asyncHandler(async (req, res) => {
  const link = await SocialLink.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Social link created successfully',
    data: link,
  });
});

// PUT /api/social-links/:id  — admin only
export const updateSocialLink = asyncHandler(async (req, res) => {
  const link = await SocialLink.findById(req.params.id);

  if (!link) {
    return res.status(404).json({
      success: false,
      message: 'Social link not found',
    });
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      link[key] = req.body[key];
    }
  });

  await link.save();

  res.status(200).json({
    success: true,
    message: 'Social link updated successfully',
    data: link,
  });
});

// DELETE /api/social-links/:id  — admin only
export const deleteSocialLink = asyncHandler(async (req, res) => {
  const link = await SocialLink.findByIdAndDelete(req.params.id);

  if (!link) {
    return res.status(404).json({
      success: false,
      message: 'Social link not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Social link deleted successfully',
  });
});
