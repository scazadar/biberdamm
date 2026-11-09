import type { Principal } from '#lib/server/auth';

declare global {
  namespace App {
    interface Locals {
      principal: Principal | null;
      token: string | null;
    }
  }
}

export {};
