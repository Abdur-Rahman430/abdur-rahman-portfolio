import mongoose from 'mongoose';

export const PLATFORM_OPTIONS = [
  'GitHub',
  'LinkedIn',
  'Facebook',
  'Instagram',
  'YouTube',
  'X',
  'Email',
  'Telegram',
  'Discord',
  'WhatsApp',
  'Other',
];

const URL_REGEX = /^https?:\/\/.+/i;
const EMAIL_URL_REGEX = /^mailto:.+@.+/i;

export function validateSocialLinkBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const { platform, url, icon, active, order } = req.body;

  // platform — required
  if (!platform || typeof platform !== 'string' || !platform.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Platform is required and cannot be empty',
    });
  }
  if (platform.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Platform cannot exceed 100 characters',
    });
  }

  // url — required; must be http/https or mailto
  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: 'URL is required and cannot be empty',
    });
  }
  const trimmedUrl = url.trim();
  if (!URL_REGEX.test(trimmedUrl) && !EMAIL_URL_REGEX.test(trimmedUrl)) {
    return res.status(400).json({
      success: false,
      message: 'URL must be a valid HTTP/HTTPS URL or a mailto: address',
    });
  }
  if (trimmedUrl.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'URL cannot exceed 500 characters',
    });
  }

  // icon — optional safe string
  if (icon !== undefined && icon !== null && typeof icon !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Icon must be a string identifier',
    });
  }
  if (icon && icon.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Icon identifier cannot exceed 100 characters',
    });
  }

  // active — boolean
  const normalizedActive = active === undefined ? true : Boolean(active);

  // order — non-negative integer
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

  // Sanitize
  req.body = {
    platform: platform.trim(),
    url: trimmedUrl,
    icon: icon ? icon.trim() : '',
    active: normalizedActive,
    order: parsedOrder,
  };

  next();
}

export function validateSocialLinkId(req, res, next) {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid social link ID format',
    });
  }

  next();
}
