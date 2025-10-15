# Complete Tours Data Migration Guide

## Step 1: Update Supabase Schema

Run this SQL in your Supabase SQL Editor to add all the missing columns:

```sql
-- Complete Tours Table Schema for Supabase
-- This will update your existing tours table to include all fields

-- First, let's add the missing columns to the existing tours table
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS destinations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS key_experiences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS inclusions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS exclusions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS accommodation JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS importantInfo JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS style TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0;

-- Update existing columns to allow NULL values where needed
ALTER TABLE tours 
ALTER COLUMN description DROP NOT NULL,
ALTER COLUMN transportation DROP NOT NULL,
ALTER COLUMN groupsize DROP NOT NULL,
ALTER COLUMN difficulty DROP NOT NULL,
ALTER COLUMN besttime DROP NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(featured);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_style ON tours(style);
CREATE INDEX IF NOT EXISTS idx_tours_createdat ON tours(createdat);
```

## Step 2: Run Complete Migration

After updating the schema, run the complete migration:

```bash
# Test the complete migration endpoint
curl -X POST http://localhost:3000/api/complete-migrate
```

Or use PowerShell:
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/complete-migrate' -Method Post
```

## Step 3: Verify Complete Data

Test the API to see all your tour data:

```bash
curl http://localhost:3000/api/tours
```

## What This Migration Includes

### Complete Tour Data Fields:
- ✅ **Basic Info**: name, duration, price, description
- ✅ **Destinations**: Array of destination names
- ✅ **Highlights**: Array of tour highlights  
- ✅ **Key Experiences**: Array of key experiences
- ✅ **Itinerary**: Complete day-by-day itinerary with activities
- ✅ **Inclusions**: What's included in the tour
- ✅ **Exclusions**: What's not included
- ✅ **Accommodation**: Accommodation details
- ✅ **Images**: Array of image URLs
- ✅ **Important Info**: Requirements and what to bring
- ✅ **Style**: Tour style (Adventure, Cultural, etc.)
- ✅ **Rating & Reviews**: Tour ratings and review counts
- ✅ **Destinations & Route**: Route information field
- ✅ **Including All**: Including all information field
- ✅ **Metadata**: featured, status, timestamps

### Database Schema Benefits:
- ✅ **JSONB Fields**: Efficient storage for arrays and objects
- ✅ **Indexes**: Fast queries on common fields
- ✅ **Flexible**: Easy to add new fields later
- ✅ **Performance**: Optimized for your use case

## Expected Results

After migration, you should see:
1. **All tour details** in Supabase (destinations, itinerary, etc.)
2. **Complete data** in frontend and admin
3. **Fast performance** with proper indexing
4. **No more fallback** to file storage

## Troubleshooting

If you get errors:
1. **Check Supabase permissions** - ensure your service role key has table modification rights
2. **Verify schema** - make sure all columns were added successfully
3. **Check logs** - look at the server console for detailed error messages

## Next Steps

After successful migration:
1. **Test frontend** - verify all tour details display correctly
2. **Test admin** - ensure you can edit tours with all fields
3. **Test creation** - create a new tour to verify everything works
4. **Clean up** - remove the migration endpoints if no longer needed
