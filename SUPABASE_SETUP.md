# Supabase Setup Instructions

## Step 1: Get Your Supabase Credentials

1. Go to: https://app.supabase.com/project/sdlcuqnjexqvkrxxyetc/settings/api

2. You'll see these keys:
   - **Project URL** - Copy this to `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key - Copy this to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Update your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://sdlcuqnjexqvkrxxyetc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

## Step 2: Create Your Todos Table in Supabase

Go to: https://app.supabase.com/project/sdlcuqnjexqvkrxxyetc/editor

Click "Create a new table" and use this SQL:

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

Or create manually with these columns:
- `id` (int8, Primary Key, Auto Increment)
- `title` (text, Not Null)
- `description` (text, Nullable)
- `completed` (boolean, Default: false)
- `created_at` (timestamp, Default: now())
- `updated_at` (timestamp, Default: now())

## Step 3: Enable Row Level Security (RLS)

1. Go to Authentication → Policies in Supabase Dashboard
2. Make sure your table allows public read/write (for testing only)
3. For production, implement proper RLS policies

## Step 4: Update .env.local

Replace the placeholder keys with your actual Supabase credentials

## Step 5: Restart Your Dev Server

```bash
npm run dev
```

## API Endpoints

Your API now supports full CRUD:

- **GET /api/hello** - Fetch all todos
- **GET /api/hello?id=1** - Fetch single todo by ID
- **POST /api/hello** - Create new todo
  ```json
  { "title": "My Todo", "description": "Optional description" }
  ```
- **PUT /api/hello** - Update todo
  ```json
  { "id": 1, "title": "Updated", "completed": true }
  ```
- **DELETE /api/hello?id=1** - Delete todo

## Testing with Postman/cURL

```bash
# Get all todos
curl http://localhost:3000/api/hello

# Create todo
curl -X POST http://localhost:3000/api/hello \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Supabase","description":"Connect Next.js to Supabase"}'

# Update todo
curl -X PUT http://localhost:3000/api/hello \
  -H "Content-Type: application/json" \
  -d '{"id":1,"completed":true}'

# Delete todo
curl -X DELETE "http://localhost:3000/api/hello?id=1"
```

## Troubleshooting

1. **"Missing Supabase environment variables"**
   - Check `.env.local` file exists
   - Verify keys are correct and not wrapped in quotes
   - Restart dev server after updating .env.local

2. **"Todos fetched successfully, but data is empty"**
   - Check your todos table has data
   - Verify RLS policies allow read access

3. **"Failed to create todo"**
   - Check table columns match the insert data
   - Verify RLS policies allow write access
   - Check required fields are provided
