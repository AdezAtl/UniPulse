# UniPulse - Pitch Deck Design Brief

This document compiles the brand identity, core value proposition, key product features, color systems, and a slide-by-slide pitch deck outline for **UniPulse** to share with a designer.

---

## 1. Product Overview & Value Proposition

### What is UniPulse?
UniPulse is a modern, real-time campus social network and utility platform customized specifically for university ecosystems. It acts as the central digital hub for students, faculty, department clubs, and campus administrators.

### The Problem It Solves:
1. **Campus Fragmentation**: University announcements, student posts, course files, and event lists are spread across separate legacy portals (LMS, Facebook groups, Discord servers, email chains).
2. **Local Engagement Deficit**: General-purpose social media lacks local university focus, academic levels, and department filters.
3. **Utility Deficit**: Standard social networks don't combine socialization with utility features like peer-to-peer study resource file-sharing or course calendars.

### The Solution (The "Central Pulse"):
UniPulse integrates social connections with academic utility. It combines a Reddit/Twitter-style feed with class note sharing repositories, event registrations, and direct messages—fully verified by institutional accounts.

---

## 2. Brand Identity & Design System

### Tone of Voice & Personality:
- **Clean & Modern**: Feels like a professional, state-of-the-art web application.
- **Organic & Grounded**: Avoids overly futuristic or "AI-like" neon gradients; prefers neutral, natural stone tones with warm gray hues.
- **Engaging & Playful**: Subtle micro-animations, pastel cards, custom avatar rings, and emoji hover reactions make it interactive.

### Color Palette (Redesign Specs):
*   **Neutral Light Mode Background**: Warm stone linear gradient
    *   From: `#f5f5f4` (Stone 100)
    *   To: `#e7e5e4` (Stone 200)
*   **Neutral Dark Mode Background**: Matte charcoal linear gradient
    *   From: `#1c1917` (Stone 900)
    *   To: `#0c0a09` (Stone 950)
*   **Brand Accents**: High-contrast Indigo to Purple gradient
    *   Primary Accent: `#6366f1` (Indigo 500)
    *   Secondary Accent: `#8b5cf6` (Purple 500)
*   **Pastel Feed Card Tints**: Used dynamically to visually categorise posts:
    *   *Soft Blue (s/compsci)*: `#eff6ff` (border: `rgba(59, 130, 246, 0.12)`)
    *   *Soft Yellow (s/events)*: `#fffbeb` (border: `rgba(245, 158, 11, 0.12)`)
    *   *Soft Pink (s/campuslife)*: `#fdf2f8` (border: `rgba(236, 72, 153, 0.12)`)
    *   *Dark Mode equivalents*: `#0f172a` (Blue), `#1c1917` (Charcoal), `#25162b` (Purple)

### Typography:
- **Body & Headings**: `Geist` (a modern, geometric sans-serif font).
- **Metadata / Code Blocks**: `Geist Mono` (for levels, pulse IDs, and timestamps).

---

## 3. Platform Architecture & Features

### A. The Three-Column Dashboard (Desktop)
1.  **Left Sidebar (Navigation & Identity)**:
    *   *Profile Header*: Large user avatar, name, and `@username`.
    *   *Menu Items*: News Feed, Events, Resources, News, Saved, Messages, and Notifications with solid black pill active states.
    *   *Badges*: Round black notification indicators.
    *   *App Download Card*: Modern promotional card at the bottom.
2.  **Center Column (The Feed)**:
    *   *Post Composer*: Minimalist inline input with toolbar buttons (`Image`, `File`, `Location`, and `Public ▾`) and a dark `Send` pill.
    *   *Vibrant Posts*: Dynamic, pastel-tinted cards. Mention links render as custom pills containing user avatars.
    *   *LinkedIn-style Reactions*: Hovering on the Upvote button reveals a floating emojis row (`🔥`, `🙌`, `😮`, `😢`, `❤️`).
3.  **Right Sidebar (Social Hub)**:
    *   *Stories*: Horizontal scrolling deck of upcoming events represented by visual card covers.
    *   *Suggestions*: Follow recommendation rows displaying user avatars and dark pill `Follow` buttons.
    *   *Recommendations*: Colorful rounded category grid blocks representing main channels (UI/UX, Music, Cooking, Hiking).

### B. Mobile Experience
*   **Clean Header**: Displays mobile menus, compact logo icon, and a search icon button. Tapping the search icon opens an absolute input overlay.
*   **Floating Action Button (FAB)**: A bottom-right floating message bubble with real-time unread badges. Hidden on chat-specific pages to save screen space.

---

## 4. Technical Specifications
- **Frontend Stack**: Astro SSR (Server-Side Rendering) for high speed, Vanilla CSS for translucent glassmorphic components.
- **Backend Stack**: Node.js + Express RPC server (handling database queries on port 3000 securely via internal API keys).
- **Database**: SQLite (relational database tracking users, follows, votes, comments, events, messages, and news).

---

## 5. Proposed Pitch Deck Slide Outline

A designer can structure the pitch deck using this 10-slide outline:

### Slide Details:

1.  **Slide 1: Cover / Introduction**
    *   *Title*: UniPulse
    *   *Subtitle*: The central digital pulse of university life.
    *   *Visual*: Dashboard preview mockup centered on a warm stone gradient.
2.  **Slide 2: The Problem**
    *   *Concept*: Fragmented campus portals and disconnected student communities.
    *   *Data points*: Legacy portals are slow; students use 4+ platforms to track events/materials.
3.  **Slide 3: The Solution**
    *   *Concept*: A single unified platform merging community socialization with academic utility.
    *   *Key benefits*: Localised, real-time, verified, and utility-driven.
4.  **Slide 4: Key Product Features (The Pillars)**
    *   *Columns/Grid*:
        *   **Connect**: Feed channels, mentions, and instant chats.
        *   **Discover**: Campus events cover stories and registrations.
        *   **Share**: Student-to-student resource database.
5.  **Slide 5: User Interface Showcase**
    *   *Visual*: Split mockup displaying the Desktop Layout on the left, and Mobile responsive screens (expandable search, FAB messenger) on the right.
6.  **Slide 6: Target Personas**
    *   *Profiles*:
        *   *The Student*: Wants class notes, event lists, and peer discussions.
        *   *The Club Organiser*: Wants to publish events as Cover Stories to gain RSVPs.
        *   *The Professor/Admin*: Wants to publish news and announcements securely.
7.  **Slide 7: Market Fit & Competitive Advantage**
    *   *Matrix*:
        *   UniPulse vs. Generic Social Media (verified student domain, no ad-bloat).
        *   UniPulse vs. Legacy LMS (peer-to-peer file sharing, social discussion).
8.  **Slide 8: Growth & Engagement Model**
    *   *Flywheel*:
        *   Event Cover Stories drive RSVPs -> RSVPs drive sign-ups -> Active users share course resources -> Resources attract more students.
9.  **Slide 9: Architecture & Performance**
    *   *Concept*: Fast, secure, light. Node.js backend RPC microservice communicating with an Astro SSR frontend. High performance and modular database scaling.
10. **Slide 10: Vision & Closing**
    *   *Tagline*: Powering the connected campus.
    *   *Call to Action*: Sign up at unipulse.edu or partner with your campus.
