import mongoose from 'mongoose';

// Accepts 3-digit (#abc) and 6-digit (#aabbcc) HEX colors
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function validateHexColor(value, fieldName) {
  if (value === undefined || value === null || value === '') return null; // optional — allowed to be empty
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`;
  }
  const trimmed = value.trim();
  if (trimmed !== '' && !HEX_COLOR_REGEX.test(trimmed)) {
    return `${fieldName} must be a valid HEX color (e.g. #3b82f6 or #fff)`;
  }
  if (trimmed.length > 7) {
    return `${fieldName} cannot exceed 7 characters`;
  }
  return null;
}

export function validateSettingsBody(req, res, next) {
  return validateAppearanceBody(req, res, next);
}

export function validateAppearanceBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,
    defaultTheme,
    footerText,
    websiteTitle,
    metaDescription,
  } = req.body;

  // Validate each color field
  const colorFields = [
    ['primaryColor', primaryColor],
    ['secondaryColor', secondaryColor],
    ['accentColor', accentColor],
    ['backgroundColor', backgroundColor],
    ['textColor', textColor],
  ];

  for (const [name, value] of colorFields) {
    const err = validateHexColor(value, name);
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }
  }

  // defaultTheme — optional enum
  const ALLOWED_THEMES = ['dark', 'light'];
  if (
    defaultTheme !== undefined &&
    defaultTheme !== null &&
    defaultTheme !== '' &&
    !ALLOWED_THEMES.includes(String(defaultTheme).trim().toLowerCase())
  ) {
    return res.status(400).json({
      success: false,
      message: `defaultTheme must be one of: ${ALLOWED_THEMES.join(', ')}`,
    });
  }

  // footerText — optional string, max 300
  if (footerText !== undefined && footerText !== null && typeof footerText !== 'string') {
    return res.status(400).json({ success: false, message: 'footerText must be a string' });
  }
  if (footerText && footerText.trim().length > 300) {
    return res.status(400).json({ success: false, message: 'footerText cannot exceed 300 characters' });
  }

  // websiteTitle — optional string, max 200
  if (websiteTitle !== undefined && websiteTitle !== null && typeof websiteTitle !== 'string') {
    return res.status(400).json({ success: false, message: 'websiteTitle must be a string' });
  }
  if (websiteTitle && websiteTitle.trim().length > 200) {
    return res.status(400).json({ success: false, message: 'websiteTitle cannot exceed 200 characters' });
  }

  // metaDescription — optional string, max 500
  if (metaDescription !== undefined && metaDescription !== null && typeof metaDescription !== 'string') {
    return res.status(400).json({ success: false, message: 'metaDescription must be a string' });
  }
  if (metaDescription && metaDescription.trim().length > 500) {
    return res.status(400).json({ success: false, message: 'metaDescription cannot exceed 500 characters' });
  }

  // Sanitize — only pass known safe fields
  const sanitized = {};
  if (primaryColor !== undefined) sanitized.primaryColor = (primaryColor || '').trim();
  if (secondaryColor !== undefined) sanitized.secondaryColor = (secondaryColor || '').trim();
  if (accentColor !== undefined) sanitized.accentColor = (accentColor || '').trim();
  if (backgroundColor !== undefined) sanitized.backgroundColor = (backgroundColor || '').trim();
  if (textColor !== undefined) sanitized.textColor = (textColor || '').trim();
  if (defaultTheme !== undefined) sanitized.defaultTheme = (defaultTheme || 'dark').trim().toLowerCase();
  if (footerText !== undefined) sanitized.footerText = (footerText || '').trim();
  if (websiteTitle !== undefined) sanitized.websiteTitle = (websiteTitle || '').trim();
  if (metaDescription !== undefined) sanitized.metaDescription = (metaDescription || '').trim();

  req.body = sanitized;
  next();
}
