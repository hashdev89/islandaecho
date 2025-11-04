# Quick Fix: Insert Users to Supabase

## Step 1: Fix RLS Policies in Supabase

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to manage users" ON users;
DROP POLICY IF EXISTS "Allow service role to manage users" ON users;

-- Allow public read
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

-- Allow service role full access (bypasses RLS)
CREATE POLICY "Allow service role full access" ON users
  FOR ALL USING (true);
```

## Step 2: Insert Users - Choose ONE method:

### Method A: Browser Console (EASIEST)
1. Open browser → http://localhost:3000
2. Press F12 → Console tab
3. Paste and run:

```javascript
fetch('http://localhost:3000/api/users/migrate-to-supabase', {method: 'POST'})
.then(r => r.json())
.then(d => {
  console.log('Result:', d);
  if(d.success) alert(`Success! Migrated ${d.migratedCount} users`);
  else alert('Error: ' + d.error);
});
```

### Method B: Direct SQL Insert (FASTEST)
Go to Supabase SQL Editor and run:

```sql
INSERT INTO users (id, name, email, phone, role, status, total_bookings, total_spent, address, notes, created_at, last_login)
VALUES 
  ('6', 'Admin User', 'admin@isleandecho.com', '+94-11-234-5678', 'admin', 'active', 0, 0, '', '', '2024-01-01T00:00:00Z', '2024-12-20T08:00:00Z'),
  ('7', 'Hashantha Bandara', 'hashanthawic@gmail.com', '0769212943', 'admin', 'active', 0, 0, '', '', '2025-11-04T05:55:15.388Z', '2025-11-04T05:55:15.387Z')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status;
```

## Step 3: Verify
1. Check Supabase Dashboard → Table Editor → users (should see 2 users)
2. Visit http://localhost:3000/api/users (should show users from Supabase)
3. Check Vercel after deploying (should work once data is in Supabase)

## Step 4: Deploy to Vercel
After users are in Supabase:
```bash
git add src/app/api/users/
git commit -m "Fix users API for Supabase"
git push origin main
```

