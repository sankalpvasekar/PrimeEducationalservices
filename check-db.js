const { query } = require('./lib/db');

async function checkSync() {
  try {
    console.log('--- Checking DB users ---');
    const users = await query('SELECT id, email, is_admin FROM users LIMIT 10');
    console.log('Users in DB:', JSON.stringify(users, null, 2));
    
    console.log('\n--- Checking Env ---');
    console.log('ADMIN_EMAIL env:', process.env.ADMIN_EMAIL);
    
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
       const user = await query('SELECT * FROM users WHERE email = $1', [adminEmail]);
       console.log('Specific Admin Record:', JSON.stringify(user, null, 2));
    }
  } catch (err) {
    console.error('❌ Error during check:', err);
  }
}

checkSync();
