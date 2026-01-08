# Chat System Setup Instructions

## Error: "Failed to load chat. Please try again."

This error occurs when the database tables for the chat system haven't been created yet.

## Quick Fix (Temporary - File Storage)

The chat system now has a **fallback mechanism** that uses file storage if the database tables don't exist. The chat will work immediately, but for production use, you should set up the database.

## Permanent Setup (Recommended)

### Step 1: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_chat_schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `conversations` table - stores chat conversations
- `messages` table - stores individual messages
- All necessary indexes and triggers

### Step 2: Verify Tables Exist

After running the SQL, verify the tables were created:
- Go to **Table Editor** in Supabase
- You should see `conversations` and `messages` tables

### Step 3: Test the Chat

1. Open your website
2. Click the chat button (bottom right)
3. The chat should now work with database storage

## File Storage (Fallback)

If database tables don't exist, conversations and messages are stored in:
- `data/chat/conversations.json`
- `data/chat/messages.json`

**Note:** File storage is temporary and should only be used for development. For production, always use the database.

## Troubleshooting

### Still seeing errors?

1. **Check Supabase connection:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
   - Make sure they're not placeholder values

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for error messages in the Console tab

3. **Check server logs:**
   - Look at your terminal/console where Next.js is running
   - Check for any error messages

4. **Verify SQL was executed:**
   - Go to Supabase SQL Editor
   - Run: `SELECT * FROM conversations LIMIT 1;`
   - If it works, tables exist. If it errors, tables don't exist.

## Next Steps

Once the database is set up:
- Chat will work with real-time updates
- Messages will persist in the database
- Admin/staff can manage conversations from `/admin/chat`

