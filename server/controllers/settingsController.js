import mongoose from 'mongoose';
import WebsiteSettings from '../models/WebsiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Default baseline theme colors
const DEFAULT_SETTINGS = {
  primaryColor: '#10b981',
  secondaryColor: '#18181b',
  accentColor: '#38bdf8',
  backgroundColor: '#09090b',
  textColor: '#f4f4f5',
  defaultTheme: 'dark',
  websiteTitle: '',
  metaDescription: '',
  footerText: '',
};

function formatSettingsWithDefaults(doc) {
  const plain = doc ? (typeof doc.toObject === 'function' ? doc.toObject() : doc) : {};
  return {
    ...DEFAULT_SETTINGS,
    ...plain,
    primaryColor: plain.primaryColor || DEFAULT_SETTINGS.primaryColor,
    secondaryColor: plain.secondaryColor || DEFAULT_SETTINGS.secondaryColor,
    accentColor: plain.accentColor || DEFAULT_SETTINGS.accentColor,
    backgroundColor: plain.backgroundColor || DEFAULT_SETTINGS.backgroundColor,
    textColor: plain.textColor || DEFAULT_SETTINGS.textColor,
  };
}

// GET /api/settings or /api/website-settings — public
export const getSettings = asyncHandler(async (_req, res) => {
  let settings = null;
  if (mongoose.connection.readyState === 1) {
    try {
      settings = await WebsiteSettings.findOne().select('-__v').lean();
    } catch (_err) {
      // If error occurs, fallback to defaults
    }
  }

  res.status(200).json({
    success: true,
    data: formatSettingsWithDefaults(settings),
  });
});

// PUT /api/settings or /api/website-settings — admin only
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await WebsiteSettings.findOne();

  if (!settings) {
    // Create singleton document with defaults merged with input
    settings = new WebsiteSettings({
      ...DEFAULT_SETTINGS,
      ...req.body,
    });
  } else {
    // Update existing document while preserving unrelated fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Website settings updated successfully',
    data: formatSettingsWithDefaults(settings),
  });
});
