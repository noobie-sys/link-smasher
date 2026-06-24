"use client";

import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { EMOJI_REGEX, parseTagsInput, extractCleanHostname } from "@/lib/link-utils";
import { 
  Link2, 
  Search, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Globe, 
  Tag, 
  BookOpen, 
  AlertCircle, 
  Gauge, 
  History,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const STATUS_TIMEOUT_MS = 5000;

export default function SimulatorPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Live database states
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Throttling Hud State
  const [rateLimit, setRateLimit] = useState({
    limit: 60,
    remaining: 60,
    reset: Date.now() + 60000,
  });

  // Simulator Save Form States
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");

  // Category creation states
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Search/Filters states inside the simulator panel
  const [searchQuery, setSearchQuery] = useState("");
  const [hostnameFilter, setHostnameFilter] = useState("");
  const [isHostnameFilterActive, setIsHostnameFilterActive] = useState(false);

  const hasLoadedRef = useRef<boolean>(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [linksRes, catsRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/categories")
      ]);

      const linksJson = await linksRes.json() as ApiResponse<SavedLink[]>;
      const catsJson = await catsRes.json() as ApiResponse<CategoryOption[]>;

      if (linksJson.success && Array.isArray(linksJson.data)) {
        setLinks(linksJson.data);
      }
      if (catsJson.success && Array.isArray(catsJson.data)) {
        setCategories(catsJson.data);
      }
    } catch (err) {
      console.error("Failed to load simulator data:", err);
      showStatus("error", "Failed to retrieve live vault records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      void fetchData();
    }
  }, [session, fetchData]);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), STATUS_TIMEOUT_MS);
  };

  const updateRateHeaders = (headers: Headers) => {
    const limit = headers.get("X-RateLimit-Limit");
    const remaining = headers.get("X-RateLimit-Remaining");
    const reset = headers.get("X-RateLimit-Reset");

    if (limit && remaining) {
      setRateLimit({
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: reset ? parseInt(reset, 10) : Date.now() + 60000,
      });
    }
  };

  // Submit link saving
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      showStatus("error", "URL and Title are required.");
      return;
    }

    const trimmedCategory = category.trim();
    if (EMOJI_REGEX.test(trimmedCategory)) {
      showStatus("error", "Category name must not contain emojis! 🧠");
      return;
    }

    let optimisticLink: SavedLink | null = null;

    try {
      setIsActionPending(true);
      const tagsArray = parseTagsInput(tagsInput);
      optimisticLink = {
        id: `optimistic-${Date.now()}`,
        url,
        title,
        hostname: extractCleanHostname(url, "unknown"),
        tags: tagsArray,
        notes: notes.trim() || null,
        category: trimmedCategory,
        createdAt: Date.now(),
      };

      const optimisticDraft = optimisticLink;
      setLinks((current) => [optimisticDraft, ...current]);
      
      // Reset form inputs
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
          url: optimisticDraft.url,
          title: optimisticDraft.title,
          category: optimisticDraft.category,
          notes: optimisticDraft.notes || undefined,
          tags: optimisticDraft.tags,
        }),
      });

      updateRateHeaders(res.headers);
      const payload = await res.json() as ApiResponse<SavedLink>;

      if (payload.success && payload.data) {
        const savedLink = payload.data;
        showStatus("success", "Link saved to database via companion simulator!");
        setLinks((current) => current.map((link) => (
          link.id === optimisticDraft.id ? savedLink : link
        )));
        
        // Refresh categories list
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json() as ApiResponse<CategoryOption[]>;
        if (catData.success && Array.isArray(catData.data)) {
          setCategories(catData.data);
        }
      } else {
        // Rollback
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

  // Delete handler
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

  // Category select change
  const handleCategorySelectChange = (val: string) => {
    if (val === "__create_new__") {
      setIsCreateCategoryModalOpen(true);
    } else {
      setCategory(val);
    }
  };

  // Create new category inline
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
    setCategory(name);
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
      if (payload.success && payload.data) {
        const createdCategory = payload.data;
        showStatus("success", `Category "${createdCategory.name}" created!`);
        setCategories((current) => current.map((cat) => (
          cat.id === optimisticCategory.id ? createdCategory : cat
        )));
        setCategory(createdCategory.name);
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

  // Filter links for simulated display list
  const filteredLinks = links.filter((link) => {
    const matchesSearch = 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.notes && link.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHost = !isHostnameFilterActive || 
      (hostnameFilter.trim() && link.hostname.toLowerCase().includes(hostnameFilter.trim().toLowerCase()));

    return matchesSearch && matchesHost;
  });

  return (
    <div className="flex h-full flex-col font-sans bg-background text-foreground relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/5 blur-[100px] animate-pulse [animation-delay:4s]" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 grid-pattern opacity-10" />

      {/* Header */}
      <header className="relative z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 lg:px-6 bg-card/10 backdrop-blur-xs">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-2 h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <h1 className="text-sm font-semibold text-foreground tracking-tight">Companion Simulator</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-6 w-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-6">
        <div className="space-y-1.5 shrink-0">
          <h2 className="text-xl font-display font-bold tracking-tight">Interactive Extension Simulator</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Test the Companion Extension save form and filter parameters. Saving here writes directly to your database.
          </p>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className="w-full flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-md animate-in fade-in slide-in-from-top-4 duration-300 shrink-0 bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0 overflow-hidden">
          {/* LEFT SIDE: Simulator popup mockup (exactly w-[370px]) */}
          <section className="lg:col-span-5 flex justify-center lg:justify-start items-start w-full h-full overflow-hidden">
            <div className="w-[370px] shrink-0 rounded-2xl border border-border bg-card p-5 text-center shadow-2xl backdrop-blur-md animate-in fade-in duration-500 flex flex-col max-h-full overflow-y-auto scrollbar-thin">
              {/* Extension Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground leading-none">Instant Link Crust</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 uppercase tracking-widest px-1.5 py-0.5">
                  Simulator
                </Badge>
              </div>

              {/* Form save */}
              <form onSubmit={handleSaveLink} className="space-y-3.5 text-left">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Target URL
                  </label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/docs"
                    className="bg-muted/20 border-border text-foreground text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Card Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Official API Guidelines"
                    className="bg-muted/20 border-border text-foreground text-xs h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => handleCategorySelectChange(e.target.value)}
                      className="w-full bg-muted/20 border border-border text-foreground text-xs rounded-md px-3 h-9 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer"
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
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Tags (Comma Spl.)
                    </label>
                    <Input
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Docs, Biology"
                      className="bg-muted/20 border-border text-foreground text-xs h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Inline Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add custom developer details or links..."
                    rows={2}
                    className="w-full text-xs bg-muted/20 border-border text-foreground rounded-md px-3 py-1.5 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/50 outline-none transition-all focus-visible:ring-2 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isActionPending}
                  className="w-full bg-primary hover:bg-primary/95 text-white text-xs font-semibold h-9 rounded-lg shadow-md shadow-primary/20 cursor-pointer animate-none"
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

              {/* Local Search & Host Filters */}
              <div className="mt-5 pt-4 border-t border-border space-y-3.5 text-left shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vault locally..."
                    className="bg-muted/20 border-border text-foreground text-xs pl-8 h-8"
                  />
                </div>

                {/* Host Filter simulation */}
                <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      "This Site Only" Simulator
                    </span>
                    <input
                      type="checkbox"
                      checked={isHostnameFilterActive}
                      onChange={(e) => setIsHostnameFilterActive(e.target.checked)}
                      className="h-3.5 w-3.5 accent-primary cursor-pointer"
                    />
                  </div>
                  <Input
                    value={hostnameFilter}
                    onChange={(e) => setHostnameFilter(e.target.value)}
                    placeholder="github.com"
                    className="bg-background border-border text-foreground text-xs h-7"
                  />
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    Toggles the extension's relative host filtering using search parameters.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE: Vault listings */}
          <section className="lg:col-span-7 flex flex-col w-full h-full overflow-hidden space-y-4">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                Live Vault Records
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {filteredLinks.length} items matched
              </span>
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-card border border-border rounded-xl">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
                <p className="text-muted-foreground text-xs mt-3">Fetching synchronized database records...</p>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-card border border-border rounded-xl py-20">
                <p className="text-muted-foreground text-sm font-semibold">No matching links in vault</p>
                <p className="text-muted-foreground/80 text-xs mt-1">
                  Try typing another search term, toggling host filter off, or saving a new link.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                {filteredLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 bg-card border border-border rounded-xl hover:border-primary/20 transition-all flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">{link.title}</span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0.2 bg-secondary text-secondary-foreground font-medium shrink-0">
                          {link.category}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate block">{link.url}</span>
                      {link.notes && (
                        <p className="text-[10px] text-muted-foreground/80 bg-muted/30 border border-border/25 px-2 py-1 rounded italic mt-1 line-clamp-1">
                          {link.notes}
                        </p>
                      )}
                      {link.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {link.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.3 rounded">
                              <Tag className="h-1.5 w-1.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                      title="Delete link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
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
    </div>
  );
}
