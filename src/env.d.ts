/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, User } from './lib/database.types';

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: Omit<User, 'email'> | null;
    isAdmin: boolean;
  }
}
