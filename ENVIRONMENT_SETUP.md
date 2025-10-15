# Environment Setup Guide

## Supabase Configuration

To resolve the "Falling back to in-memory storage" issue and improve API performance, you need to configure Supabase properly.

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully initialized

### 2. Get Your Credentials

From your Supabase project dashboard:

1. **Project URL**: Go to Settings → API → Project URL
2. **Anon Key**: Go to Settings → API → Project API keys → anon public
3. **Service Role Key**: Go to Settings → API → Project API keys → service_role (keep this secret!)

### 3. Create Environment File

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Other environment variables...
NEXT_PUBLIC_SITE_URL=https://isleandecho.com
NEXT_PUBLIC_SITE_NAME="ISLE & ECHO"
NODE_ENV=development
```

### 4. Database Setup

Run the SQL scripts in your Supabase SQL editor:

1. `supabase_complete_schema.sql` - Creates all necessary tables
2. `supabase_tours_schema.sql` - Creates tours table specifically
3. `supabase_bookings_schema.sql` - Creates bookings table

### 5. Test Configuration

After setting up the environment variables:

1. Restart your development server
2. Check the console logs - you should see "Retrieved X tours from Supabase" instead of fallback messages
3. API response times should be significantly faster (under 200ms)

## Performance Optimizations Applied

### 1. In-Memory Caching
- Tours data is cached in memory for 5 minutes
- Reduces file I/O operations
- Faster subsequent requests

### 2. Timeout Protection
- Supabase queries have a 3-second timeout
- Prevents hanging requests
- Automatic fallback to cached data

### 3. Better Error Handling
- Improved Supabase configuration detection
- More detailed logging
- Response time tracking

### 4. Performance Monitoring
- Added performance utilities in `src/utils/performance.ts`
- Track API response times
- Monitor success rates

## Troubleshooting

### Still Getting Fallback Messages?

1. **Check Environment Variables**: Ensure `.env.local` exists and has correct values
2. **Restart Server**: Environment changes require server restart
3. **Check Supabase Status**: Verify your Supabase project is active
4. **Database Tables**: Ensure tours table exists in Supabase

### Slow Response Times?

1. **Check Network**: Supabase queries depend on network speed
2. **Database Indexes**: Add indexes on frequently queried columns
3. **Connection Pooling**: Supabase handles this automatically
4. **Caching**: The in-memory cache should help with repeated requests

### Database Connection Issues?

1. **Check Credentials**: Verify all Supabase keys are correct
2. **Project Status**: Ensure Supabase project is not paused
3. **Row Level Security**: Check if RLS policies are blocking access
4. **API Limits**: Verify you haven't exceeded Supabase limits

## Expected Performance Improvements

After proper setup:
- **Response Time**: 50-200ms (down from 1100ms+)
- **Cache Hits**: Subsequent requests under 10ms
- **Reliability**: Automatic fallback prevents failures
- **Monitoring**: Detailed performance metrics

## Next Steps

1. Set up Supabase project and credentials
2. Create `.env.local` file with proper values
3. Run database schema scripts
4. Restart development server
5. Test API endpoints and monitor performance
