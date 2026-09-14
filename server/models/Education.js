import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
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
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

educationSchema.index({ order: 1 });

const Education = mongoose.model('Education', educationSchema);

export default Education;
