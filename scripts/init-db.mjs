import { initDB } from './lib/db';

async function setup() {
  console.log('🚀 Initializing database...');
  try {
    await initDB();
    console.log('✅ Database tables created and seeded.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

setup();
