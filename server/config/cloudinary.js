import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

export const isCloudinaryConfigured = Boolean(
  env.cloudinaryUrl ||
    (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret),
);

if (env.cloudinaryUrl) {
  cloudinary.config({
    cloudinary_url: env.cloudinaryUrl,
  });
} else if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

export default cloudinary;
