"use client"

import * as React from "react"
import Link from "next/link"
import {
  Folder,
  Plus,
  ArrowRight,
  Loader2,
  Trash2,
  RefreshCw,
  FolderPlus,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface CategoryOption {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
}

interface LinkItem {
  id: string;
  category: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryOption[]>([])
  const [links, setLinks] = React.useState<LinkItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [newCatName, setNewCatName] = React.useState("")
  const [newCatColor, setNewCatColor] = React.useState("#6366F1")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  const PRESET_COLORS = [
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#F43F5E", // Rose
    "#06B6D4", // Cyan
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#6B7280", // Gray
  ]

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const [catRes, linkRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/links"),
      ])
      const catData = await catRes.json()
      const linkData = await linkRes.json()

      if (catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data)
      }
      if (linkData.success && Array.isArray(linkData.data)) {
        setLinks(linkData.data)
      }
    } catch (err) {
      console.error(err)
      showStatus("error", "Failed to retrieve category counts.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchData()
  }, [fetchData])

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        showStatus("success", `Category "${newCatName}" created successfully.`)
        setNewCatName("")
        void fetchData()
      } else {
        showStatus("error", data.error?.message || "Failed to create category.")
      }
    } catch {
      showStatus("error", "Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLinkCount = (categoryName: string) => {
    return links.filter((link) => link.category.toLowerCase() === categoryName.toLowerCase()).length
  }

  return (
    <div className="h-full flex flex-col overflow-hidden font-sans bg-background text-foreground relative">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-0 grid-pattern opacity-10" />

      {/* Header */}
      <header className="relative z-20 flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-4 lg:px-6 bg-background/50 backdrop-blur-xs">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-2 h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground tracking-tight">Categories Manager</h1>
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto pb-12 relative z-10">
        <main className="relative z-10 max-w-5xl mx-auto px-6 mt-8 w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-bold tracking-tight">Vault Folders</h2>
            <p className="text-sm text-muted-foreground">
              Manage your collection categories. Click any card to drill down and review its saved links.
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="w-fit self-end flex gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Categories Grid (Left Side) */}
          <div className="lg:col-span-8 w-full">
            {isLoading ? (
              <div className="flex h-60 w-full items-center justify-center">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const count = getLinkCount(cat.name)
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${encodeURIComponent(cat.name)}`}
                      className="group relative rounded-xl border border-border bg-card/60 p-5 shadow-xs hover:border-primary/30 hover:bg-primary/[0.02] transition-all flex flex-col justify-between gap-4 min-h-[130px] hover:-translate-y-0.5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {cat.name}
                          </h3>
                          {cat.isSystem && (
                            <span className="text-[9px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full border border-border/50">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {cat.isSystem
                            ? `Default folder containing saved pages related to ${cat.name.toLowerCase()}.`
                            : `User custom folder for links related to ${cat.name.toLowerCase()}.`}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <span className="text-muted-foreground font-medium">
                          {count} {count === 1 ? "saved link" : "saved links"}
                        </span>
                        <div className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Open Folder
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/25 space-y-2">
                <Folder className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No categories found in your vault.</p>
              </div>
            )}
          </div>

          {/* Add Category Section (Right Side) */}
          <div className="lg:col-span-4 w-full">
            <div className="rounded-xl border border-border bg-card/75 p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <FolderPlus className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-bold text-sm">Add New Folder</h3>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="cat-name" className="text-xs font-semibold text-muted-foreground">
                    Folder Name
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    required
                    maxLength={30}
                    placeholder="e.g. Design Inspiration"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Choose Theme Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className={`w-full h-8 rounded-lg border transition-all cursor-pointer ${
                          newCatColor === color ? "border-primary scale-105 shadow-sm" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full text-xs py-2 bg-primary hover:bg-primary/95 text-white flex gap-1.5 cursor-pointer">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Create Folder
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
