import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try .env first, fall back to env.txt
const envPath = path.resolve(__dirname, '../.env');
const envTxtPath = path.resolve(__dirname, '../env.txt');
dotenv.config({ path: existsSync(envPath) ? envPath : envTxtPath });

const isDev = process.env.NODE_ENV !== 'production';

if (!isDev && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}
if (!isDev && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required in production');
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-' + Math.random().toString(36),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev,
};
