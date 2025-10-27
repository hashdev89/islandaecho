# Supabase Image Setup Guide

## Current Situation

Your images exist in two locations:
- **Local**: `public/uploads/` folder (won't work on Vercel)
- **Supabase**: Should be in `isleandecho` bucket at `main/images/`

## Quick Fix - Option 1: Use Migration Endpoint

### Step 1: Access the Migration Endpoint

Open your browser and go to:
```
http://localhost:3000/api/images/migrate-to-supabase
```

Or if running locally with a proper URL:
```
POST http://localhost:3000/api/images/migrate-to-supabase
```

You can use this curl command from your terminal:
```bash
curl -X POST http://localhost:3000/api/images/migrate-to-supabase
```

Or use Postman/Insomnia to send a POST request to that URL.

### Step 2: Check Migration Status

Check what needs to be migrated:
```
GET http://localhost:3000/api/images/migrate-to-supabase
```

This will show:
- How many local images exist
- How many images are in Supabase
- Whether migration is needed

## Option 2: Manual Setup (If migration doesn't work)

### Step 1: Create/Verify Supabase Storage Bucket

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ddacftlxdduzwjaixtvt/storage/buckets)
2. Make sure the bucket `isleandecho` exists
3. Set it to **Public**
4. Set allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
5. Set file size limit: `10485760` (10MB)

### Step 2: Upload Images via Admin Panel

1. Go to Admin Panel → Image Management
2. Click "Upload Images"
3. Upload each image (this will save them to Supabase)

### Step 3: Verify in Supabase

1. Go to Storage in Supabase Dashboard
2. Navigate to `isleandecho` bucket
3. Check that files appear in `main/images/` folder

## Environment Variables

Make sure these are set in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Error: "Bucket not found"
- Check that bucket name is exactly `isleandecho` (case-sensitive)
- Make sure bucket is **public**

### Images not showing after migration
- Check browser console for errors
- Verify image URLs are absolute (starting with `https://`)
- Make sure public permissions are set on the bucket

### Images still not working on Vercel
- Verify all environment variables are set in Vercel dashboard
- Check Supabase logs for errors
- Make sure storage bucket exists and is public

