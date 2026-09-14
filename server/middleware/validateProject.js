import mongoose from 'mongoose';

export const ALLOWED_STATUSES = ['Completed', 'In Progress', 'Planned'];

const URL_REGEX = /^https?:\/\/.+/i;

export function validateProjectBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const {
    name,
    shortDescription,
    fullDescription,
    technologies,
    projectImage,
    githubUrl,
    liveDemoUrl,
    status,
    featured,
    order,
  } = req.body;

  // Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Project name is required and cannot be empty',
    });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Project name cannot exceed 100 characters',
    });
  }

  // Short description validation
  if (!shortDescription || typeof shortDescription !== 'string' || !shortDescription.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Short description is required and cannot be empty',
    });
  }
  if (shortDescription.trim().length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Short description cannot exceed 500 characters',
    });
  }

  // Full description validation
  if (!fullDescription || typeof fullDescription !== 'string' || !fullDescription.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Full description is required and cannot be empty',
    });
  }
  if (fullDescription.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Full description cannot exceed 5000 characters',
    });
  }

  // Technologies validation
  let parsedTechnologies = [];
  if (technologies !== undefined && technologies !== null) {
    if (Array.isArray(technologies)) {
      parsedTechnologies = technologies;
    } else if (typeof technologies === 'string') {
      parsedTechnologies = technologies.split(',').map((t) => t.trim()).filter(Boolean);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Technologies must be an array of strings or comma-separated string',
      });
    }

    for (const tech of parsedTechnologies) {
      if (typeof tech !== 'string' || !tech.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Each technology item must be a non-empty string',
        });
      }
      if (tech.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Each technology name cannot exceed 50 characters',
        });
      }
    }
    parsedTechnologies = parsedTechnologies.map((t) => t.trim());
  }

  // Status validation (case-insensitive normalization)
  let normalizedStatus = 'Completed';
  if (status !== undefined && status !== null && String(status).trim() !== '') {
    const rawStatus = String(status).trim();
    const match = ALLOWED_STATUSES.find(
      (s) => s.toLowerCase() === rawStatus.toLowerCase()
    );
    if (!match) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }
    normalizedStatus = match;
  }

  // Featured validation
  const normalizedFeatured = Boolean(featured);

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

  // GitHub URL validation
  if (githubUrl !== undefined && githubUrl !== null && String(githubUrl).trim() !== '') {
    const trimmed = String(githubUrl).trim();
    if (!URL_REGEX.test(trimmed)) {
      return res.status(400).json({
        success: false,
        message: 'GitHub URL must be a valid HTTP or HTTPS URL',
      });
    }
  }

  // Live Demo URL validation
  if (liveDemoUrl !== undefined && liveDemoUrl !== null && String(liveDemoUrl).trim() !== '') {
    const trimmed = String(liveDemoUrl).trim();
    if (!URL_REGEX.test(trimmed)) {
      return res.status(400).json({
        success: false,
        message: 'Live demo URL must be a valid HTTP or HTTPS URL',
      });
    }
  }

  // Sanitize fields
  req.body = {
    name: name.trim(),
    shortDescription: shortDescription.trim(),
    fullDescription: fullDescription.trim(),
    technologies: parsedTechnologies,
    projectImage: projectImage ? String(projectImage).trim() : '',
    githubUrl: githubUrl ? String(githubUrl).trim() : '',
    liveDemoUrl: liveDemoUrl ? String(liveDemoUrl).trim() : '',
    status: normalizedStatus,
    featured: normalizedFeatured,
    order: parsedOrder,
  };

  next();
}

export function validateProjectId(req, res, next) {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID format',
    });
  }

  next();
}
