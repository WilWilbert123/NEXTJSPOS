# Next.js Complete Guide: SSR, SSG, API Routes & CRUD

## How Next.js Works

Next.js is a **React framework** that enables:
- **Full-stack development** (frontend + backend in same project)
- **Multiple rendering strategies** (SSR, SSG, CSR)
- **Built-in API routes** (no separate backend needed)
- **File-based routing** (files = routes automatically)

---

## 1. SSR (Server-Side Rendering)

**What it does:** Renders page HTML on the server for EVERY request
**When to use:** Real-time data, user-specific content, SEO-critical dynamic pages

```
Request → Server renders page → HTML sent to browser → Browser shows page
```

**Example Use Cases:**
- User dashboards (personalized content)
- E-commerce product pages with live inventory
- Social media feeds

**File:** `app/examples/ssr-page.tsx`

---

## 2. SSG (Static Site Generation)

**What it does:** Renders pages at BUILD TIME and caches them
**When to use:** Content that doesn't change often, maximum performance

```
Build time → Generate static HTML → Cache on CDN → Serve instantly
```

**Example Use Cases:**
- Blog posts
- Documentation
- Product landing pages
- Terms of Service

**File:** `app/examples/ssg-page.tsx`

**ISR (Incremental Static Regeneration):**
Revalidate pages periodically without full rebuild:
```typescript
revalidate: 60 // Rebuild every 60 seconds if requested
```

---

## 3. API Routes

**What it does:** Backend endpoints without separate server
**Location:** `app/api/**/route.ts` automatically becomes `/api/**` endpoint

```
Client → POST /api/todos → Server logic → Database → Response
```

**Supports:** GET, POST, PUT, DELETE, PATCH, etc.

**File:** `app/api/todos/route.ts`

---

## 4. CRUD Operations

**CRUD = Create, Read, Update, Delete**

### Example Flow:

```
USER INTERFACE (React Component)
        ↓
   Client-side form
        ↓
   fetch('/api/todos', { method: 'POST' })
        ↓
   API ROUTE (Node.js backend)
        ↓
   Business logic / Database
        ↓
   JSON Response
        ↓
   Update UI state
```

**File:** `app/examples/todos-crud.tsx`

---

## Routing Structure

```
app/
├─ page.tsx              → / (homepage)
├─ about/
│  └─ page.tsx          → /about
├─ blog/
│  └─ [id]/
│     └─ page.tsx       → /blog/:id (dynamic)
├─ api/
│  ├─ todos/
│  │  └─ route.ts       → GET/POST /api/todos
│  └─ todos/[id]/
│     └─ route.ts       → GET/PUT/DELETE /api/todos/:id
└─ examples/
   ├─ ssr-page.tsx
   ├─ ssg-page.tsx
   └─ todos-crud.tsx
```

---

## Request Flow Examples

### Reading Data (SSR)
```
1. User visits /blog/123
2. Next.js calls getServerSideProps()
3. Fetches data from database/API
4. Renders HTML with data
5. Browser receives fully rendered page
6. JavaScript hydration for interactivity
```

### Creating Todo (CRUD)
```
1. User types in form, clicks "Add"
2. React component: fetch('/api/todos', { method: 'POST' })
3. API route receives request
4. Logic: Validate → Add to database → Return new item
5. Component receives JSON response
6. Updates state, UI re-renders
```

### API Route Processing
```
CLIENT REQUEST (e.g., DELETE /api/todos?id=1)
           ↓
    app/api/todos/route.ts
           ↓
    exports async function DELETE(request)
           ↓
    Parse request → Find item → Delete → Return response
           ↓
    NextResponse.json(result)
           ↓
    JSON sent to client
```

---

## Comparison Table

| Feature | SSR | SSG | API Routes | CSR (Client-Side) |
|---------|-----|-----|-----------|------------------|
| **Renders at** | Each request | Build time | On-demand | Browser |
| **Performance** | Good | Best | Fast | Slowest |
| **Fresh data** | Always | Not current | Always | Always |
| **Best for** | Real-time data | Static content | Backend logic | Interactive UIs |
| **SEO** | Great | Great | N/A | Poor |
| **Example** | User dashboard | Blog post | Todo API | Chat bubble |

---

## Running the Examples

1. **Copy the CRUD component into a page:**
   ```bash
   # In app/todos/page.tsx
   import TodosCRUD from '@/app/examples/todos-crud'
   export default function TodosPage() {
     return <TodosCRUD />
   }
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test the API:**
   - Visit: `http://localhost:3000/api/todos` (GET all)
   - Use Postman/Curl for POST/PUT/DELETE

4. **Test CRUD UI:**
   - Visit: `http://localhost:3000/todos`
   - Add, complete, delete todos

---

## Key Concepts Summary

- **Next.js = React + SSR/SSG + API Routes + Routing**
- **API Routes** = Backend without separate server
- **SSR** = Fresh data every request
- **SSG** = Pre-built pages, maximum speed
- **CRUD** = Create/Read/Update/Delete via API
- **Full-stack** = Frontend and backend in same project

