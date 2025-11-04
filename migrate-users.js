// Simple Node.js script to migrate users to Supabase
// Run with: node migrate-users.js

const http = require('http');

const SERVER_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
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
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function checkAndMigrate() {
  console.log('==========================================');
  console.log('Users Migration Helper');
  console.log('==========================================');
  console.log('');

  try {
    console.log('Step 1: Checking migration status...');
    console.log('');

    const statusResponse = await makeRequest('/api/users/migrate-to-supabase', 'GET');

    if (statusResponse.success === false) {
      console.log('✗ Status check failed');
      console.log('Error:', statusResponse.error);
      
      if (statusResponse.error && statusResponse.error.includes('table does not exist')) {
        console.log('');
        console.log('⚠ The users table doesn\'t exist in Supabase.');
        console.log('Please run the SQL schema file: supabase_users_schema.sql');
        console.log('in your Supabase SQL Editor first.');
      } else if (statusResponse.error && statusResponse.error.includes('not configured')) {
        console.log('');
        console.log('⚠ Supabase is not configured.');
        console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        console.log('in your .env.local file.');
      }
      return;
    }

    console.log('✓ Migration status check successful');
    console.log('');
    console.log('Local Users:', statusResponse.localUsers?.count || 0);
    console.log('Supabase Users:', statusResponse.supabaseUsers?.count || 0);
    console.log('Needs Migration:', statusResponse.needsMigration ? 'Yes' : 'No');

    if (statusResponse.needsMigration && statusResponse.missingInSupabase > 0) {
      console.log('');
      console.log('Missing users in Supabase:', statusResponse.missingInSupabase);
      console.log('');
      console.log('Step 2: Running migration...');
      console.log('');

      const migrationResponse = await makeRequest('/api/users/migrate-to-supabase', 'POST');

      if (migrationResponse.success) {
        console.log('✓ Migration completed successfully!');
        console.log('');
        console.log('Results:');
        console.log(`  - Migrated: ${migrationResponse.migratedCount}`);
        console.log(`  - Skipped (already exist): ${migrationResponse.skippedCount}`);
        console.log(`  - Errors: ${migrationResponse.errorCount}`);

        if (migrationResponse.errorCount > 0 && migrationResponse.errors) {
          console.log('');
          console.log('Errors:');
          migrationResponse.errors.forEach(err => {
            console.log(`  - ${err.user}: ${err.error}`);
          });
        }

        if (migrationResponse.migratedUsers && migrationResponse.migratedUsers.length > 0) {
          console.log('');
          console.log('Migrated users:');
          migrationResponse.migratedUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
          });
        }
      } else {
        console.log('✗ Migration failed');
        console.log('Error:', migrationResponse.error);
      }
    } else {
      console.log('');
      console.log('✓ All users are already in Supabase!');
      console.log('No migration needed.');
    }
  } catch (error) {
    console.log('✗ Could not connect to the migration endpoint');
    console.log('Error:', error.message);
    console.log('');
    console.log('Make sure:');
    console.log('  1. Your Next.js dev server is running (npm run dev)');
    console.log('  2. The server is accessible at http://localhost:3000');
  }

  console.log('');
  console.log('==========================================');
  console.log('Migration check complete!');
  console.log('==========================================');
}

checkAndMigrate();

