import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const RESUMES_DIR = path.join(UPLOADS_DIR, 'resumes');
const PROJECTS_DIR = path.join(UPLOADS_DIR, 'projects');

// Ensure destination directories exist
fs.mkdirSync(IMAGES_DIR, { recursive: true });
fs.mkdirSync(RESUMES_DIR, { recursive: true });
fs.mkdirSync(PROJECTS_DIR, { recursive: true });

// Image file filter (JPG, JPEG, PNG, WebP)
const imageFileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid image format. Allowed formats are JPG, JPEG, PNG, and WebP.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Profile Image storage configuration
const profileImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

export const uploadProfileImageMiddleware = multer({
  storage: profileImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single('image');

// Project Image storage configuration
const projectImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PROJECTS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `project-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

export const uploadProjectImageMiddleware = multer({
  storage: projectImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single('image');

// Resume storage configuration
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, RESUMES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `resume-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

// Resume file filter (PDF only)
const resumeFileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype === 'application/pdf' && ext === '.pdf') {
    cb(null, true);
  } else {
    const error = new Error('Invalid resume format. Only PDF files are accepted.');
    error.statusCode = 400;
    cb(error, false);
  }
};

export const uploadResumeMiddleware = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single('resume');
