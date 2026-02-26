export interface StoredUser {
  id: string; // Supabase auth user id (uuid)
  email: string; // user's email
  createdAt: number; // when they signed up
}

export type Plan = "free" | "pro";
