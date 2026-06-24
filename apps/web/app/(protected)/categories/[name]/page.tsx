"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Trash2,
  Search,
  EyeOff,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface LinkItem {
  id: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes?: string | null;
  short: string;
  createdAt: number;
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  // Resolve parameters promise
  const resolvedParams = use(params)
  const categoryName = decodeURIComponent(resolvedParams.name)

  const [links, setLinks] = React.useState<LinkItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  // Pagination & Debounce State
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [totalCount, setTotalCount] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("")

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Reset page to 1 on search query change
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery])

  const fetchLinks = React.useCallback(async () => {
    try {
      setIsLoading(true)
      
      const queryParams = new URLSearchParams()
      queryParams.set("category", categoryName)
      queryParams.set("page", page.toString())
      queryParams.set("limit", limit.toString())
      if (debouncedSearchQuery.trim()) {
        queryParams.set("search", debouncedSearchQuery.trim())
      }

      const res = await fetch(`/api/links?${queryParams.toString()}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setLinks(data.data)
        if (data.pagination) {
          setTotalCount(data.pagination.totalCount)
          setTotalPages(data.pagination.totalPages)
          if (page > data.pagination.totalPages && data.pagination.totalPages > 0) {
            setPage(data.pagination.totalPages)
          }
        }
      }
    } catch {
      showStatus("error", "Failed to retrieve links for this category.")
    } finally {
      setIsLoading(false)
    }
  }, [categoryName, page, limit, debouncedSearchQuery])

  React.useEffect(() => {
    void fetchLinks()
  }, [fetchLinks])

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 4000)
  }

  const handleCopyLink = (id: string, shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteLink = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    const previousLinks = links
    // Optimistic delete
    setLinks((curr) => curr.filter((l) => l.id !== id))

    try {
      setIsDeleting(id)
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" })
      const data = await res.json()

      if (res.ok && data.success) {
        showStatus("success", "Link deleted successfully.")
      } else {
        // Rollback
        setLinks(previousLinks)
        showStatus("error", data.error?.message || "Failed to delete link.")
      }
    } catch {
      setLinks(previousLinks)
      showStatus("error", "Network error. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  // links array is already filtered by server-side query parameters.

  return (
    <div className="h-full flex flex-col overflow-hidden font-sans bg-background text-foreground relative">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 grid-pattern opacity-10" />

      {/* Header */}
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 lg:px-6 bg-background/50 backdrop-blur-xs justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="mx-2 h-4 bg-border/50" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/categories" className="hover:text-foreground transition-colors">
              Categories
            </Link>
            <span className="text-border/80">/</span>
            <span className="text-foreground font-semibold font-display tracking-wide">{categoryName}</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative w-40 sm:w-60 md:w-80 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search in this folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/20 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        <main className="flex-1 relative z-10 max-w-5xl mx-auto px-6 mt-8 w-full space-y-6">
        {/* Navigation Action Back Row */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to folders
          </Link>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg border text-xs shadow-md animate-in fade-in slide-in-from-top-2 duration-300 ${
              statusMessage.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

          {/* Links listing */}
          {isLoading ? (
            <div className="flex h-60 w-full items-center justify-center">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            </div>
          ) : links.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {links.map((link) => (
              <div
                key={link.id}
                className="group relative rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/30 transition-all duration-300 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate max-w-[280px]">
                        {link.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Globe className="h-3 w-3 shrink-0" />
                        <span className="truncate">{link.hostname}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-primary/20 shrink-0 transition-colors"
                        title="Open original website"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteLink(link.id, link.title)}
                        disabled={isDeleting === link.id}
                        className="p-1.5 rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-destructive hover:border-destructive/20 shrink-0 transition-colors cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {link.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic bg-muted/20 px-2.5 py-1.5 rounded-md border border-border/20">
                      {link.notes}
                    </p>
                  )}

                  {link.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {link.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-medium bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-sky-500 dark:text-sky-400">
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate max-w-[200px]">{link.short}</span>
                  </div>
                  <Button
                    onClick={() => handleCopyLink(link.id, link.short)}
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2.5 text-xs flex gap-1.5 cursor-pointer ${
                      copiedId === link.id ? "text-green-600 dark:text-green-400 bg-green-500/10" : ""
                    }`}
                  >
                    {copiedId === link.id ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy short
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          ) : (
              <div className="text-center py-24 border border-dashed border-border rounded-xl bg-card/25 space-y-3">
                <EyeOff className="h-8 w-8 text-muted-foreground mx-auto" />
                <h3 className="font-semibold text-sm text-foreground">No links found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {searchQuery
                    ? "We couldn't find any links matching your search filters in this category."
                    : `This folder is currently empty. Open the Simulator and save a new tab into "${categoryName}".`}
                </p>
              </div>
          )}
        </main>

        {/* Pagination Controls — always rendered at the bottom, outside the content flow */}
        {!isLoading && totalCount > 0 && (
          <div className="max-w-5xl mx-auto px-6 pb-6 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm select-none">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{((page - 1) * limit) + 1}</span> to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(page * limit, totalCount)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{totalCount}</span> links
              </div>

              <div className="flex items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Show</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(parseInt(e.target.value, 10))
                      setPage(1)
                    }}
                    className="bg-muted/40 border border-border text-foreground text-xs rounded px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="h-8 px-2.5 text-xs flex gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Button>

                  <div className="text-xs text-muted-foreground font-medium px-2">
                    Page <span className="text-foreground">{page}</span> of{" "}
                    <span className="text-foreground">{totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="h-8 px-2.5 text-xs flex gap-1 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
