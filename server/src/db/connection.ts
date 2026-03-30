import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from '../config.js';
import type { Database } from './types.js';

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.isDev ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
  max: 10,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export { pool };
