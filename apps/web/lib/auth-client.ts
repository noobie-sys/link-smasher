import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  session: {
    // Limits background network checks to at most once every 5 minutes (300 seconds)
    // even if the user clicks back and forth between tabs repeatedly!
    minRevalidateSeconds: 300,
  }
});

export const { useSession, signIn, signUp, signOut } = authClient;
