
const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { users } = require('./shared/schema');
const { eq } = require('drizzle-orm');

// Database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function setSingleAdmin() {
  try {
    console.log('Setting all users to non-admin status...');
    
    // First, set all users to non-admin
    await db.update(users).set({ isAdmin: false });
    
    console.log('Setting amirproff0@gmail.com as the only admin...');
    
    // Then set only amirproff0@gmail.com as admin
    const result = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.email, 'amirproff0@gmail.com'));
    
    console.log('✅ Successfully set amirproff0@gmail.com as the only admin');
    console.log('All other users have been set to non-admin status');
    
  } catch (error) {
    console.error('❌ Error updating admin status:', error);
  }
}

setSingleAdmin();
