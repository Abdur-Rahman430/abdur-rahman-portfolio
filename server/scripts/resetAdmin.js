import '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function resetAdmin() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  const missing = [];
  if (!username) missing.push('ADMIN_USERNAME');
  if (!email) missing.push('ADMIN_EMAIL');
  if (!password) missing.push('ADMIN_PASSWORD');

  if (missing.length > 0) {
    console.error(
      `Reset failed: Missing required environment variable(s): ${missing.join(', ')}. Provide them in server/.env.`,
    );
    process.exit(1);
  }

  if (username.length < 3 || username.length > 50) {
    console.error('Reset failed: ADMIN_USERNAME must be between 3 and 50 characters.');
    process.exit(1);
  }

  if (!emailRegex.test(email)) {
    console.error('Reset failed: ADMIN_EMAIL must be a valid email address.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Reset failed: ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    await connectDB();

    let admin = await Admin.findOne();

    if (admin) {
      admin.username = username;
      admin.email = email;
      admin.password = password; // pre-save hook will automatically hash this with bcrypt
      await admin.save();
      console.log(
        `Admin account successfully updated!\nUsername: "${admin.username}"\nEmail: "${admin.email}"`,
      );
    } else {
      admin = await Admin.create({
        username,
        email,
        password,
      });
      console.log(
        `Admin account successfully created!\nUsername: "${admin.username}"\nEmail: "${admin.email}"`,
      );
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Reset failed with error:', error.message);
    try {
      await disconnectDB();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

resetAdmin();
