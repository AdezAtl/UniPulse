# UniPulse ⚡

A privacy-focused, high-performance campus social platform for university students.  
Built with **Astro (SSR)**, **Express / Node.js (RPC Micro-backend)**, **SQLite (`better-sqlite3`)**, and **Vanilla CSS**.

---

## 🚀 Quick Start

### 1. Install dependencies
Install dependencies for both the frontend and the backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure environment variables
Create `.env` in the root directory:
```env
BACKEND_URL=http://localhost:3000
INTERNAL_API_KEY=unipulse_secret_development_api_key_12345
```

Create `backend/.env`:
```env
PORT=3000
INTERNAL_API_KEY=unipulse_secret_development_api_key_12345
```

### 3. Start the Backend RPC Server
```bash
cd backend
npm run dev
# → Backend running on http://localhost:3000
```

### 4. Start the Frontend Dev Server
In a separate terminal tab/window:
```bash
npm run dev
# → Frontend running on http://localhost:4321
```

### 5. Set Up Admin Permissions
After signing up via `/signup`, grant your account admin access using the included CLI helper:
```bash
npx tsx make-admin.ts <your_username>
```

---

## 📁 Project Structure

```
unipulse/
├── package.json
├── astro.config.mjs         # SSR mode, Node adapter, Vercel support
├── tsconfig.json            # Strict TypeScript + path aliases
├── make-admin.ts            # CLI tool to grant admin rights to users
├── pitch_deck_design_brief.md # Strategic design & product architecture overview
├── .env.example             # Frontend environment template
├── data/
│   └── unipulse.db          # SQLite database (auto-created on initialization)
│
├── backend/                 # Standalone Express / RPC Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── index.ts         # Express server & RPC router with API key guard
│       ├── db.ts            # SQLite database schema, queries, & migrations
│       └── auth.ts          # Password hashing & authentication helpers
│
├── public/
│   ├── favicon.svg
│   └── uploads/             # User uploaded media & images
│
└── src/
    ├── env.d.ts             # Astro type declarations
    ├── styles/
    │   └── global.css       # Full CSS design system (zero-dependency)
    │
    ├── lib/
    │   ├── db.ts            # RPC Client adapter calling Express backend
    │   └── utils.ts         # Rate limiting, date formatting, and utilities
    │
    ├── middleware/
    │   └── index.ts         # Auth guards & admin route protection
    │
    ├── layouts/
    │   ├── BaseLayout.astro # Base HTML shell & meta tags
    │   ├── AppLayout.astro  # 3-column responsive layout with mobile bottom nav
    │   ├── AuthLayout.astro # Centered authentication card layout
    │   └── AdminLayout.astro# Sidebar admin interface layout
    │
    ├── components/
    │   ├── PostCard.astro          # Feed post card & contextual admin options
    │   ├── feed/
    │   │   ├── Sidebar.astro       # Navigation sidebar
    │   │   ├── PostComposer.astro  # Post creation (char counter + rate limiting)
    │   │   └── RightPanel.astro    # News snippets & community guidelines
    │   └── admin/
    │       ├── StatCard.astro      # Analytics metric tile
    │       ├── UsersTable.astro    # User management (roles, bans, search)
    │       ├── PostsTable.astro    # Content moderation (delete, flag, edit)
    │       └── ActivityLog.astro   # System audit log trail
    │
    └── pages/
        ├── index.astro             # Landing page
        ├── login.astro             # Sign-in page
        ├── signup.astro            # Registration page
        ├── feed.astro              # Main campus feed (protected)
        ├── resources.astro         # Student resource sharing (protected)
        ├── news.astro              # Official campus news feed (protected)
        ├── 404.astro               # Custom 404 page
        ├── profile/
        │   └── [username].astro    # User profile & posts (/profile/:username)
        ├── admin/
        │   └── index.astro         # Admin Dashboard (/admin)
        └── api/
            ├── posts.ts            # POST /api/posts
            ├── likes.ts            # POST /api/likes
            ├── resources.ts        # POST /api/resources
            ├── auth/
            │   ├── signin.ts       # POST /api/auth/signin
            │   ├── signup.ts       # POST /api/auth/signup
            │   └── signout.ts      # POST /api/auth/signout
            └── admin/
                ├── post.ts         # Moderation RPC endpoints
                ├── user.ts         # User management endpoints
                └── content.ts      # Content management endpoints
```

---

## 🎨 CSS Design System

All styles live in `src/styles/global.css` — built with zero CSS frameworks or heavy external dependencies.

### CSS Custom Properties (Tokens)
```css
--bg, --bg-2, --bg-3          /* Surface & background levels */
--border, --border-2, --border-3
--text, --text-2, --text-3    /* High-contrast, muted, and subtle text */
--accent, --accent-bg, --accent-text
--font, --font-mono
--radius-sm/md/lg/xl/full
```
*Automatic dark mode is enabled via `@media (prefers-color-scheme: dark)`.*

### Key UI Component Classes
| Class | Usage |
|---|---|
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger` | Buttons |
| `.btn-sm`, `.btn-xs` | Button sizing modifiers |
| `.input` | Form text fields, textareas, and selects |
| `.label` | Form labels |
| `.card` | Surface card container |
| `.badge`, `.badge-ok`, `.badge-warn`, `.badge-danger`, `.badge-info` | Status chips & pills |
| `.avatar`, `.avatar-sm/md/lg/xl` | User avatar containers |
| `.nav-item`, `.nav-item.active` | Sidebar navigation links |
| `.alert`, `.alert-danger`, `.alert-success`, `.alert-warn` | System feedback alerts |
| `.modal-overlay`, `.modal-box` | Dialog overlays |
| `.data-table` | Responsive administrative tables |
| `.pulse-id` | Monospace Pulse ID tag |

---

## ✨ Features & Architecture

| Feature | Detail |
|---|---|
| **Architecture** | Astro SSR frontend connected via RPC to an Express + SQLite backend microservice |
| **Authentication** | Sign in with Email, Username, or auto-generated **Pulse ID** (`UP-XXXXXX`) |
| **Security & API Auth** | Protected RPC endpoints secured with internal API key header (`x-api-key`) |
| **Campus Feed** | Real-time reverse chronological feed with media upload support |
| **Posting Guard** | Built-in character counter (280 max) & rate limiting (5 posts/day, 15-min cooldown) |
| **Engagements** | Optimistic like toggles & comment threads |
| **Resource Hub** | Campus resource and link directory |
| **Campus News** | Official updates posted exclusively by platform admins |
| **Admin Dashboard** | Full-featured moderation dashboard with real-time stats, user management, post actions, and immutable audit logging |
| **CLI Admin Tool** | Simple command `npx tsx make-admin.ts <username>` for local admin elevation |
| **Theme** | Automatic Dark/Light mode switching based on system preferences |

---

## 🛠️ Tech Stack

- **Frontend Framework**: [Astro 5](https://astro.build/) (Server-Side Rendering)
- **Backend Server**: Express.js (Node.js 20+) RPC server
- **Database**: [SQLite](https://sqlite.org/) via `better-sqlite3`
- **Styling**: Modern Vanilla CSS Design System with custom property tokens
- **TypeScript**: Strict type definitions for end-to-end type safety

---

## 📄 License

MIT License

