import mongoose from 'mongoose';

// -------------------------------------------------------------------
// Shared: validate MongoDB ObjectId param
// -------------------------------------------------------------------
export function validateTimelineId(req, res, next) {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timeline entry ID format',
    });
  }

  next();
}

// -------------------------------------------------------------------
// Education entry body validation
// Fields: institution, degree, department, description, startDate,
//         endDate, current, order
// -------------------------------------------------------------------
export function validateEducationBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const { institution, degree, department, description, startDate, endDate, current, order } =
    req.body;

  // institution — required
  if (!institution || typeof institution !== 'string' || !institution.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Institution is required and cannot be empty',
    });
  }
  if (institution.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Institution cannot exceed 200 characters',
    });
  }

  // degree — required
  if (!degree || typeof degree !== 'string' || !degree.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Degree / qualification is required and cannot be empty',
    });
  }
  if (degree.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Degree cannot exceed 200 characters',
    });
  }

  // department — optional
  if (department !== undefined && department !== null && typeof department !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Department must be a string',
    });
  }
  if (department && department.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Department cannot exceed 200 characters',
    });
  }

  // description — optional
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Description must be a string',
    });
  }
  if (description && description.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Description cannot exceed 2000 characters',
    });
  }

  // startDate — required (stored as string e.g. "2020-09", "September 2020")
  if (!startDate || typeof startDate !== 'string' || !startDate.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Start date is required',
    });
  }
  if (startDate.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot exceed 50 characters',
    });
  }

  // current — boolean coercion
  const normalizedCurrent = Boolean(current);

  // endDate — must be cleared when current is true
  let normalizedEndDate = '';
  if (!normalizedCurrent) {
    if (endDate !== undefined && endDate !== null && typeof endDate !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'End date must be a string',
      });
    }
    if (endDate && endDate.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot exceed 50 characters',
      });
    }
    normalizedEndDate = endDate ? endDate.trim() : '';
  }

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
    institution: institution.trim(),
    degree: degree.trim(),
    department: department ? department.trim() : '',
    description: description ? description.trim() : '',
    startDate: startDate.trim(),
    endDate: normalizedEndDate,
    current: normalizedCurrent,
    order: parsedOrder,
  };

  next();
}

// -------------------------------------------------------------------
// Experience entry body validation
// Fields: title, organization, description, startDate,
//         endDate, current, type, order
// -------------------------------------------------------------------
export function validateExperienceBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const { title, organization, description, startDate, endDate, current, type, order } = req.body;

  // title — required
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Title is required and cannot be empty',
    });
  }
  if (title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Title cannot exceed 200 characters',
    });
  }

  // organization — required
  if (!organization || typeof organization !== 'string' || !organization.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Organization is required and cannot be empty',
    });
  }
  if (organization.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Organization cannot exceed 200 characters',
    });
  }

  // description — optional
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Description must be a string',
    });
  }
  if (description && description.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Description cannot exceed 2000 characters',
    });
  }

  // startDate — required
  if (!startDate || typeof startDate !== 'string' || !startDate.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Start date is required',
    });
  }
  if (startDate.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot exceed 50 characters',
    });
  }

  // current — boolean
  const normalizedCurrent = Boolean(current);

  // endDate
  let normalizedEndDate = '';
  if (!normalizedCurrent) {
    if (endDate !== undefined && endDate !== null && typeof endDate !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'End date must be a string',
      });
    }
    if (endDate && endDate.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot exceed 50 characters',
      });
    }
    normalizedEndDate = endDate ? endDate.trim() : '';
  }

  // type — optional free-text (e.g. "Full-time", "Internship")
  if (type !== undefined && type !== null && typeof type !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Experience type must be a string',
    });
  }
  if (type && type.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Experience type cannot exceed 100 characters',
    });
  }

  // order
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
    title: title.trim(),
    organization: organization.trim(),
    description: description ? description.trim() : '',
    startDate: startDate.trim(),
    endDate: normalizedEndDate,
    current: normalizedCurrent,
    type: type ? type.trim() : '',
    order: parsedOrder,
  };

  next();
}
