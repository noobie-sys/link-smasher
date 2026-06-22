"use client";

import { signOut, useSession } from "@/lib/auth-client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { EMOJI_REGEX, parseTagsInput, extractCleanHostname } from "@/lib/link-utils";
import { formatDurationMs } from "@/lib/analytics-utils";
import { 
  Link2, 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  X, 
  Globe, 
  Tag, 
  BookOpen, 
  LogOut, 
  AlertCircle, 
  Gauge, 
  CornerDownRight, 
  History,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";


interface SavedLink {
  id: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes: string | null;
  category: string;
  createdAt: number;
}

interface CategoryOption {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
  };
}



// Duration (ms) a status toast is shown before automatically dismissing.
const STATUS_TIMEOUT_MS = 5_000;

/**
 * Parse a comma-separated tags string into an array of trimmed, non-empty tags.
 *
 * @param input - The raw comma-separated tags string
 * @returns An array of tag strings with surrounding whitespace removed and empty entries omitted
 */

/**
 * Page component that provides a UI for saving, viewing, filtering, and managing saved links and categories, including background synchronization and optimistic CRUD updates.
 *
 * @returns The rendered React element for the LinkSaverPage.
 */
export default function LinkSaverPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();



  // Core API state
  const [links, setLinks] = useState<SavedLink[]>([]);
  const lastSSEUpdateRef = useRef<number>(0);
  const hasLoadedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Throttling Hud State
  const [rateLimit, setRateLimit] = useState({
    limit: 60,
    remaining: 60,
    reset: Date.now() + 60000,
  });

  // Categories Integration State
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Quick Extension Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");

  // Edit Inline State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTagsInput, setEditTagsInput] = useState("");

  // Analytics Summary State
  const [analyticsSummary, setAnalyticsSummary] = useState<{
    totalLinks: number;
    savedThisWeek: number;
    weekOverWeekDelta: number | null;
    topSitesByTime: { hostname: string; totalMs: number }[];
  } | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // 1. Initial Load of Saved Links and Categories (Guarded to run only once)
  useEffect(() => {
    if (session && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      void fetchLinks({ showLoading: true });
      void fetchCategories({ showLoading: true });
      void fetchAnalyticsSummary();

      // Proactively sync authentication state with the Chrome Extension JIT
      console.log("[Dashboard] Posting auth sync message to content script...");
      window.postMessage({ type: "LINK_SMASHER_AUTH_SYNC" }, "*");
    }
  }, [session]);

  // 1b. Listen for real-time events via Server-Sent Events (SSE)
  useEffect(() => {
    if (!session) return;

    console.log("[Dashboard] Establishing SSE connection to /api/links/sse...");
    const eventSource = new EventSource("/api/links/sse", { withCredentials: true });

    eventSource.addEventListener("connected", (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("[Dashboard] SSE Connection Stable:", payload.message);
      } catch {
        console.log("[Dashboard] SSE Connection Stable");
      }
      
      // If the dashboard was already loaded, this is a reconnect event.
      // Re-fetch links to catch up on anything saved during the disconnect.
      if (hasLoadedRef.current) {
        console.log("[Dashboard] SSE Reconnected: Pulling updates...");
        void fetchLinks();
      }
    });

    eventSource.addEventListener("links_updated", (event) => {
      try {
        const newLink = JSON.parse(event.data) as SavedLink;
        console.log("[Dashboard] SSE: Link updated/added:", newLink);

        lastSSEUpdateRef.current = Date.now();

        setLinks((current) => {
          const exists = current.some((l) => l.id === newLink.id);
          if (exists) {
            return current.map((l) => (l.id === newLink.id ? newLink : l));
          }
          return [newLink, ...current];
        });

        // Refresh categories dynamically
        void fetchCategories();
      } catch (err) {
        console.error("[Dashboard] Failed to parse updated link from SSE:", err);
      }
    });

    eventSource.addEventListener("link_deleted", (event) => {
      try {
        const payload = JSON.parse(event.data) as { id: string };
        console.log("[Dashboard] SSE: Link deleted:", payload.id);

        lastSSEUpdateRef.current = Date.now();

        setLinks((current) => current.filter((l) => l.id !== payload.id));
        // Refresh categories dynamically
        void fetchCategories();
      } catch (err) {
        console.error("[Dashboard] Failed to parse deleted link ID from SSE:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn("[Dashboard] SSE connection encountered an error, reconnecting...", err);
    };

    return () => {
      console.log("[Dashboard] Closing SSE connection...");
      eventSource.close();
    };
  }, [session]);



  const fetchCategories = async (options: { showLoading?: boolean } = {}) => {
    try {
      if (options.showLoading) {
        setIsLoadingCategories(true);
      }
      const res = await fetch("/api/categories");
      const payload = await res.json() as ApiResponse<CategoryOption[]>;
      if (payload.success && Array.isArray(payload.data)) {
        setCategories(payload.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      if (options.showLoading) {
        setIsLoadingCategories(false);
      }
    }
  };

  const fetchAnalyticsSummary = async () => {
    try {
      setIsLoadingAnalytics(true);
      const res = await fetch("/api/analytics/summary");
      const payload = await res.json() as ApiResponse<typeof analyticsSummary>;
      if (payload.success && payload.data) {
        setAnalyticsSummary(payload.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics summary:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleEditCategorySelectChange = (val: string) => {
    if (val === "__create_new__") {
      setIsCreateCategoryModalOpen(true);
    } else {
      setEditCategory(val);
    }
  };

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    if (EMOJI_REGEX.test(name)) {
      showStatus("error", "Category name must not contain emojis! 🧠");
      return;
    }

    const optimisticCategory: CategoryOption = {
      id: `optimistic-${Date.now()}`,
      name,
      color: "#6366F1",
      isSystem: false,
    };
    const previousCategories = categories;

    setCategories((current) => {
      const exists = current.some((cat) => cat.name.toLowerCase() === name.toLowerCase());
      return exists ? current : [...current, optimisticCategory];
    });
    setEditCategory(name);
    setIsCreateCategoryModalOpen(false);
    setNewCategoryName("");

    try {
      setIsCreatingCategory(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const payload = await res.json() as ApiResponse<CategoryOption>;
      if (payload.success) {
        if (!payload.data) {
          setCategories(previousCategories);
          showStatus("error", "Failed to create category.");
          return;
        }

        const createdCategory = payload.data;
        showStatus("success", `Category "${createdCategory.name}" created!`);
        setCategories((current) => current.map((cat) => (
          cat.id === optimisticCategory.id ? createdCategory : cat
        )));

        setEditCategory(createdCategory.name);

      } else {
        setCategories(previousCategories);
        showStatus("error", payload.error?.message || "Failed to create category.");
      }
    } catch (err) {
      setCategories(previousCategories);
      showStatus("error", "Failed to communicate with API server.");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const updateRateHeaders = (headers: Headers) => {
    const limit = headers.get("X-RateLimit-Limit");
    const remaining = headers.get("X-RateLimit-Remaining");
    const reset = headers.get("X-RateLimit-Reset");

    if (limit && remaining) {
      setRateLimit({
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: reset ? parseInt(reset, 10) * 1000 : Date.now() + 60000,
      });
    }
  };

  const fetchLinks = async (options: { showLoading?: boolean } = {}) => {
    try {
      if (options.showLoading) {
        setIsLoading(true);
      }
      const res = await fetch("/api/links");

      updateRateHeaders(res.headers);
      const payload = await res.json() as ApiResponse<SavedLink[]>;

      if (payload.success) {
        setLinks(payload.data || []);
      } else {
        showStatus("error", payload.error?.message || "Failed to load links.");
      }
    } catch (err) {
      showStatus("error", "Network connection issues.");
    } finally {
      if (options.showLoading) {
        setIsLoading(false);
      }
    }
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), STATUS_TIMEOUT_MS);
  };



  // 3. DELETE (Remove Link)
  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    const deletedLink = links.find((link) => link.id === id);
    setLinks((current) => current.filter((link) => link.id !== id));

    try {
      setIsActionPending(true);
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      updateRateHeaders(res.headers);
      const payload = await res.json() as ApiResponse<never>;

      if (payload.success) {
        showStatus("success", "Link deleted successfully!");
      } else {
        if (deletedLink) {
          setLinks((current) => [deletedLink, ...current]);
        }
        showStatus("error", payload.error?.message || "Failed to delete link.");
      }
    } catch (err) {
      if (deletedLink) {
        setLinks((current) => [deletedLink, ...current]);
      }
      showStatus("error", "Error connecting to the API.");
    } finally {
      setIsActionPending(false);
    }
  };

  // 4. UPDATE (Edit Link)
  const startEditing = (link: SavedLink) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditNotes(link.notes || "");
    setEditCategory(link.category);
    setEditTagsInput(link.tags.join(", "));
  };

  const handleUpdateLink = async (id: string) => {
    if (!editTitle.trim()) {
      showStatus("error", "Title is required.");
      return;
    }

    const trimmedCategory = editCategory.trim();
    if (EMOJI_REGEX.test(trimmedCategory)) {
      showStatus("error", "Category name must not contain emojis! 🧠");
      return;
    }

    const previousLink = links.find((link) => link.id === id);

    try {
      setIsActionPending(true);
      const tagsArray = parseTagsInput(editTagsInput);
      const optimisticUpdatedLink: SavedLink | null = previousLink
        ? {
            ...previousLink,
            title: editTitle.trim(),
            notes: editNotes.trim() || null,
            category: trimmedCategory,
            tags: tagsArray,
          }
        : null;

      if (optimisticUpdatedLink) {
        setLinks((current) => current.map((link) => (link.id === id ? optimisticUpdatedLink : link)));
      }
      setEditingId(null);

      const res = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          notes: editNotes.trim() || undefined,
          category: trimmedCategory,
          tags: tagsArray,
        }),
      });

      updateRateHeaders(res.headers);
      const payload = await res.json() as ApiResponse<SavedLink>;

      if (payload.success) {
        if (!payload.data) {
          if (previousLink) {
            setLinks((current) => current.map((link) => (link.id === id ? previousLink : link)));
            startEditing(previousLink);
          }
          showStatus("error", "Failed to update link.");
          return;
        }

        const updatedLink = payload.data;
        showStatus("success", "Link updated successfully!");
        setLinks((current) => current.map((link) => (link.id === id ? updatedLink : link)));
        void fetchCategories();
      } else {
        if (previousLink) {
          setLinks((current) => current.map((link) => (link.id === id ? previousLink : link)));
          startEditing(previousLink);
        }
        showStatus("error", payload.error?.message || "Failed to update link.");
      }
    } catch (err) {
      if (previousLink) {
        setLinks((current) => current.map((link) => (link.id === id ? previousLink : link)));
        startEditing(previousLink);
      }
      showStatus("error", "Error connecting to the API.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // 5. Compute lists & unique Categories
  const uniqueCategories = ["All", ...Array.from(new Set(links.map((link) => link.category)))];

  const filteredLinks = links.filter((link) => {
    // Search filter
    const matchesSearch = 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.notes && link.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategoryTab === "All" || link.category === selectedCategoryTab;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground relative font-sans">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 transition-[width,height] ease-linear px-4 lg:px-6 relative z-20 bg-background/50 backdrop-blur-xs">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-2 h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary animate-pulse" />
          <h1 className="text-sm font-semibold text-foreground tracking-tight">API Developer Sandbox</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Throttling HUD */}
          <div className="flex items-center gap-3 text-xs bg-card rounded-lg border border-border px-3 py-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              <span>API Quota:</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className={rateLimit.remaining > 15 ? "text-green-400" : rateLimit.remaining > 5 ? "text-amber-400" : "text-destructive"}>
                {rateLimit.remaining}
              </span>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-muted-foreground">{rateLimit.limit} reqs</span>
            </div>
          </div>
        </div>
      </header>

      {/* overflow-x-hidden is on this non-positioned inner wrapper intentionally —
          putting it on the outer relative div would create a stacking context that
          traps the extension's shadow host (z-index: 2147483647) behind page content. */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-12 relative z-10">
        {/* Background Orbs */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-1/4 top-1/4 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-brand-magenta/5 blur-[110px] animate-pulse-slow [animation-delay:3s]" />
        </div>

        {/* Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 z-0 grid-pattern opacity-15" />

      {/* Main Grid */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Status Toast Banner */}
        {statusMessage && (
          <div className={`col-span-full flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300 ${
            statusMessage.type === "success" 
              ? "bg-green-500/10 border-green-500/30 text-green-400" 
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Analytics Stats Row */}
        <div className="col-span-full grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Links */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Links</p>
            {isLoadingAnalytics ? (
              <div className="h-7 w-16 rounded bg-muted/20 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{analyticsSummary?.totalLinks ?? "—"}</p>
            )}
          </div>

          {/* Saved This Week */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Saved This Week</p>
            {isLoadingAnalytics ? (
              <div className="h-7 w-24 rounded bg-muted/20 animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{analyticsSummary?.savedThisWeek ?? "—"}</p>
                {analyticsSummary?.weekOverWeekDelta != null && (
                  <span className={`text-xs font-medium ${analyticsSummary.weekOverWeekDelta >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {analyticsSummary.weekOverWeekDelta >= 0 ? "+" : ""}{analyticsSummary.weekOverWeekDelta}% vs last week
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Top Site This Week */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Top Site (Time Spent)</p>
            {isLoadingAnalytics ? (
              <div className="h-7 w-32 rounded bg-muted/20 animate-pulse" />
            ) : analyticsSummary?.topSitesByTime[0] ? (
              <div>
                <p className="text-base font-bold text-foreground truncate">{analyticsSummary.topSitesByTime[0].hostname}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDurationMs(analyticsSummary.topSitesByTime[0].totalMs)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-foreground">—</p>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* Scoped Link List & Manager (Full-Width) */}
        {/* ========================================== */}
        <section className="col-span-full space-y-6 w-full">
          {/* Toolbar: Search and Categories Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
            {/* Categories Horizontal Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryTab(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                    selectedCategoryTab === cat
                      ? "bg-primary text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vault locally..."
                className="pl-8 h-9 text-xs bg-muted/20 border-border text-foreground w-full"
              />
            </div>
          </div>

          {/* Links Listing */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
              <p className="text-muted-foreground text-xs mt-3">Fetching synchronized vault cards...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-semibold">No saved links found</p>
              <p className="text-muted-foreground/80 text-xs mt-1">
                {searchQuery || selectedCategoryTab !== "All"
                  ? "Try relaxing your filter parameters or search queries."
                  : "Save a new webpage URL using the simulator to start your vault!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLinks.map((link) => (
                <Card key={link.id} className="relative z-10 border border-border bg-card hover:border-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-medium px-2 py-0.5 bg-secondary text-secondary-foreground border border-border max-w-[120px] truncate">
                        {link.category}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-1 shrink-0 font-mono">
                        <History className="h-2.5 w-2.5" />
                        {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {editingId === link.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-muted/40 border-border text-foreground text-xs h-7 mt-2"
                      />
                    ) : (
                      <CardTitle className="font-display text-sm font-bold text-foreground mt-1.5 leading-snug line-clamp-2">
                        {link.title}
                      </CardTitle>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-primary/80 hover:underline mt-1 break-all truncate font-medium">
                      <Globe className="h-3 w-3 shrink-0" />
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="truncate">
                        {link.hostname}
                      </a>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-1.5 pb-2 flex-grow text-xs text-muted-foreground space-y-2.5">
                    {editingId === link.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Edit notes..."
                          rows={2}
                          className="w-full text-xs bg-muted/40 border border-border text-foreground rounded px-2.5 py-1 outline-none resize-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editCategory}
                            onChange={(e) => handleEditCategorySelectChange(e.target.value)}
                            className="w-full bg-muted/40 border border-border text-foreground text-xs rounded px-2 h-7 outline-none cursor-pointer"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name} className="bg-background text-foreground">
                                {cat.name}
                              </option>
                            ))}
                            <option value="__create_new__" className="bg-background text-primary font-semibold">
                              ＋ Create custom…
                            </option>
                          </select>
                          <Input
                            value={editTagsInput}
                            onChange={(e) => setEditTagsInput(e.target.value)}
                            placeholder="Tags (Comma spl.)"
                            className="bg-muted/40 border-border text-foreground text-xs h-7"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {link.notes && (
                          <div className="p-2 bg-muted/30 rounded-md border border-border/40 text-muted-foreground italic">
                            {link.notes}
                          </div>
                        )}

                        {link.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {link.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                                <Tag className="h-2 w-2" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>

                  <CardFooter className="p-3 bg-muted/20 border-t border-border flex items-center justify-between">
                    {editingId === link.id ? (
                      <div className="flex items-center gap-1.5 w-full justify-end">
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          onClick={() => setEditingId(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </Button>
                        <Button 
                          variant="default" 
                          size="xs" 
                          onClick={() => handleUpdateLink(link.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-[140px]">
                          ID: {link.id.substring(0, 8)}...
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon-xs" 
                            onClick={() => startEditing(link)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon-xs" 
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Premium Category Creation Modal */}
      {isCreateCategoryModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[400px] bg-card border border-border rounded-2xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200 text-left">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <span className="text-xl">🍰</span> Create Custom Category
              </h3>
              <p className="text-xs text-muted-foreground">
                Custom categories let you group and filter your saved sandbox cards seamlessly. Emojis are not permitted.
              </p>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="modal-cat-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Category Name
                </label>
                <Input
                  id="modal-cat-name"
                  type="text"
                  autoFocus
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value.slice(0, 50))}
                  placeholder="e.g. Developer Guides"
                  className="bg-muted/20 border-border text-foreground text-sm h-10 w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreateCategoryModalOpen(false);
                    setNewCategoryName("");
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/30 text-xs h-9 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-4 rounded-lg shadow-md shadow-primary/20"
                >
                  {isCreatingCategory ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>{/* end inner overflow-x-hidden wrapper */}
    </div>
  );
}
