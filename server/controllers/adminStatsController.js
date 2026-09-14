import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Education from '../models/Education.js';
import Experience from '../models/Experience.js';
import ContactMessage from '../models/ContactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAdminStats = asyncHandler(async (_req, res) => {
  const [skills, projects, education, experience, totalMessages, unreadMessages] =
    await Promise.all([
      Skill.countDocuments(),
      Project.countDocuments(),
      Education.countDocuments(),
      Experience.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ read: false }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      skills,
      projects,
      timelineEntries: education + experience,
      totalMessages,
      unreadMessages,
    },
  });
});
