// Simple script to run users migration
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users/migrate-to-supabase',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      console.log('\n==========================================');
      console.log('Users Migration Results');
      console.log('==========================================\n');
      
      if (result.success) {
        console.log('✓ Migration completed successfully!\n');
        console.log(`Migrated: ${result.migratedCount}`);
        console.log(`Skipped: ${result.skippedCount}`);
        console.log(`Errors: ${result.errorCount}\n`);
        
        if (result.migratedUsers && result.migratedUsers.length > 0) {
          console.log('Migrated users:');
          result.migratedUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email})`);
          });
        }
        
        if (result.errors && result.errors.length > 0) {
          console.log('\nErrors:');
          result.errors.forEach(err => {
            console.log(`  - ${err.user}: ${err.error}`);
          });
        }
      } else {
        console.log('✗ Migration failed');
        console.log(`Error: ${result.error}\n`);
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('\nMake sure your Next.js dev server is running on http://localhost:3000');
});

req.end();

