"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { cn } from "@/lib/utils";

import {
  Link2,
  Settings,
  Keyboard,
  Shield,
  LogOut,
  LayoutDashboard,
  RefreshCw,
  Check,
  AlertCircle,
  Info,
  Download,
  Trash2,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CategoryOption {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message?: string };
}

type StatusMessage = { type: "success" | "error"; text: string } | null;

// ─── Shortcut display helpers ────────────────────────────────────────────────

interface KeyCombo {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Formats a key combo object into a human-readable string like "Ctrl+J".
 */
function formatCombo(combo: KeyCombo): string {
  const parts: string[] = [];
  if (combo.ctrlKey) parts.push("Ctrl");
  if (combo.metaKey) parts.push("⌘");
  if (combo.altKey) parts.push("Alt");
  if (combo.shiftKey) parts.push("Shift");
  parts.push(combo.key.toUpperCase());
  return parts.join(" + ");
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** A single settings section card with a title, icon, and description. */
function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[rgba(13,9,32,0.45)] shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-start gap-3">
        <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

/** A single settings row with a label, description and trailing action. */
function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-4">
      <div className="space-y-0.5 min-w-0">
        <p className="text-sm font-medium text-white/90">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Keyboard shortcut badge chip. */
function KeyBadge({ combo }: { combo: KeyCombo }) {
  const keys = formatCombo(combo).split(" + ");
  return (
    <div className="flex items-center gap-1">
      {keys.map((k, idx) => (
        <kbd
          key={idx}
          className="px-2 py-1 text-[10px] font-mono font-semibold rounded-md border border-border bg-secondary/60 text-white shadow-sm"
        >
          {k}
        </kbd>
      ))}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isNavbarVisible = useScrollDirection();


  // Category management state
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null);

  // Account / session state
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Status feedback
  const [status, setStatus] = useState<StatusMessage>(null);

  const showStatus = useCallback((type: "success" | "error", text: string) => {
    setStatus({ type, text });
    setTimeout(() => setStatus(null), 5000);
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const res = await fetch("/api/categories");
      const payload = (await res.json()) as ApiResponse<CategoryOption[]>;
      if (payload.success && Array.isArray(payload.data)) {
        setCategories(payload.data);
      }
    } catch {
      showStatus("error", "Failed to load categories.");
    } finally {
      setIsLoadingCategories(false);
    }
  }, [showStatus]);

  useEffect(() => {
    if (session) {
      void fetchCategories();
    }
  }, [session, fetchCategories]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Links in this category will be moved to General.`)) {
      return;
    }

    const previousCategories = categories;
    // Optimistic update — immediately remove from UI
    setCategories((current) => current.filter((cat) => cat.id !== id));

    try {
      setIsDeletingCategory(id);
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const payload = (await res.json()) as ApiResponse<never>;

      if (payload.success) {
        showStatus("success", `Category "${name}" deleted.`);
      } else {
        // Rollback on failure
        setCategories(previousCategories);
        showStatus("error", payload.error?.message ?? "Failed to delete category.");
      }
    } catch {
      setCategories(previousCategories);
      showStatus("error", "Network error. Please try again.");
    } finally {
      setIsDeletingCategory(null);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({
        fetchOptions: {
          onSuccess: () => router.push("/"),
        },
      });
    } catch {
      showStatus("error", "Sign out failed. Please try again.");
      setIsSigningOut(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch("/api/links");
      const payload = (await res.json()) as ApiResponse<unknown[]>;

      if (!payload.success || !payload.data) {
        showStatus("error", "Failed to export links.");
        return;
      }

      const blob = new Blob([JSON.stringify(payload.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `link-crust-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      showStatus("success", "Export downloaded successfully!");
    } catch {
      showStatus("error", "Export failed. Please try again.");
    }
  };

  // ── Extension default shortcuts (static — managed by the extension itself) ──
  const DEFAULT_SHORTCUTS = [
    {
      action: "Save Current Page",
      description: "Instantly saves the current tab to your vault without opening a dialog.",
      combo: { key: "s", altKey: true } as KeyCombo,
    },
    {
      action: "Open Link HUD",
      description: "Summons the glassmorphic in-context overlay over the current webpage.",
      combo: { key: "k", altKey: true } as KeyCombo,
    },
  ];

  return (
    <div className="dark min-h-dvh bg-background text-foreground pb-16 font-sans overflow-x-hidden">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 grid-pattern opacity-10" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={cn(
        "sticky top-4 z-50 mx-4 md:mx-6 mt-4 border border-border bg-card/65 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg max-w-4xl lg:mx-auto transition-all duration-300 ease-in-out",
        isNavbarVisible ? "translate-y-0 opacity-100" : "-translate-y-[150%] opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-md shadow-primary/20">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white leading-none">
                Link Crust
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                Account Settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors border border-border rounded-lg px-3 py-1.5 hover:bg-white/[0.03]"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-muted-foreground hover:text-white"
            >
              {isSigningOut ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isSigningOut ? "Signing out…" : "Sign out"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {/* Page heading */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white tracking-tight">
              Settings
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your account, keyboard shortcuts, categories, and data.
          </p>
        </div>

        {/* Status banner */}
        {status && (
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-md animate-in fade-in slide-in-from-top-3 duration-300 ${
              status.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
            role="alert"
            aria-live="polite"
          >
            {status.type === "success" ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="font-medium">{status.text}</span>
          </div>
        )}

        {/* ── Account Section ─────────────────────────────────────────────── */}
        <SettingsSection
          icon={User}
          title="Account"
          description="Your sign-in details and session management."
        >
          <SettingsRow
            label="Email"
            description="The email address associated with your Link Crust account."
          >
            <span className="text-xs font-mono text-muted-foreground bg-secondary/40 border border-border rounded-lg px-3 py-1.5">
              {session?.user?.email ?? "—"}
            </span>
          </SettingsRow>

          <SettingsRow
            label="Name"
            description="Your display name shown in the dashboard."
          >
            <span className="text-xs text-muted-foreground">
              {session?.user?.name ?? "—"}
            </span>
          </SettingsRow>

          <SettingsRow
            label="Sign out"
            description="End your current session on this device."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              {isSigningOut ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          </SettingsRow>
        </SettingsSection>

        {/* ── Keyboard Shortcuts Section ──────────────────────────────────── */}
        <SettingsSection
          icon={Keyboard}
          title="Keyboard Shortcuts"
          description="Default hotkeys for the Link Crust browser extension. Shortcuts are configured in the extension popup."
        >
          {DEFAULT_SHORTCUTS.map((shortcut) => (
            <SettingsRow
              key={shortcut.action}
              label={shortcut.action}
              description={shortcut.description}
            >
              <KeyBadge combo={shortcut.combo} />
            </SettingsRow>
          ))}

          <div className="px-6 py-3 bg-primary/5 border-t border-border">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
              <span>
                To customize shortcuts, open the extension popup and navigate to the{" "}
                <strong className="text-white/70">Settings</strong> tab inside it. Changes
                sync instantly across all open tabs.
              </span>
            </div>
          </div>
        </SettingsSection>

        {/* ── Category Management Section ─────────────────────────────────── */}
        <SettingsSection
          icon={Settings}
          title="Category Management"
          description="Organize your saved links. Delete categories you no longer need — links will be reassigned to General."
        >
          {isLoadingCategories ? (
            <div className="px-6 py-8 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">No custom categories yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Create categories from the dashboard to organize your saved links.
              </p>
            </div>
          ) : (
            categories.map((cat) => (
              <SettingsRow
                key={cat.id}
                label={cat.name}
                description={cat.isSystem ? "System default — cannot be deleted." : undefined}
              >
                <div className="flex items-center gap-2">
                  {/* Color dot */}
                  <div
                    className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden="true"
                  />
                  {cat.isSystem ? (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border border-border rounded px-1.5 py-0.5">
                      System
                    </span>
                  ) : (
                    <button
                      onClick={() => void handleDeleteCategory(cat.id, cat.name)}
                      disabled={isDeletingCategory === cat.id}
                      aria-label={`Delete category ${cat.name}`}
                      className="flex items-center gap-1 text-xs text-destructive/70 hover:text-destructive border border-destructive/20 hover:border-destructive/40 rounded-lg px-2.5 py-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeletingCategory === cat.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </button>
                  )}
                </div>
              </SettingsRow>
            ))
          )}

          <div className="px-6 py-3 flex justify-end border-t border-border">
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Manage categories in Dashboard
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </SettingsSection>

        {/* ── Data & Privacy Section ──────────────────────────────────────── */}
        <SettingsSection
          icon={Shield}
          title="Data & Privacy"
          description="Export your saved links as JSON or learn about how your data is handled."
        >
          <SettingsRow
            label="Export Links"
            description="Download all your saved links as a JSON file for backup or migration."
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleExportData()}
              className="text-muted-foreground hover:text-white gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </Button>
          </SettingsRow>

          <SettingsRow
            label="Data Storage"
            description="Your links are stored securely in a PostgreSQL database. Extension data is stored locally in your browser."
          >
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Secure
            </div>
          </SettingsRow>

          <SettingsRow
            label="Authentication"
            description="Sessions are managed with Better Auth using HTTP-only secure cookies. No passwords are stored in plaintext."
          >
            <span className="text-xs text-muted-foreground border border-border rounded-lg px-2.5 py-1">
              Better Auth
            </span>
          </SettingsRow>
        </SettingsSection>

        {/* ── Extension section ───────────────────────────────────────────── */}
        <SettingsSection
          icon={Link2}
          title="Browser Extension"
          description="The Link Crust Chrome extension powers your keyboard shortcuts and in-page HUD overlay."
        >
          <SettingsRow
            label="Supported Browsers"
            description="Chrome (Manifest V3), and Chromium-based browsers (Edge, Brave, Arc)."
          >
            <div className="flex items-center gap-1.5 text-xs text-primary/80 border border-primary/20 rounded-lg px-2.5 py-1">
              Manifest V3
            </div>
          </SettingsRow>

          <SettingsRow
            label="Shadow DOM Isolation"
            description="The extension UI is isolated inside a Shadow DOM to prevent style conflicts with any website."
          >
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-1">
              <Check className="h-3 w-3" />
              Active
            </div>
          </SettingsRow>

          <SettingsRow
            label="Extension Version"
            description="Keep the extension up-to-date for the latest features and security patches."
          >
            <span className="text-xs font-mono text-muted-foreground">v1.0.0</span>
          </SettingsRow>
        </SettingsSection>
      </main>
    </div>
  );
}
