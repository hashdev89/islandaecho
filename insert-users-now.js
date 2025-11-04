// Direct users insert - Run: node insert-users-now.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load .env.local manually if dotenv not available
let supabaseUrl, supabaseKey;
try {
  require('dotenv').config({ path: '.env.local' });
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
} catch (e) {
  // Fallback: read .env.local directly
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        supabaseKey = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (err) {
    console.error('Could not load .env.local. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const usersFile = path.join(__dirname, 'data', 'users.json');
const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

console.log('Inserting', users.length, 'users into Supabase...\n');

async function insert() {
  for (const user of users) {
    const data = {
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

    if (user.lastLogin) data.last_login = new Date(user.lastLogin).toISOString();
    if (user.createdAt) data.created_at = new Date(user.createdAt).toISOString();

    const { error } = await supabase.from('users').upsert([data], { onConflict: 'id' });

    if (error) {
      console.error(`FAILED: ${user.name} - ${error.message}`);
    } else {
      console.log(`SUCCESS: ${user.name}`);
    }
  }

  const { data: all } = await supabase.from('users').select('id, name, email');
  console.log(`\nTotal users in Supabase: ${all?.length || 0}`);
}

insert();

