-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  username text unique not null,
  pulse_id text unique not null,
  full_name text,
  department text not null,
  level text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  post_id uuid references public.posts(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Create resources table
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_url text,
  uploaded_by uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create news table
create table public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  posted_by uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.resources enable row level security;
alter table public.news enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can insert their own profile." on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

create policy "Posts are viewable by everyone." on public.posts for select using (true);
create policy "Authenticated users can insert posts." on public.posts for insert with check (auth.uid() = user_id);

create policy "Likes are viewable by everyone." on public.likes for select using (true);
create policy "Authenticated users can insert likes." on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes." on public.likes for delete using (auth.uid() = user_id);

create policy "Resources are viewable by everyone." on public.resources for select using (true);
create policy "Authenticated users can insert resources." on public.resources for insert with check (auth.uid() = uploaded_by);

create policy "News are viewable by everyone." on public.news for select using (true);
