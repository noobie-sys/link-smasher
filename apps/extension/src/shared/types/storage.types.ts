import { Link } from "./common.types";
import { StoredUser, Plan } from "./auth.types";

export interface SyncedLink extends Link {
  userId: string;
  syncedAt: number;
}

export interface PendingLink extends Link {
  userId: string;
  retryCount: number;
  failedAt: number;
}

export interface StorageSchema {
  links: Link[];
  pending: PendingLink[];
  pendingDeletes: string[];
  user: StoredUser | null;
  plan: Plan;
  plan_synced_at: number | null;
  migrated: boolean;
  /** Cached Better Auth session token forwarded as Bearer token to Next.js API */
  sessionToken: string | null;
  /** Epoch timestamp of the last successful full sync from the backend */
  lastSyncedAt: number | null;
}

export const STORAGE_DEFAULTS: StorageSchema = {
  links: [],
  pending: [],
  pendingDeletes: [],
  user: null,
  plan: "free",
  plan_synced_at: null,
  migrated: false,
  sessionToken: null,
  lastSyncedAt: null,
};
