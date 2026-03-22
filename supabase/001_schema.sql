-- ============================================================
-- UniPulse · Full Schema
-- Run once in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  pulse_id    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  department  TEXT NOT NULL,
  level       TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 280),
  is_flagged  BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT,
  link_url    TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  posted_by   UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post','user','resource','news')),
  target_id   UUID NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_user_id    ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_deleted    ON posts(is_deleted);
CREATE INDEX IF NOT EXISTS idx_likes_post_id    ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id    ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username   ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_pulse_id   ON users(pulse_id);
CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role);
CREATE INDEX IF NOT EXISTS idx_admin_logs_time  ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);

-- ── Views ─────────────────────────────────────────────────────────────────────

-- Public feed view (excludes deleted posts and banned users)
CREATE OR REPLACE VIEW posts_with_meta AS
SELECT
  p.id,
  p.content,
  p.is_flagged,
  p.created_at,
  u.id         AS author_id,
  u.username,
  u.pulse_id,
  u.full_name,
  u.department,
  u.level,
  u.avatar_url,
  u.role       AS author_role,
  COUNT(l.id)  AS like_count
FROM  posts p
JOIN  users u ON u.id = p.user_id
LEFT  JOIN likes l ON l.post_id = p.id
WHERE p.is_deleted = FALSE
  AND u.is_banned  = FALSE
GROUP BY p.id, u.id;

-- Admin view: all posts including soft-deleted
CREATE OR REPLACE VIEW admin_posts_view AS
SELECT
  p.id,
  p.content,
  p.is_flagged,
  p.is_deleted,
  p.created_at,
  u.id         AS author_id,
  u.username,
  u.pulse_id,
  u.department,
  u.level,
  u.is_banned,
  u.role       AS author_role,
  COUNT(l.id)  AS like_count
FROM  posts p
JOIN  users u ON u.id = p.user_id
LEFT  JOIN likes l ON l.post_id = p.id
GROUP BY p.id, u.id;

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE news       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "users_read_all"   ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (role = (SELECT role FROM users WHERE id = auth.uid()));

-- Posts
CREATE POLICY "posts_read_active" ON posts FOR SELECT USING (
  is_deleted = FALSE OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "posts_insert_own"   ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_admin" ON posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Likes
CREATE POLICY "likes_read_all"   ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Resources
CREATE POLICY "resources_read_active" ON resources FOR SELECT USING (
  is_deleted = FALSE OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "resources_insert_auth" ON resources FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "resources_admin_update" ON resources FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- News
CREATE POLICY "news_read_active"  ON news FOR SELECT USING (
  is_deleted = FALSE OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "news_admin_insert" ON news FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "news_admin_update" ON news FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Admin logs
CREATE POLICY "admin_logs_admin_only" ON admin_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ── Stored Functions ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id UUID, acting_admin_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = acting_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE users SET role = 'admin' WHERE id = target_user_id;
  INSERT INTO admin_logs (admin_id, action, target_type, target_id)
    VALUES (acting_admin_id, 'promote_user', 'user', target_user_id);
END; $$;

CREATE OR REPLACE FUNCTION demote_to_user(target_user_id UUID, acting_admin_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = acting_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE users SET role = 'user' WHERE id = target_user_id;
  INSERT INTO admin_logs (admin_id, action, target_type, target_id)
    VALUES (acting_admin_id, 'demote_user', 'user', target_user_id);
END; $$;

CREATE OR REPLACE FUNCTION ban_user(target_user_id UUID, acting_admin_id UUID, ban_reason TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = acting_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE users SET is_banned = TRUE WHERE id = target_user_id;
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
    VALUES (acting_admin_id, 'ban_user', 'user', target_user_id,
            jsonb_build_object('reason', COALESCE(ban_reason, '')));
END; $$;

CREATE OR REPLACE FUNCTION unban_user(target_user_id UUID, acting_admin_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = acting_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE users SET is_banned = FALSE WHERE id = target_user_id;
  INSERT INTO admin_logs (admin_id, action, target_type, target_id)
    VALUES (acting_admin_id, 'unban_user', 'user', target_user_id);
END; $$;

-- ── First admin setup ─────────────────────────────────────────────────────────
-- After signing up, run this in SQL Editor (replace with your actual email):
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
