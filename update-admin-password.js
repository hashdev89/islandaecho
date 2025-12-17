/**
 * Script to update admin password
 * Run with: node update-admin-password.js
 */

const crypto = require('crypto');

// Hash password function (same as in API)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Configuration
const email = 'hashanthawic@gmail.com';
const password = 'Hash@2025';
const hashedPassword = hashPassword(password);

console.log('='.repeat(50));
console.log('Admin Password Update Script');
console.log('='.repeat(50));
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);
console.log(`Hashed Password: ${hashedPassword}`);
console.log('='.repeat(50));
console.log('\nTo update the password, you can:');
console.log('\n1. Use the API endpoint:');
console.log(`   curl -X POST http://localhost:3000/api/users/update-password \\`);
console.log(`     -H "Content-Type: application/json" \\`);
console.log(`     -d '{"email":"${email}","password":"${password}"}'`);
console.log('\n2. Or use this SQL in Supabase SQL Editor:');
console.log(`   UPDATE users SET password_hash = '${hashedPassword}' WHERE email = '${email}';`);
console.log('\n3. Or use the admin panel:');
console.log('   - Go to Admin → Users');
console.log(`   - Find user: ${email}`);
console.log(`   - Edit user and set password to: ${password}`);
console.log('='.repeat(50));

