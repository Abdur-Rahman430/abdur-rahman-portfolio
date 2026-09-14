export function validateProfile(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a valid JSON object',
    });
  }

  const {
    fullName,
    professionalTitle,
    shortIntroduction,
    aboutMe,
    university,
    department,
    currentStatus,
    graduationYear,
    careerObjective,
    profileImage,
    resumeFile,
  } = req.body;

  // Full Name validation
  if (fullName !== undefined) {
    if (typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full Name is required and must be a non-empty string',
      });
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full Name must be between 2 and 100 characters',
      });
    }
  }

  // Professional Title validation
  if (professionalTitle !== undefined && typeof professionalTitle !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Professional Title must be a string',
    });
  }
  if (professionalTitle && professionalTitle.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Professional Title cannot exceed 200 characters',
    });
  }

  // Short Introduction validation
  if (shortIntroduction !== undefined && typeof shortIntroduction !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Short Introduction must be a string',
    });
  }
  if (shortIntroduction && shortIntroduction.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Short Introduction cannot exceed 1000 characters',
    });
  }

  // About Me validation
  if (aboutMe !== undefined && typeof aboutMe !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'About Me must be a string',
    });
  }
  if (aboutMe && aboutMe.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'About Me cannot exceed 5000 characters',
    });
  }

  // University validation
  if (university !== undefined && typeof university !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'University must be a string',
    });
  }
  if (university && university.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'University cannot exceed 200 characters',
    });
  }

  // Department validation
  if (department !== undefined && typeof department !== 'string') {
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

  // Current Status validation
  if (currentStatus !== undefined && typeof currentStatus !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Current Status must be a string',
    });
  }
  if (currentStatus && currentStatus.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Current Status cannot exceed 100 characters',
    });
  }

  // Graduation Year validation
  if (graduationYear !== undefined && graduationYear !== null && String(graduationYear).trim() !== '') {
    const yearStr = String(graduationYear).trim();
    const yearNum = Number(yearStr);
    if (!/^\d{4}$/.test(yearStr) || isNaN(yearNum) || yearNum < 1950 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Graduation Year must be a valid 4-digit year between 1950 and 2100',
      });
    }
  }

  // Career Objective validation
  if (careerObjective !== undefined && typeof careerObjective !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Career Objective must be a string',
    });
  }
  if (careerObjective && careerObjective.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Career Objective cannot exceed 2000 characters',
    });
  }

  // Sanitize fields
  req.body = {
    fullName: fullName ? fullName.trim() : undefined,
    professionalTitle: professionalTitle !== undefined ? professionalTitle.trim() : undefined,
    shortIntroduction: shortIntroduction !== undefined ? shortIntroduction.trim() : undefined,
    aboutMe: aboutMe !== undefined ? aboutMe.trim() : undefined,
    university: university !== undefined ? university.trim() : undefined,
    department: department !== undefined ? department.trim() : undefined,
    currentStatus: currentStatus !== undefined ? currentStatus.trim() : undefined,
    graduationYear: graduationYear !== undefined && graduationYear !== null ? String(graduationYear).trim() : undefined,
    careerObjective: careerObjective !== undefined ? careerObjective.trim() : undefined,
    profileImage: profileImage !== undefined ? profileImage.trim() : undefined,
    resumeFile: resumeFile !== undefined ? resumeFile.trim() : undefined,
  };

  next();
}
