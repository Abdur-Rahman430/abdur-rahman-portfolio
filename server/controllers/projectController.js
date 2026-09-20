import Project from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProjects = asyncHandler(async (_req, res) => {
  const projects = await Project.find()
    .sort({ order: 1, featured: -1, createdAt: -1 })
    .select('-__v')
    .lean();

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      project[key] = req.body[key];
    }
  });

  await project.save();

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
});

export const uploadProjectImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an image file (JPG, PNG, or WebP)',
    });
  }

  // Use Cloudinary URL (path is full URL) or local uploads fallback
  const imageUrl =
    req.file.path && /^https?:\/\//i.test(req.file.path)
      ? req.file.path
      : `/uploads/projects/${req.file.filename}`;

  let project = null;
  if (req.params.id) {
    project = await Project.findById(req.params.id);
    if (project) {
      project.projectImage = imageUrl;
      await project.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Project image uploaded successfully',
    data: {
      projectImage: imageUrl,
      imageUrl,
      project,
    },
  });
});

