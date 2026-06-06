import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Link Crust",
  description:
    "Manage your Link Crust preferences, keyboard shortcuts, sync configuration, and account details.",
};

/**
 * Settings route-group layout.
 * Performs server-side auth guard — unauthenticated users are redirected to /login.
 * This keeps the settings pages behind authentication without duplicating the guard in every page.
 */
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
