import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: String,
      trim: true,
      default: '',
    },
    endDate: {
      type: String,
      trim: true,
      default: '',
    },
    current: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      trim: true,
      default: '',
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

experienceSchema.index({ order: 1 });

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;
