export const Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  WEB_SERVER_PORT: process.env.PORT || 5353,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_API_KEY,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET
  }
};
