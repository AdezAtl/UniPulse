# UniPulse

A privacy-focused campus social platform for university students.
Built with **Astro**, **vanilla CSS**, and **Supabase**.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in your Supabase project URL and anon key.

### 3. Run the database migration
Open your Supabase project → SQL Editor → paste and run `supabase/migrations/001_schema.sql`.

### 4. Set your first admin
After signing up via `/signup`, run in Supabase SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Start dev server
```bash
npm run dev
# → http://localhost:4321
```

---

## Project Structure

```
unipulse/
├── package.json
├── astro.config.mjs         SSR mode, node adapter, react integration
├── tsconfig.json            Strict TypeScript + path aliases
├── .env.example             Copy to .env and fill in Supabase keys
│
├── public/
│   └── favicon.svg
│
├── supabase/
│   └── migrations/
│       └── 001_schema.sql  Tables, views, RLS policies, stored functions
│
└── src/
    ├── env.d.ts             Astro.locals type declarations
    ├── styles/
    │   └── global.css       Full CSS design system (no Tailwind)
    │
    ├── lib/
    │   ├── database.types.ts  TypeScript types for all DB tables/views
    │   ├── supabase.ts        Supabase client + all query helpers
    │   └── utils.ts           Rate limit constants, date formatters
    │
    ├── middleware/
    │   └── index.ts           Auth guard + admin route protection
    │
    ├── layouts/
    │   ├── BaseLayout.astro   HTML shell (fonts, meta, global CSS)
    │   ├── AppLayout.astro    3-column feed layout + mobile bottom nav
    │   ├── AuthLayout.astro   Centered card (login / signup)
    │   └── AdminLayout.astro  Sidebar admin shell
    │
    ├── components/
    │   ├── PostCard.astro          Feed post card + hidden admin ⋯ menu
    │   ├── feed/
    │   │   ├── Sidebar.astro       Left navigation sidebar
    │   │   ├── PostComposer.astro  Write a post (char counter + cooldown)
    │   │   └── RightPanel.astro    News snippets + posting rules
    │   └── admin/
    │       ├── StatCard.astro      Coloured metric tile
    │       ├── UsersTable.astro    Manage users (promote/demote/ban)
    │       ├── PostsTable.astro    Manage posts (delete/flag/edit)
    │       └── ActivityLog.astro   Audit trail
    │
    └── pages/
        ├── index.astro             / — public landing page
        ├── login.astro             /login
        ├── signup.astro            /signup
        ├── feed.astro              /feed (protected)
        ├── resources.astro         /resources (protected)
        ├── news.astro              /news (protected)
        ├── 404.astro               404 page
        ├── profile/
        │   └── [username].astro    /profile/:username
        ├── admin/
        │   └── index.astro         /admin (admin only)
        └── api/
            ├── posts.ts            POST /api/posts
            ├── likes.ts            POST /api/likes
            ├── resources.ts        POST /api/resources
            ├── auth/
            │   └── signout.ts      POST /api/auth/signout
            └── admin/
                ├── post.ts         POST /api/admin/post
                ├── user.ts         POST /api/admin/user
                └── content.ts      POST /api/admin/content
```

---

## CSS Design System

All styles live in `src/styles/global.css` — no Tailwind, no dependencies.

### CSS custom properties (tokens)
```css
--bg, --bg-2, --bg-3          /* background surfaces */
--border, --border-2, --border-3
--text, --text-2, --text-3    /* primary / muted / hint */
--accent, --accent-bg, --accent-text
--font, --font-mono
--radius-sm/md/lg/xl/full
```
Dark mode is handled automatically via `@media (prefers-color-scheme: dark)`.

### Component classes
| Class | Usage |
|---|---|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger` | Buttons |
| `.btn-sm`, `.btn-xs` | Button size modifiers |
| `.input` | Text input, textarea, select |
| `.label` | Form field label |
| `.card` | White surface card with border |
| `.badge`, `.badge-ok`, `.badge-warn`, `.badge-danger`, `.badge-info`, `.badge-gray` | Status badges |
| `.avatar`, `.avatar-sm/md/lg/xl` | Avatar circles |
| `.nav-item`, `.nav-item.active` | Sidebar nav links |
| `.alert`, `.alert-danger`, `.alert-success`, `.alert-warn` | Alert boxes |
| `.modal-overlay`, `.modal-box` | Modal dialogs |
| `.page-header`, `.page-title` | Sticky page headers |
| `.data-table` | Admin data tables |
| `.tbl-btn`, `.tbl-btn.promote/demote/ban/delete/edit` | Table action buttons |
| `.empty-state` | Empty content placeholder |
| `.pulse-id` | Monospace Pulse ID chip |
| `.logo-mark` | UP brand mark |
| `.muted`, `.hint` | Text helpers |

---

## Features

| Feature | Detail |
|---|---|
| Auth | Username / Email / Pulse ID login, auto-detected |
| Pulse ID | Auto-generated `UP-XXXXXX`, permanent |
| Feed | 280-char posts, reverse chronological |
| Rate limiting | 5 posts/day · 15-min cooldown · live countdown |
| Likes | Toggle, optimistic UI update |
| Resources | Upload links/files |
| Campus News | Admin-only posting |
| Admin Dashboard | 5 tabs: Overview · Users · Posts · Content · Audit Log |
| Admin post menu | Hidden `⋯` per post for admins (flag / edit / delete) |
| Audit Log | Every admin action recorded permanently |
| Security | Middleware + API guard + RLS + SECURITY DEFINER functions |
| Dark mode | `@media (prefers-color-scheme: dark)` — fully automatic |
| Responsive | 3-column desktop → 1-column + bottom nav on mobile |

---

## Deployment

### Vercel
```bash
npm install @astrojs/vercel
```
Update `astro.config.mjs`:
```js
import vercel from '@astrojs/vercel/serverless';
export default defineConfig({ output: 'server', adapter: vercel(), integrations: [react()] });
```

### Cloudflare Pages
```bash
npm install @astrojs/cloudflare
```
```js
import cloudflare from '@astrojs/cloudflare';
export default defineConfig({ output: 'server', adapter: cloudflare(), integrations: [react()] });
```
