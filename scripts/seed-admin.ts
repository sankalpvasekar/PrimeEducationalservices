import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Manually parse .env.local
const envPath = join(__dirname, '../.env.local');
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

const { Pool } = pg;

async function seedAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const email = process.env.ADMIN_EMAIL || 'primeeducationalservices515@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Amol@123';
  const name = 'Super Admin';

  try {
    console.log(`🚀 Seeding Admin: ${email}...`);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Upsert Admin
    const query = `
      INSERT INTO users (name, email, password_hash, is_admin, is_blocked, device_switch_count)
      VALUES ($1, $2, $3, true, false, 0)
      ON CONFLICT (email) 
      DO UPDATE SET 
        is_admin = true, 
        password_hash = EXCLUDED.password_hash, 
        is_blocked = false, 
        device_switch_count = 0;
    `;

    await pool.query(query, [name, email, hash]);
    
    console.log('✅ Admin user created/updated successfully!');
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
