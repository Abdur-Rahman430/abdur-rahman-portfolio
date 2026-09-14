import mongoose from 'mongoose';

const urlValidator = {
  validator: function (v) {
    if (!v) return true;
    return /^https?:\/\/.+/i.test(v);
  },
  message: 'Invalid URL format',
};

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    fullDescription: {
      type: String,
      trim: true,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    projectImage: {
      type: String,
      trim: true,
      default: '',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidator,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: '',
      validate: urlValidator,
    },
    status: {
      type: String,
      trim: true,
      default: 'completed',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ order: 1, featured: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
