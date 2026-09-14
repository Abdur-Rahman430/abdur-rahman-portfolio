import Profile from '../models/Profile.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (_req, res) => {
  const profile = await Profile.findOne().select('-__v');

  res.status(200).json({
    success: true,
    data: profile || null,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne();

  if (profile) {
    // Update existing profile document
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        profile[key] = req.body[key];
      }
    });
    await profile.save();
  } else {
    // Create the single profile document if none exists
    profile = await Profile.create(req.body);
  }

  res.status(200).json({
    success: true,
    message: 'Profile saved successfully',
    data: profile,
  });
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an image file (JPG, PNG, or WebP)',
    });
  }

  const imageUrl = `/uploads/images/${req.file.filename}`;

  let profile = await Profile.findOne();
  if (profile) {
    profile.profileImage = imageUrl;
    await profile.save();
  } else {
    profile = await Profile.create({ profileImage: imageUrl });
  }

  res.status(200).json({
    success: true,
    message: 'Profile image uploaded successfully',
    data: {
      profileImage: imageUrl,
      profile,
    },
  });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a resume PDF file',
    });
  }

  const resumeUrl = `/uploads/resumes/${req.file.filename}`;

  let profile = await Profile.findOne();
  if (profile) {
    profile.resumeFile = resumeUrl;
    await profile.save();
  } else {
    profile = await Profile.create({ resumeFile: resumeUrl });
  }

  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully',
    data: {
      resumeFile: resumeUrl,
      profile,
    },
  });
});
