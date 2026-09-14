import '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  const missing = [];
  if (!username) missing.push('ADMIN_USERNAME');
  if (!email) missing.push('ADMIN_EMAIL');
  if (!password) missing.push('ADMIN_PASSWORD');

  if (missing.length > 0) {
    console.error(
      `Seed failed: Missing required environment variable(s): ${missing.join(', ')}. Provide them in environment or server/.env.`,
    );
    process.exit(1);
  }

  if (username.length < 3 || username.length > 50) {
    console.error('Seed failed: ADMIN_USERNAME must be between 3 and 50 characters.');
    process.exit(1);
  }

  if (!emailRegex.test(email)) {
    console.error('Seed failed: ADMIN_EMAIL must be a valid email address.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Seed failed: ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    await connectDB();

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log(
        `Admin already exists (username: "${existingAdmin.username}", email: "${existingAdmin.email}"). Seed skipped to prevent overwriting.`,
      );
      await disconnectDB();
      process.exit(0);
    }

    const admin = await Admin.create({
      username,
      email,
      password,
    });

    console.log(
      `Admin successfully created (username: "${admin.username}", email: "${admin.email}").`,
    );

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed with error:', error.message);
    try {
      await disconnectDB();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

seedAdmin();
