# Vercel Deployment Guide for ISLE & ECHO

## Environment Variables Setup

To ensure your Featured Tour Packages show up on Vercel, you need to configure these environment variables in your Vercel dashboard:

### Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your Supabase project URL
   - Example: `https://ddacftlxddzuwjaixvtv.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key (not the anon key)
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **NEXT_PUBLIC_SITE_URL** (Optional)
   - Value: Your production domain
   - Example: `https://your-domain.vercel.app`

### How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environment**: Production, Preview, Development
5. Repeat for `SUPABASE_SERVICE_ROLE_KEY`

### Supabase Configuration Check

The API will automatically detect if Supabase is properly configured by checking:
- ✅ URL exists and contains 'supabase.co'
- ✅ Service key exists and is not placeholder
- ✅ Service key length is > 50 characters

### Fallback System

If Supabase is not configured or fails, the API will automatically use embedded fallback data with 3 featured tours:
- Adventure & Fun Tour – 10 Days
- Cultural Heritage Tour – 8 Days  
- Wildlife Safari Adventure – 6 Days

### Testing Your Deployment

After deploying to Vercel, test these endpoints:

1. **Main Tours API**: `https://your-domain.vercel.app/api/tours`
2. **Fallback Test**: `https://your-domain.vercel.app/api/test-fallback`

### Troubleshooting

If tours still don't show:

1. **Check Vercel Logs**:
   - Go to Vercel dashboard → Functions tab
   - Check for errors in `/api/tours` function

2. **Verify Environment Variables**:
   - Ensure variables are set for Production environment
   - Check that values don't have extra spaces or quotes

3. **Test Supabase Connection**:
   - Visit `/api/test-supabase` to verify database connection

4. **Check Database Data**:
   - Ensure your Supabase tours table has data
   - Verify `featured` column is set to `true` for featured tours

### Database Schema Verification

Your Supabase tours table should have these columns:
- `id` (text)
- `name` (text)
- `duration` (text)
- `price` (text)
- `destinations` (text[])
- `highlights` (text[])
- `key_experiences` (jsonb)
- `itinerary` (jsonb)
- `featured` (boolean)
- `status` (text)
- And other fields as per your schema

### Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase project is active
- [ ] Tours table has data with `featured: true`
- [ ] API endpoints responding correctly
- [ ] Frontend displaying tour data

## Support

If you continue to have issues:
1. Check Vercel function logs
2. Test API endpoints directly
3. Verify Supabase connection
4. Ensure database has proper data
