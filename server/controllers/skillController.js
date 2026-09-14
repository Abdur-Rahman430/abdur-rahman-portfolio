import Skill from '../models/Skill.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const INITIAL_SKILLS = [
  // Programming Languages
  { name: 'C', category: 'Programming Languages', icon: 'Code2', order: 1 },
  { name: 'Java', category: 'Programming Languages', icon: 'Coffee', order: 2 },
  { name: 'JavaScript', category: 'Programming Languages', icon: 'FileCode', order: 3 },

  // Frontend Development
  { name: 'HTML', category: 'Frontend Development', icon: 'Globe', order: 1 },
  { name: 'CSS', category: 'Frontend Development', icon: 'Palette', order: 2 },
  { name: 'React', category: 'Frontend Development', icon: 'Atom', order: 3 },

  // Backend Development
  { name: 'Node.js', category: 'Backend Development', icon: 'Server', order: 1 },
  { name: 'Express.js', category: 'Backend Development', icon: 'Cpu', order: 2 },

  // Databases
  { name: 'MySQL', category: 'Databases', icon: 'Database', order: 1 },
  { name: 'MongoDB', category: 'Databases', icon: 'Boxes', order: 2 },

  // Developer Tools
  { name: 'Git', category: 'Developer Tools', icon: 'GitBranch', order: 1 },
  { name: 'GitHub', category: 'Developer Tools', icon: 'FolderGit2', order: 2 },
  { name: 'Linux', category: 'Developer Tools', icon: 'Terminal', order: 3 },

  // Cybersecurity
  { name: 'Networking', category: 'Cybersecurity', icon: 'Workflow', order: 1 },
  { name: 'Linux Security', category: 'Cybersecurity', icon: 'ShieldCheck', order: 2 },
  { name: 'Web Security', category: 'Cybersecurity', icon: 'Lock', order: 3 },
];

export const getSkills = asyncHandler(async (_req, res) => {
  const skills = await Skill.find()
    .sort({ category: 1, order: 1, name: 1 })
    .select('-__v');

  res.status(200).json({
    success: true,
    count: skills.length,
    data: skills,
  });
});

export const createSkill = asyncHandler(async (req, res) => {
  const { name, category, icon, order } = req.body;

  const skill = await Skill.create({
    name,
    category,
    icon: icon || '',
    order: order ?? 0,
  });

  res.status(201).json({
    success: true,
    message: 'Skill created successfully',
    data: skill,
  });
});

export const updateSkill = asyncHandler(async (req, res) => {
  const { name, category, icon, order } = req.body;

  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: 'Skill not found',
    });
  }

  if (name !== undefined) skill.name = name;
  if (category !== undefined) skill.category = category;
  if (icon !== undefined) skill.icon = icon;
  if (order !== undefined) skill.order = order;

  await skill.save();

  res.status(200).json({
    success: true,
    message: 'Skill updated successfully',
    data: skill,
  });
});

export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);

  if (!skill) {
    return res.status(404).json({
      success: false,
      message: 'Skill not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully',
  });
});

export const seedInitialSkills = asyncHandler(async (_req, res) => {
  let insertedCount = 0;

  for (const item of INITIAL_SKILLS) {
    const exists = await Skill.findOne({
      name: item.name,
      category: item.category,
    });

    if (!exists) {
      await Skill.create(item);
      insertedCount += 1;
    }
  }

  const totalCount = await Skill.countDocuments();

  res.status(200).json({
    success: true,
    message: `Initial skills seeded (${insertedCount} new skills added)`,
    insertedCount,
    totalCount,
  });
});
