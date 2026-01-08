// Script to delete user by email
// Run with: node delete_user_by_email.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function deleteUserByEmail(email) {
  try {
    console.log(`Searching for user with email: ${email}`)
    
    // First, find the user
    const { data: users, error: searchError } = await supabase
      .from('users')
      .select('id, name, email, role, status')
      .eq('email', email.toLowerCase().trim())
    
    if (searchError) {
      console.error('Error searching for user:', searchError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log(`User with email ${email} not found in database.`)
      return
    }
    
    const user = users[0]
    console.log('Found user:', user)
    
    // Check if user is admin
    if (user.role === 'admin') {
      console.error('Cannot delete admin users. Please change the role first.')
      return
    }
    
    // Delete the user
    console.log(`Deleting user with ID: ${user.id}`)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return
    }
    
    console.log(`✅ Successfully deleted user: ${user.name} (${user.email})`)
    
    // Also try to delete from auth.users if it exists
    // Note: This requires admin access and may not work in all Supabase setups
    try {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)
      if (authDeleteError) {
        console.log('Note: Could not delete from auth.users (may not exist or require different permissions)')
      } else {
        console.log('✅ Also deleted from auth.users')
      }
    } catch (err) {
      console.log('Note: Could not delete from auth.users:', err.message)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the deletion
const emailToDelete = 'lakshanperera2920@gmail.com'
deleteUserByEmail(emailToDelete)
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

