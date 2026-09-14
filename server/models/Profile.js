import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    professionalTitle: {
      type: String,
      trim: true,
      default: '',
    },
    shortIntroduction: {
      type: String,
      trim: true,
      default: '',
    },
    aboutMe: {
      type: String,
      trim: true,
      default: '',
    },
    university: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    currentStatus: {
      type: String,
      trim: true,
      default: '',
    },
    graduationYear: {
      type: String,
      trim: true,
      default: '',
    },
    careerObjective: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    resumeFile: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
