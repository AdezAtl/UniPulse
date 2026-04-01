/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './lib/database.types';

// Derive the exact row type from your generated Database types
type UserRow = Database['public']['Tables']['users']['Row'];

// ✅ Declare App.Locals so TypeScript recognises locals.supabase / user / isAdmin
//    everywhere in your Astro project. This file must live in src/.
declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: UserRow | null;
    isAdmin: boolean;
  }
}