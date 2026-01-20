# ✅ Supabase Setup Checklist

## To save data to Supabase, you MUST do these 3 things:

### 1️⃣ Get Your Anon Key
- Go to: https://app.supabase.com/project/sdlcuqnjexqvkrxxyetc/settings/api
- Copy the **anon public** key (long alphanumeric string)
- ❌ Don't copy the "service_role" key - use the "anon" key!

### 2️⃣ Update .env.local
Open `.env.local` in your editor and replace:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```
with your actual key (NO QUOTES):
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
```

### 3️⃣ Create Todos Table in Supabase
Go to: https://app.supabase.com/project/sdlcuqnjexqvkrxxyetc/editor

Run this SQL:
```sql
CREATE TABLE todos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4️⃣ Restart Dev Server
```bash
npm run dev
```

Then click "Add Todo to Supabase" - it will save! ✅

---

## If it's NOT saving, check:

1. ❌ **Missing .env.local key** - Copy the exact anon key (no quotes)
2. ❌ **Todos table doesn't exist** - Create it in Supabase dashboard  
3. ❌ **RLS policies blocking writes** - Go to Authentication → Policies and enable
4. ❌ **Dev server not restarted** - After updating .env.local, restart `npm run dev`

## Quick Test:

Open browser console (F12) and look for errors when clicking "Add Todo"

If you see:
- ✅ Green notification → **It's saving!**
- ❌ Red error → Check console for details
