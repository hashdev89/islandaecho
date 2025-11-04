// Simple migration runner
const http = require('http');

console.log('Starting users migration...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users/migrate-to-supabase',
  method: 'POST'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.success) {
        console.log('SUCCESS! Migration completed.\n');
        console.log(`Migrated: ${result.migratedCount}`);
        console.log(`Skipped: ${result.skippedCount}`);
        console.log(`Errors: ${result.errorCount}\n`);
        
        if (result.migratedUsers && result.migratedUsers.length > 0) {
          console.log('Migrated users:');
          result.migratedUsers.forEach(u => {
            console.log(`  - ${u.name} (${u.email})`);
          });
        }
        
        if (result.errors && result.errors.length > 0) {
          console.log('\nErrors:');
          result.errors.forEach(e => {
            console.log(`  - ${e.user}: ${e.error}`);
          });
        }
      } else {
        console.log('FAILED!');
        console.log(`Error: ${result.error}`);
      }
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('ERROR:', error.message);
  console.log('\nMake sure your Next.js dev server is running on http://localhost:3000');
});

req.end();

