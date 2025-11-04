// Direct script to insert users into Supabase
// This bypasses the API and inserts directly

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase environment variables not found!');
  console.log('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Load users from file
const usersFile = path.join(__dirname, 'data', 'users.json');
const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

console.log('==========================================');
console.log('Direct Users Insert to Supabase');
console.log('==========================================\n');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Users to insert: ${users.length}\n`);

async function insertUsers() {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const user of users) {
    try {
      console.log(`Inserting: ${user.name} (${user.email})...`);
      
      // Prepare user data for Supabase
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'customer',
        status: user.status || 'active',
        total_bookings: user.totalBookings || 0,
        total_spent: user.totalSpent || 0,
        address: user.address || '',
        notes: user.notes || ''
      };

      // Add timestamps if they exist
      if (user.lastLogin) {
        userData.last_login = new Date(user.lastLogin).toISOString();
      }
      if (user.createdAt) {
        userData.created_at = new Date(user.createdAt).toISOString();
      }

      const { data, error } = await supabase
        .from('users')
        .upsert([userData], { onConflict: 'id' })
        .select();

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
        console.error(`  Code: ${error.code}`);
        console.error(`  Details: ${error.details}`);
        
        // Try without timestamps if that's the issue
        if (error.message.includes('last_login') || error.message.includes('created_at')) {
          console.log(`  Retrying without timestamps...`);
          const userWithoutTimestamps = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role || 'customer',
            status: user.status || 'active',
            total_bookings: user.totalBookings || 0,
            total_spent: user.totalSpent || 0,
            address: user.address || '',
            notes: user.notes || ''
          };

          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .upsert([userWithoutTimestamps], { onConflict: 'id' })
            .select();

          if (retryError) {
            console.error(`  ❌ Retry failed: ${retryError.message}`);
            errorCount++;
            errors.push({ user: user.name, error: retryError.message });
          } else {
            console.log(`  ✅ Success (without timestamps)`);
            successCount++;
          }
        } else {
          errorCount++;
          errors.push({ user: user.name, error: error.message });
        }
      } else {
        console.log(`  ✅ Success!`);
        successCount++;
      }
      console.log('');
    } catch (err) {
      console.error(`  ❌ Exception: ${err.message}\n`);
      errorCount++;
      errors.push({ user: user.name, error: err.message });
    }
  }

  console.log('==========================================');
  console.log('Migration Results');
  console.log('==========================================');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => {
      console.log(`  - ${e.user}: ${e.error}`);
    });
  }

  // Verify users were inserted
  console.log('\nVerifying users in Supabase...');
  const { data: allUsers, error: fetchError } = await supabase
    .from('users')
    .select('id, name, email, role');

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError.message);
  } else {
    console.log(`✅ Found ${allUsers?.length || 0} users in Supabase:`);
    allUsers?.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - ${u.role}`);
    });
  }
}

insertUsers().catch(console.error);

