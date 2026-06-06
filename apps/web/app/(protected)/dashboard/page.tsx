"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

// Regex to identify standard/colored emojis and pictographs
const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

const getHostnameFromUrl = (urlValue: string) => {
  try {
    return new URL(urlValue).hostname.toLowerCase().replace(/^(www\.|m\.|beta\.)/, "");
  } catch {
    return "unknown";
  }
};

export default function LinkSaverPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Core API state
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Throttling Hud State
  const [rateLimit, setRateLimit] = useState({
    limit: 60,
    remaining: 60,
    reset: Date.now() + 60000,
  });

  // Save Link Form State
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");

  // Categories Integration State
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [createCategoryContext, setCreateCategoryContext] = useState<{ mode: "create" | "edit" }>({ mode: "create" });

  // Quick Extension Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [hostnameFilter, setHostnameFilter] = useState("");
  const [isHostnameFilterActive, setIsHostnameFilterActive] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");

  // Edit Inline State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTagsInput, setEditTagsInput] = useState("");

  // 1. Initial Load of Saved Links and Categories
  useEffect(() => {
    if (session) {
      void fetchLinks({ showLoading: true });
      void fetchCategories({ showLoading: true });
    }
  }, [session]);

  // Poll for links every 10 seconds to keep in sync across devices/browsers
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      void fetchLinks();
      void fetchCategories();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
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

  const handleCategorySelectChange = (val: string) => {
    if (val === "__create_new__") {
      setCreateCategoryContext({ mode: "create" });
      setIsCreateCategoryModalOpen(true);
    } else {
      setCategory(val);
    }
  };

  const handleEditCategorySelectChange = (val: string) => {
    if (val === "__create_new__") {
      setCreateCategoryContext({ mode: "edit" });
      setIsCreateCategoryModalOpen(true);
    } else {
      setEditCategory(val);
    }
  };

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    if (emojiRegex.test(name)) {
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
    if (createCategoryContext.mode === "create") {
      setCategory(name);
    } else {
      setEditCategory(name);
    }
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

        if (createCategoryContext.mode === "create") {
          setCategory(createdCategory.name);
        } else {
          setEditCategory(createdCategory.name);
        }

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
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // 2. CREATE (Save Link)
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      showStatus("error", "URL and Title are required.");
      return;
    }

    // Emoji rule check
    const trimmedCategory = category.trim();
    if (emojiRegex.test(trimmedCategory)) {
      showStatus("error", "Category name must not contain emojis! 🧠");
      return;
    }

    let optimisticLink: SavedLink | null = null;

    try {
      setIsActionPending(true);
      const tagsArray = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      optimisticLink = {
        id: `optimistic-${Date.now()}`,
        url,
        title,
        hostname: getHostnameFromUrl(url),
        tags: tagsArray,
        notes: notes.trim() || null,
        category: trimmedCategory,
        createdAt: Date.now(),
      };

      const optimisticDraft = optimisticLink;
      setLinks((current) => [optimisticDraft, ...current]);
      setUrl("");
      setTitle("");
      setCategory("General");
      setTagsInput("");
      setNotes("");

      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          title,
          category: trimmedCategory,
          notes: notes.trim() || undefined,
          tags: tagsArray,
        }),
      });

      updateRateHeaders(res.headers);
      const payload = await res.json() as ApiResponse<SavedLink>;

      if (payload.success) {
        if (!payload.data) {
          if (optimisticLink) {
            const failedLink = optimisticLink;
            setLinks((current) => current.filter((link) => link.id !== failedLink.id));
          }
          showStatus("error", "Failed to save link.");
          return;
        }

        const savedLink = payload.data;
        const optimisticDraftId = optimisticDraft.id;
        showStatus("success", "Link saved successfully!");
        setLinks((current) => current.map((link) => (
          link.id === optimisticDraftId ? savedLink : link
        )));
        void fetchCategories();
      } else {
        setLinks((current) => current.filter((link) => link.id !== optimisticDraft.id));
        setUrl(optimisticDraft.url);
        setTitle(optimisticDraft.title);
        setCategory(optimisticDraft.category);
        setTagsInput(optimisticDraft.tags.join(", "));
        setNotes(optimisticDraft.notes || "");
        showStatus("error", payload.error?.message || "Failed to save link.");
      }
    } catch (err) {
      if (optimisticLink) {
        const failedLink = optimisticLink;
        setLinks((current) => current.filter((link) => link.id !== failedLink.id));
        setUrl(failedLink.url);
        setTitle(failedLink.title);
        setCategory(failedLink.category);
        setTagsInput(failedLink.tags.join(", "));
        setNotes(failedLink.notes || "");
      }
      showStatus("error", "Failed to communicate with API server.");
    } finally {
      setIsActionPending(false);
    }
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
    if (emojiRegex.test(trimmedCategory)) {
      showStatus("error", "Category name must not contain emojis! 🧠");
      return;
    }

    const previousLink = links.find((link) => link.id === id);

    try {
      setIsActionPending(true);
      const tagsArray = editTagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
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

    // Hostname filter
    const matchesHost = !isHostnameFilterActive || 
      (hostnameFilter.trim() && link.hostname.toLowerCase().includes(hostnameFilter.trim().toLowerCase()));

    // Category filter
    const matchesCategory = selectedCategoryTab === "All" || link.category === selectedCategoryTab;

    return matchesSearch && matchesHost && matchesCategory;
  });

  return (
    <div className="dark min-h-dvh bg-background text-foreground relative pb-12 font-sans overflow-x-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-brand-magenta/5 blur-[110px] animate-pulse-slow [animation-delay:3s]" />
      </div>

      {/* Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 grid-pattern opacity-15" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/65 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-brand-magenta shadow-md shadow-primary/20">
              <Link2 className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white leading-none">
                Link Crust
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                API Developer Sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Throttling HUD */}
            <div className="hidden sm:flex items-center gap-3 text-xs bg-black/35 rounded-lg border border-border px-3 py-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                <span>API Quota:</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className={rateLimit.remaining > 15 ? "text-green-400" : rateLimit.remaining > 5 ? "text-amber-400" : "text-destructive"}>
                  {rateLimit.remaining}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{rateLimit.limit} reqs</span>
              </div>
            </div>

            <a
              href="/settings"
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors border border-border rounded-lg px-3 py-1.5 hover:bg-white/[0.03]"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </a>

            <Button variant="outline" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-white">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

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

        {/* ========================================== */}
        {/* LEFT COLUMN: Extension Simulator Panel (370px design) */}
        {/* ========================================== */}
        <section className="lg:col-span-4 flex justify-center w-full">
          <div className="w-[370px] shrink-0 rounded-2xl border border-white/[0.08] bg-[rgba(13,9,32,0.65)] p-5 text-center shadow-2xl backdrop-blur-xl animate-in fade-in duration-500">
            {/* Extension Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-white leading-none">Instant Link Crust</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 uppercase tracking-widest px-1.5 py-0.5">
                Simulator
              </Badge>
            </div>

            {/* Inline Save Form */}
            <form onSubmit={handleSaveLink} className="space-y-3.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target URL
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/docs"
                  className="bg-black/30 border-border text-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Card Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Official API Guidelines"
                  className="bg-black/30 border-border text-white text-xs h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full bg-black/30 border border-border text-white text-xs rounded-md px-3 h-9 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name} className="bg-[#120f24] text-white">
                        {cat.name}
                      </option>
                    ))}
                    <option value="__create_new__" className="bg-[#120f24] text-primary font-semibold">
                      ＋ Create custom…
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tags (Comma Spl.)
                  </label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Docs, Biology"
                    className="bg-black/30 border-border text-white text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Inline Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add custom developer details or links..."
                  rows={2}
                  className="w-full text-xs bg-black/30 border border-border text-white rounded-md px-3 py-1.5 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/50 outline-none transition-all focus-visible:ring-2 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isActionPending}
                className="w-full bg-primary hover:bg-primary/95 text-white text-xs font-semibold h-9 rounded-lg"
              >
                {isActionPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Save Link to Vault</span>
                  </>
                )}
              </Button>
            </form>

            {/* Quick Simulator Search and Filters */}
            <div className="mt-5 pt-4 border-t border-border space-y-3.5 text-left">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vault locally..."
                  className="bg-black/30 border-border text-white text-xs pl-8 h-8"
                />
              </div>

              {/* Hostname Filter simulation */}
              <div className="p-3 bg-black/35 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    "This Site Only" Simulator
                  </span>
                  <input
                    type="checkbox"
                    checked={isHostnameFilterActive}
                    onChange={(e) => setIsHostnameFilterActive(e.target.checked)}
                    className="h-3 w-3 accent-primary cursor-pointer"
                  />
                </div>
                <Input
                  value={hostnameFilter}
                  onChange={(e) => setHostnameFilter(e.target.value)}
                  placeholder="github.com"
                  className="bg-black/40 border-border text-white text-xs h-7"
                />
                <p className="text-[9px] text-slate-500 leading-tight">
                  Toggles the extension's relative host filtering using search parameters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Scoped Link List & Manager */}
        {/* ========================================== */}
        <section className="lg:col-span-8 space-y-6 w-full">
          {/* Categories Horizontal Tabs */}
          <div className="p-1 bg-[rgba(13,9,32,0.45)] border border-border rounded-xl flex items-center gap-1.5 overflow-x-auto shadow-inner">
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryTab(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                  selectedCategoryTab === cat
                    ? "bg-primary text-white shadow-md"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Links Listing */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[rgba(13,9,32,0.45)] border border-border rounded-2xl">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
              <p className="text-slate-400 text-xs mt-3">Fetching synchronized vault cards...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-20 bg-[rgba(13,9,32,0.45)] border border-border rounded-2xl">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No saved links found</p>
              <p className="text-slate-500 text-xs mt-1">
                {isHostnameFilterActive || searchQuery || selectedCategoryTab !== "All"
                  ? "Try relaxing your filter parameters or search queries."
                  : "Save a new webpage URL using the simulator to start your vault!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLinks.map((link) => (
                <Card key={link.id} className="relative z-10 border border-white/[0.08] bg-[rgba(13,9,32,0.45)] hover:border-primary/30 transition-all duration-300 shadow-md flex flex-col justify-between overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-medium px-2 py-0.5 bg-secondary text-secondary-foreground border border-border max-w-[120px] truncate">
                        {link.category}
                      </Badge>
                      <span className="text-[9px] text-slate-500 flex items-center gap-1 shrink-0 font-mono">
                        <History className="h-2.5 w-2.5" />
                        {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {editingId === link.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-black/35 border-primary/50 text-white text-xs h-7 mt-2"
                      />
                    ) : (
                      <CardTitle className="font-display text-sm font-bold text-white mt-1.5 leading-snug line-clamp-2">
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

                  <CardContent className="p-4 pt-1.5 pb-2 flex-grow text-xs text-slate-400 space-y-2.5">
                    {editingId === link.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Edit notes..."
                          rows={2}
                          className="w-full text-xs bg-black/35 border border-primary/40 text-white rounded px-2.5 py-1 outline-none resize-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editCategory}
                            onChange={(e) => handleEditCategorySelectChange(e.target.value)}
                            className="w-full bg-black/35 border border-primary/40 text-white text-xs rounded px-2 h-7 outline-none cursor-pointer"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name} className="bg-[#120f24] text-white">
                                {cat.name}
                              </option>
                            ))}
                            <option value="__create_new__" className="bg-[#120f24] text-primary font-semibold">
                              ＋ Create custom…
                            </option>
                          </select>
                          <Input
                            value={editTagsInput}
                            onChange={(e) => setEditTagsInput(e.target.value)}
                            placeholder="Tags (Comma spl.)"
                            className="bg-black/35 border-primary/40 text-white text-xs h-7"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {link.notes && (
                          <div className="p-2 bg-black/25 rounded-md border border-border/40 text-slate-400 italic">
                            {link.notes}
                          </div>
                        )}

                        {link.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {link.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-slate-400 bg-white/[0.04] border border-border px-1.5 py-0.5 rounded">
                                <Tag className="h-2 w-2" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>

                  <CardFooter className="p-3 bg-black/15 border-t border-border/50 flex items-center justify-between">
                    {editingId === link.id ? (
                      <div className="flex items-center gap-1.5 w-full justify-end">
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          onClick={() => setEditingId(null)}
                          className="text-slate-400 hover:text-white"
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
                        <span className="text-[10px] text-slate-600 font-mono truncate max-w-[140px]">
                          ID: {link.id.substring(0, 8)}...
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon-xs" 
                            onClick={() => startEditing(link)}
                            className="text-slate-400 hover:text-white"
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
          <div className="w-full max-w-[400px] bg-[#120f24]/95 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200 text-left">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-xl">🍰</span> Create Custom Category
              </h3>
              <p className="text-xs text-slate-400">
                Custom categories let you group and filter your saved sandbox cards seamlessly. Emojis are not permitted.
              </p>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="modal-cat-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
                  className="bg-black/40 border-border text-white text-sm h-10 w-full"
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
                  className="text-slate-400 hover:text-white hover:bg-white/[0.03] text-xs h-9 rounded-lg"
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
    </div>
  );
}
