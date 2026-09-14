import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = jwt.sign(
    {
      id: admin._id,
      username: admin.username,
      email: admin.email,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      admin: admin.toSafeObject(),
    },
  });
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      admin: req.admin.toSafeObject(),
    },
  });
});
