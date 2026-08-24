import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const env = {
  PORT:                process.env.PORT || '5000',
  CLIENT_URL:          process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL:        required('DATABASE_URL'),
  JWT_ACCESS_SECRET:   required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET:  required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES:  process.env.JWT_ACCESS_EXPIRES  || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  BCRYPT_ROUNDS:       parseInt(process.env.BCRYPT_ROUNDS || '12'),
  NODE_ENV:            process.env.NODE_ENV || 'development',
  // Email (used in Day 5)
  SMTP_HOST:           process.env.SMTP_HOST || '',
  SMTP_PORT:           parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER:           process.env.SMTP_USER || '',
  SMTP_PASS:           process.env.SMTP_PASS || '',
  SMTP_FROM:           process.env.SMTP_FROM || 'noreply@eventmanager.com',
  // Cloudinary (used in Day 2)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY:    process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};
