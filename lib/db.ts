import { Pool } from 'pg';

const globalForDb = global as unknown as { pool: Pool };

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      is_blocked BOOLEAN DEFAULT false,
      device_switch_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      device_id TEXT,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS otp_tokens (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS exam_categories (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      is_premium BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed exam categories if empty
  const existing = await query('SELECT id FROM exam_categories LIMIT 1');
  if (existing.length === 0) {
    const categories = [
      ['UPSC', '(Prelim + Mains Complete Notes)'],
      ['MPSC', '(Prelim + Mains Complete Notes)'],
      ['NEET', '(Complete Study Notes)'],
      ['JEE', '(Complete Study Notes)'],
      ['MH-CET', '(Complete Study Notes)'],
      ['पुलिस भरती', '(Complete Study Kit)'],
      ['तलाठी भरती', '(Complete Study Kit)'],
      ['AMVI - RTO', '(Pre + Mains Notes)'],
      ['अग्निवीर', '(Complete Study Notes)'],
      ['SSC', '(CGL, CHSL, MTS)'],
      ['Banking', '(IBPS, SBI, RBI)'],
      ['Railway', '(RRB NTPC, Group-D)'],
      ['Defence', '(NDA, CDS, Army, Navy, Airforce)'],
      ['TET / CTET', '/ Teacher Bharti'],
      ['Speaking English', '(Communication Skills)'],
      ['Business Ideas', '(Startup Ideas)'],
    ];
    for (const [title, subtitle] of categories) {
      await query('INSERT INTO exam_categories (title, subtitle) VALUES ($1, $2)', [title, subtitle]);
    }
  }
}
