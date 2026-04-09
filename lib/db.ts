import pg, { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Removed redundant local Pool declaration

// 🛡️ Robust Environment Loader for maintenance scripts
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value) process.env[key] = value;
      }
    });
  }
}

const connectionString = process.env.DATABASE_URL;
if (connectionString) {
  const masked = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log(`📡 Connecting to DB: ${masked}`);
}

const globalForDb = global as unknown as { pool: Pool };

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_DB) console.log('executed query', { text, duration, rows: res.rowCount });
    return res.rows as T[];
  } catch (err: any) {
    console.error('❌ DB Query Error:', err.message);
    if (err.message.includes('SSL')) {
      console.log('💡 TIP: Try adding "?sslmode=require" to your DATABASE_URL in .env.local if not present.');
    }
    throw err;
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
      description TEXT,
      banner_url TEXT,
      price DECIMAL(10, 2) DEFAULT 499.00,
      is_premium BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS pdfs (
      id SERIAL PRIMARY KEY,
      section_id INTEGER REFERENCES exam_categories(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) DEFAULT 0.00,
      cloudinary_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      section_id INTEGER REFERENCES exam_categories(id) ON DELETE CASCADE,
      payment_id VARCHAR(255),
      amount DECIMAL(10, 2),
      status VARCHAR(50) DEFAULT 'success',
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
      [' Defence', '(NDA, CDS, Army, Navy, Airforce)'],
      ['TET / CTET', '/ Teacher Bharti'],
      ['Speaking English', '(Communication Skills)'],
      ['Business Ideas', '(Startup Ideas)'],
    ];
    for (const [title, subtitle] of categories) {
      await query('INSERT INTO exam_categories (title, subtitle) VALUES ($1, $2)', [title, subtitle]);
    }
  }

  // 🛡️ Auto-sync Superuser from .env.local
  await syncAdminUser();
}

export async function syncAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env.local. Skipping superuser sync.');
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(adminPassword, salt);

    await query(`
      INSERT INTO users (name, email, password_hash, is_admin, is_blocked, device_switch_count)
      VALUES ('Super Admin', $1, $2, true, false, 0)
      ON CONFLICT (email) DO UPDATE SET 
        is_admin = true, 
        password_hash = EXCLUDED.password_hash, 
        is_blocked = false;
    `, [adminEmail, hash]);

    console.log(`✅ Superuser synchronized: ${adminEmail}`);
  } catch (err: any) {
    console.error('❌ Superuser sync failed:', err.message);
  }
}
