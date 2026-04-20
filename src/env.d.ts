/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
import type { User } from './lib/db';

declare namespace App {
  interface Locals {
    user: Omit<User, 'email'> | null;
    isAdmin: boolean;
    sessionToken: string | null;
  }
}