# POS System Setup & Deployment Guide

Complete step-by-step guide to setup, configure, and deploy the POS System.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Testing the System](#testing-the-system)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Git**: For version control
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd nextjs
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages:
- `next@16.1.3` - Next.js framework
- `react@19.2.3` - React library
- `@supabase/supabase-js@^2.90.1` - Supabase client
- `@supabase/ssr@^0.4.0` - Supabase SSR utilities
- `tailwindcss@^4` - CSS framework
- `typescript@^5` - TypeScript
- `lucide-react@^1.408.0` - Icon library
- `recharts@^2.12.0` - Charts library

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with email/password or GitHub
4. Create a new organization
5. Create a new project
   - Choose a project name
   - Create a strong database password
   - Select region closest to you
   - Wait 2-3 minutes for initialization

### Step 2: Get Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Keep Service Role Key private!**

### Step 3: Import Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents from `database_schema.sql`
4. Paste into SQL editor
5. Click **"Run"**
6. Wait for schema to complete (1-2 minutes)

### Step 4: Enable Real-Time (Optional)

1. Go to **Database** → **Replication**
2. Click **Enable** for `products` table
3. Click **Enable** for `orders` table
4. Click **Enable** for `inventory_logs` table

---

## Environment Configuration

### Create .env.local File

In project root directory, create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Environment
NODE_ENV=development

# App Configuration
NEXT_PUBLIC_APP_NAME="POS System"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Replace Values

Replace the placeholder values:
- `https://your-project.supabase.co` → Your Supabase project URL
- `your-anon-key-here` → Your Supabase anon key
- `your-service-role-key-here` → Your service role key

⚠️ **Never commit `.env.local` to git!**

---

## Running the Application

### Development Server

```bash
npm run dev
```

The application runs at: **http://localhost:3000**

### Build for Production

```bash
npm run build
```

Creates optimized production build in `.next/` directory.

### Start Production Server

```bash
npm start
```

Requires build step first.

### Lint Code

```bash
npm run lint
```

---

## Testing the System

### Create Demo User (Optional)

**In Supabase SQL Editor**, run:

```sql
-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  NOW(),
  '{}',
  '{}',
  FALSE,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Get the user ID (adjust email if needed)
WITH user_id AS (
  SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1
)
-- Create admin profile
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
  u.id,
  u.email,
  'Admin User',
  'admin',
  true
FROM user_id u
ON CONFLICT DO NOTHING;
```

### Login Credentials

- **Email**: admin@example.com
- **Password**: Test@1234 (use Supabase "Change User Password" feature)

### Test Features

**As Admin:**
1. Navigate to `/dashboard` - View analytics
2. Go to `/inventory` - Manage products
3. Create new product category
4. Add test products

**As Cashier:**
1. Navigate to `/pos` - POS interface
2. Search for products
3. Add items to cart
4. Complete checkout
5. Print receipt

---

## Production Deployment

### Option 1: Netlify (Recommended)

#### Step 1: Connect GitHub

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Choose GitHub and authorize
5. Select your repository

#### Step 2: Configure Build Settings

Netlify auto-detects Next.js:
- **Build command**: `npm run build`
- **Publish directory**: `.next`

#### Step 3: Add Environment Variables

In Netlify dashboard:
1. Go to **Site Settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   NODE_ENV = production
   ```

#### Step 4: Deploy

1. Click **Deploy site**
2. Wait 3-5 minutes
3. Your site is live at `your-site.netlify.app`

### Option 2: Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables
4. Click **Deploy**

### Option 3: Self-Hosted (VPS)

1. **Install Node.js** on server
2. **Clone repository** on server
3. **Create `.env.local`** with production values
4. **Build**: `npm run build`
5. **Start**: `npm start`
6. **Use PM2** for process management:
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name "pos-system"
   pm2 startup
   pm2 save
   ```

---

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Service Role Key is not exposed
- [ ] Database backups configured in Supabase
- [ ] RLS policies enabled on all tables
- [ ] Real-time enabled for critical tables
- [ ] CORS configured if needed
- [ ] SSL certificate installed
- [ ] Database connection pooling enabled
- [ ] Monitoring/logging configured
- [ ] Backup strategy in place

---

## Security Best Practices

### Client-Side
- ✅ Use public Anon Key (`NEXT_PUBLIC_*`)
- ✅ Never store sensitive data in localStorage
- ✅ Validate user input
- ✅ Use HTTPS only in production

### Server-Side
- ✅ Service Role Key in `.env.local` only
- ✅ Validate all API inputs
- ✅ Check user authentication before DB writes
- ✅ Implement rate limiting
- ✅ Enable RLS on all tables
- ✅ Regular security audits

### Database
- ✅ RLS policies on all tables
- ✅ Regular backups
- ✅ Strong passwords
- ✅ Limit database access
- ✅ Monitor query logs

---

## Scaling Considerations

### Database
- Supabase scales automatically for free tier
- Upgrade plan for higher throughput
- Use connection pooling with pgbouncer

### Real-time
- Limit subscriptions to critical data
- Unsubscribe when component unmounts
- Consider message queues for high volume

### CDN
- Enable Netlify CDN for static assets
- Cache API responses when possible
- Use image optimization

### Monitoring
- Setup error tracking (Sentry)
- Monitor database performance
- Track API response times
- Setup alerts for critical errors

---

## Troubleshooting

### "Cannot read property 'supabase' of undefined"
**Solution**: Check `.env.local` is in project root with correct values

### "RLS policy denies access"
**Solution**: 
1. Verify user is logged in
2. Check RLS policies in Supabase
3. Verify user role in profiles table

### "Connection to Supabase failed"
**Solution**:
1. Check internet connection
2. Verify Supabase project is active
3. Check environment variables
4. Verify IP whitelist settings

### "Service role key not found"
**Solution**: 
1. Ensure key is in `.env.local`
2. Check for typos in key name
3. Regenerate key in Supabase

### "Real-time updates not working"
**Solution**:
1. Enable Real-time in Supabase
2. Check table is subscribed correctly
3. Verify RLS allows read access
4. Check browser console for errors

### "Build fails on Netlify"
**Solution**:
1. Check Node version (18+)
2. Verify all dependencies installed
3. Check environment variables
4. View build logs in Netlify

---

## Support Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Netlify Documentation**: https://docs.netlify.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Getting Help

1. Check troubleshooting section
2. Review application logs: `npm run dev`
3. Check Supabase dashboard
4. Review code comments
5. Check GitHub issues

---

**Last Updated**: January 2024  
**Version**: 1.0.0
