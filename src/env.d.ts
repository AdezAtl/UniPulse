/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: Omit<import('./lib/db').User, 'email'> | null;
    isAdmin: boolean;
    sessionToken: string | null;
  }
}