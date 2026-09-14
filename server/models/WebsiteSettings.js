import mongoose from 'mongoose';

const websiteSettingsSchema = new mongoose.Schema(
  {
    websiteTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },
    primaryColor: {
      type: String,
      trim: true,
      default: '',
    },
    secondaryColor: {
      type: String,
      trim: true,
      default: '',
    },
    accentColor: {
      type: String,
      trim: true,
      default: '',
    },
    backgroundColor: {
      type: String,
      trim: true,
      default: '',
    },
    textColor: {
      type: String,
      trim: true,
      default: '',
    },
    footerText: {
      type: String,
      trim: true,
      default: '',
    },
    defaultTheme: {
      type: String,
      trim: true,
      default: 'dark',
    },
  },
  {
    timestamps: true,
  },
);

const WebsiteSettings = mongoose.model('WebsiteSettings', websiteSettingsSchema);

export default WebsiteSettings;
