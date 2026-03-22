export type UserRole = 'user' | 'admin';

export interface Database {
  public: {
    Tables: {
      users:      { Row: User;     Insert: UserInsert;     Update: UserUpdate };
      posts:      { Row: Post;     Insert: PostInsert;     Update: PostUpdate };
      likes:      { Row: Like;     Insert: LikeInsert;     Update: never };
      resources:  { Row: Resource; Insert: ResourceInsert; Update: ResourceUpdate };
      news:       { Row: NewsItem; Insert: NewsInsert;     Update: NewsUpdate };
      admin_logs: { Row: AdminLog; Insert: AdminLogInsert; Update: never };
    };
    Views: {
      posts_with_meta:  { Row: PostWithMeta };
      admin_posts_view: { Row: AdminPostView };
    };
    Functions: {
      promote_to_admin: { Args: { target_user_id: string; acting_admin_id: string }; Returns: void };
      demote_to_user:   { Args: { target_user_id: string; acting_admin_id: string }; Returns: void };
      ban_user:         { Args: { target_user_id: string; acting_admin_id: string; ban_reason?: string }; Returns: void };
      unban_user:       { Args: { target_user_id: string; acting_admin_id: string }; Returns: void };
    };
  };
}

export interface User {
  id: string; email: string; username: string; pulse_id: string;
  full_name: string | null; department: string; level: string;
  avatar_url: string | null; role: UserRole; is_banned: boolean; created_at: string;
}

export type UserInsert  = Omit<User, 'id' | 'created_at'>;
export type UserUpdate  = Partial<Omit<User, 'id' | 'pulse_id' | 'email'>>;
export type LocalUser   = Omit<User, 'email'>;

export interface Post {
  id: string; user_id: string; content: string;
  is_flagged: boolean; is_deleted: boolean; created_at: string;
}
export type PostInsert = Pick<Post, 'user_id' | 'content'>;
export type PostUpdate = Partial<Pick<Post, 'content' | 'is_flagged' | 'is_deleted'>>;

export interface Like { id: string; user_id: string; post_id: string; created_at: string; }
export type LikeInsert = Pick<Like, 'user_id' | 'post_id'>;

export interface Resource {
  id: string; title: string; description: string | null;
  file_url: string | null; link_url: string | null;
  uploaded_by: string; is_deleted: boolean; created_at: string;
}
export type ResourceInsert = Omit<Resource, 'id' | 'created_at' | 'is_deleted'>;
export type ResourceUpdate  = Partial<Pick<Resource, 'title' | 'description' | 'is_deleted'>>;

export interface NewsItem {
  id: string; title: string; content: string;
  posted_by: string; is_deleted: boolean; created_at: string;
}
export type NewsInsert = Pick<NewsItem, 'title' | 'content' | 'posted_by'>;
export type NewsUpdate  = Partial<Pick<NewsItem, 'title' | 'content' | 'is_deleted'>>;

export interface AdminLog {
  id: string; admin_id: string; action: string;
  target_type: 'post' | 'user' | 'resource' | 'news';
  target_id: string; metadata: Record<string, unknown>; created_at: string;
}
export type AdminLogInsert = Omit<AdminLog, 'id' | 'created_at'>;

export interface PostWithMeta {
  id: string; content: string; is_flagged: boolean; created_at: string;
  author_id: string; username: string; pulse_id: string; full_name: string | null;
  department: string; level: string; avatar_url: string | null;
  author_role: UserRole; like_count: number;
}

export interface AdminPostView extends PostWithMeta {
  is_deleted: boolean; is_banned: boolean;
}
