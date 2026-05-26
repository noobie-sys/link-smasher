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
}

export const STORAGE_DEFAULTS: StorageSchema = {
  links: [],
  pending: [],
  pendingDeletes: [],
  user: null,
  plan: "free",
  plan_synced_at: null,
  migrated: false,
};
