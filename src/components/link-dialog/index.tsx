"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { linkService } from "@/core/services/link.service"
import { Link } from "@/shared/types/common.types"
import { getHostname } from "@/core/utils/url.util"
import { toast } from "sonner"
import { ExternalLink, Trash2, Pencil } from "lucide-react"

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkToEdit?: Link | null
  onEditComplete?: () => void
}

export function LinkDialog({ open, onOpenChange, linkToEdit, onEditComplete }: LinkDialogProps) {
  const [activeTab, setActiveTab] = React.useState("save")
  const [currentUrl, setCurrentUrl] = React.useState("")
  const [currentTitle, setCurrentTitle] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [editingLinkId, setEditingLinkId] = React.useState<string | null>(null)

  const MAX_NOTES_LENGTH = 200

  // Current website links
  const [currentSiteLinks, setCurrentSiteLinks] = React.useState<Link[]>([])
  const [currentHostname, setCurrentHostname] = React.useState("")

  // All saved links
  const [allLinks, setAllLinks] = React.useState<Link[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Search queries
  const [searchCurrent, setSearchCurrent] = React.useState("")
  const [searchAll, setSearchAll] = React.useState("")

  // Load current page info when dialog opens
  React.useEffect(() => {
    if (open) {
      if (linkToEdit) {
        // Edit mode from externals
        startEditing(linkToEdit)
      } else {
        // New link mode
        resetForm()
      }

      const url = window.location.href
      const hostname = getHostname(url)
      setCurrentHostname(hostname)

      // Load current site links
      loadCurrentSiteLinks(hostname)

      // Load all links if on that tab
      if (activeTab === "all") {
        loadAllLinks()
      }
    } else {
      // Cleanup when closing
      setEditingLinkId(null)
    }
  }, [open, linkToEdit])

  const resetForm = () => {
    const url = window.location.href
    const title = document.title || url
    setCurrentUrl(url)
    setCurrentTitle(title)
    setTags("")
    setNotes("")
    setEditingLinkId(null)
  }

  const startEditing = (link: Link) => {
    setCurrentUrl(link.url)
    setCurrentTitle(link.title)
    setTags(link.tags.join(", "))
    setNotes(link.notes || "")
    setEditingLinkId(link.id)
    setActiveTab("save")
  }

  const handleTabChange = (value: string) => {
    if (editingLinkId) {
      resetForm()
    }
    setActiveTab(value)
  }

  // ... existing logic ...

  // Load links when switching to "all" tab
  React.useEffect(() => {
    if (open && activeTab === "all") {
      loadAllLinks()
    }
  }, [activeTab, open])

  const loadCurrentSiteLinks = async (hostname: string) => {
    setIsLoading(true)
    try {
      const links = await linkService.getLinksByHostname(hostname)
      setCurrentSiteLinks(links)
    } catch (error) {
      console.error("Failed to load current site links", error)
      toast.error("Failed to load links")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllLinks = async () => {
    setIsLoading(true)
    try {
      const links = await linkService.getAllLinks()
      setAllLinks(links)
    } catch (error) {
      console.error("Failed to load all links:", error)
      toast.error("Failed to load links")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveLink = async () => {
    if (!currentUrl.trim()) {
      toast.error("URL is required")
      return
    }

    setSaving(true)
    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      let result: Link | null = null;

      if (editingLinkId) {
        result = await linkService.updateLink(editingLinkId, {
          title: currentTitle || currentUrl,
          tags: tagsArray,
          notes: notes.trim().slice(0, MAX_NOTES_LENGTH) || undefined,
          url: currentUrl
        });
      } else {
        result = await linkService.addLink({
          url: currentUrl,
          title: currentTitle || currentUrl,
          tags: tagsArray,
          notes: notes.trim().slice(0, MAX_NOTES_LENGTH) || undefined,
        })
      }

      if (result) {
        toast.success(editingLinkId ? "Link updated!" : "Link saved successfully!")

        // Reset form to "Add new" state if we were editing, or just clear fields
        resetForm()

        // Refresh current site links
        await loadCurrentSiteLinks(currentHostname)
        // Switch to current site tab to show the saved link
        setActiveTab("current")

        if (onEditComplete) onEditComplete();
      }
    } catch (error) {
      console.error("Failed to save link", error)
      toast.error("Failed to save link")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return
    }

    try {
      await linkService.deleteLink(id)
      toast.success("Link deleted")

      // Refresh the appropriate list
      if (activeTab === "current") {
        await loadCurrentSiteLinks(currentHostname)
      } else if (activeTab === "all") {
        await loadAllLinks()
      }
    } catch (error) {
      console.error("Failed to delete link", error)
      toast.error("Failed to delete link")
    }
  }

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank")
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  // Filter function
  const filterLinks = (links: Link[], searchQuery: string): Link[] => {
    if (!searchQuery.trim()) {
      return links
    }

    const query = searchQuery.toLowerCase().trim()
    return links.filter(link => {
      const titleMatch = (link.title || "").toLowerCase().includes(query)
      const urlMatch = link.url.toLowerCase().includes(query)
      const tagsMatch = (link.tags || []).some(tag => tag.toLowerCase().includes(query))
      const notesMatch = (link.notes || "").toLowerCase().includes(query)

      return titleMatch || urlMatch || tagsMatch || notesMatch
    })
  }

  // Filtered links
  const filteredCurrentSiteLinks = React.useMemo(() => {
    return filterLinks(currentSiteLinks, searchCurrent)
  }, [currentSiteLinks, searchCurrent])

  const filteredAllLinks = React.useMemo(() => {
    return filterLinks(allLinks, searchAll)
  }, [allLinks, searchAll])

  const renderLinkItem = (link: Link, index?: number) => (
    <div
      key={link.id}
      className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-all duration-200 ease-in-out"
      style={{
        animation: `fadeInSlide 0.3s ease ${(index || 0) * 0.03}s both`
      }}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{link.title}</h4>
        <p className="text-xs text-muted-foreground truncate mt-1">
          {link.url}
        </p>
        {link.notes && (
          <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">
            {link.notes}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(link.createdAt)}
          </span>
          {link.tags && link.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {link.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleOpenLink(link.url)}
          title="Open link"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => startEditing(link)}
          title="Edit link"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleDeleteLink(link.id)}
          title="Delete link"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Link Smasher</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="save">Save Link</TabsTrigger>
              <TabsTrigger value="current">Current Site</TabsTrigger>
              <TabsTrigger value="all">All Links</TabsTrigger>
            </TabsList>

            <TabsContent value="save" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                    placeholder="Link title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (max {MAX_NOTES_LENGTH} chars)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, MAX_NOTES_LENGTH)
                      setNotes(value)
                    }}
                    maxLength={MAX_NOTES_LENGTH}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                    placeholder="Add a short note..."
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {notes.length}/{MAX_NOTES_LENGTH}
                  </div>
                </div>

                <Button
                  onClick={handleSaveLink}
                  disabled={saving || !currentUrl.trim()}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Link"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="current" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="flex-1 flex flex-col min-h-0">
                {isLoading ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Loading...
                  </div>
                ) : currentSiteLinks.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No links saved from {currentHostname}
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Search links..."
                        value={searchCurrent}
                        onChange={(e) => setSearchCurrent(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border bg-background text-sm mb-3"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {filteredCurrentSiteLinks.length} of {currentSiteLinks.length} link{currentSiteLinks.length !== 1 ? "s" : ""} from {currentHostname}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {filteredCurrentSiteLinks.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          No links match your search
                        </div>
                      ) : (
                        filteredCurrentSiteLinks.map((link, index) => renderLinkItem(link, index))
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="flex-1 flex flex-col min-h-0">
                {isLoading ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Loading...
                  </div>
                ) : allLinks.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No links saved yet
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Search links..."
                        value={searchAll}
                        onChange={(e) => setSearchAll(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border bg-background text-sm mb-3"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {filteredAllLinks.length} of {allLinks.length} total link{allLinks.length !== 1 ? "s" : ""}
                    </div>
                    {/* 
                  Implemented ScrollArea component for the "All Links" section.
                  The scrollbar will now appear when the user interacts with this area (hover/scroll).
                  It will automatically hide if the content is not sufficient to scroll.
                */}
                    <ScrollArea className="flex-1">
                      <div className="space-y-2 pr-4">
                        {filteredAllLinks.length === 0 ? (
                          <div className="text-center text-sm text-muted-foreground py-8">
                            No links match your search
                          </div>
                        ) : (
                          filteredAllLinks.map((link, index) => renderLinkItem(link, index))
                        )}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

