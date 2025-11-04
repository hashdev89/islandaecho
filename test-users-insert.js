// Test script to directly test inserting a user into Supabase
// This helps debug if the issue is with the migration endpoint or Supabase itself

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase environment variables not found!');
  console.log('Make sure .env.local has:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL');
  console.log('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
  console.log('Testing direct user insert to Supabase...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Key length:', supabaseServiceKey.length);
  console.log('');

  const testUser = {
    id: 'test-' + Date.now(),
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    role: 'customer',
    status: 'active',
    total_bookings: 0,
    total_spent: 0,
    address: '',
    notes: 'Test user for migration debugging'
  };

  console.log('Attempting to insert test user:', testUser);
  console.log('');

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (error) {
      console.error('❌ Insert failed!');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.log('\n⚠️  RLS Policy Issue Detected!');
        console.log('The service role should bypass RLS, but it seems blocked.');
        console.log('Try running: fix-users-rls.sql in your Supabase SQL Editor');
      }
    } else {
      console.log('✅ Insert successful!');
      console.log('Inserted data:', data);
      
      // Clean up test user
      console.log('\nCleaning up test user...');
      await supabase.from('users').delete().eq('id', testUser.id);
      console.log('✅ Test user cleaned up');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

testInsert();

