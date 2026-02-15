# Supabase setup

## Blog posts (required for Vercel)

On Vercel the app cannot write to the filesystem. Blog posts are stored in the **database** so they persist.

1. In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor** → **New query**.
2. Paste and run the contents of `migrations/20250215000000_create_blog_posts.sql`.
3. Ensure your Vercel project has env vars: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

After that, adding/editing blog posts in Admin → Blog will save to Supabase and appear on the live site.
