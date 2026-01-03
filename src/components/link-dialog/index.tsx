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
import { Select } from "@/components/ui/select"
import { linkService } from "@/core/services/link.service"
import { Link } from "@/shared/types/common.types"
import { getHostname } from "@/core/utils/url.util"
import { toast } from "sonner"
import { ExternalLink, Trash2 } from "lucide-react"

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'tags-asc' | 'tags-desc';

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkDialog({ open, onOpenChange }: LinkDialogProps) {
  const [activeTab, setActiveTab] = React.useState("save")
  const [currentUrl, setCurrentUrl] = React.useState("")
  const [currentTitle, setCurrentTitle] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  
  // Current website links
  const [currentSiteLinks, setCurrentSiteLinks] = React.useState<Link[]>([])
  const [currentHostname, setCurrentHostname] = React.useState("")
  
  // All saved links
  const [allLinks, setAllLinks] = React.useState<Link[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Sort options
  const [sortByCurrent, setSortByCurrent] = React.useState<SortOption>('date-desc')
  const [sortByAll, setSortByAll] = React.useState<SortOption>('date-desc')

  // Load current page info when dialog opens
  React.useEffect(() => {
    if (open) {
      const url = window.location.href
      const title = document.title || url
      const hostname = getHostname(url)
      
      setCurrentUrl(url)
      setCurrentTitle(title)
      setCurrentHostname(hostname)
      
      // Load current site links
      loadCurrentSiteLinks(hostname)
      
      // Load all links if on that tab
      if (activeTab === "all") {
        loadAllLinks()
      }
    }
  }, [open])

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

      const result = await linkService.addLink({
        url: currentUrl,
        title: currentTitle || currentUrl,
        tags: tagsArray,
      })

      if (result) {
        toast.success("Link saved successfully!")
        setTags("")
        // Refresh current site links
        await loadCurrentSiteLinks(currentHostname)
        // Switch to current site tab to show the saved link
        setActiveTab("current")
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

  // Sort function
  const sortLinks = (links: Link[], sortBy: SortOption): Link[] => {
    const linksCopy = [...links]
    
    switch (sortBy) {
      case 'name-asc':
        return linksCopy.sort((a, b) => {
          const titleA = (a.title || a.url).toLowerCase()
          const titleB = (b.title || b.url).toLowerCase()
          return titleA.localeCompare(titleB)
        })
      
      case 'name-desc':
        return linksCopy.sort((a, b) => {
          const titleA = (a.title || a.url).toLowerCase()
          const titleB = (b.title || b.url).toLowerCase()
          return titleB.localeCompare(titleA)
        })
      
      case 'date-asc':
        return linksCopy.sort((a, b) => a.createdAt - b.createdAt)
      
      case 'date-desc':
        return linksCopy.sort((a, b) => b.createdAt - a.createdAt)
      
      case 'tags-asc':
        return linksCopy.sort((a, b) => {
          const tagsA = (a.tags || []).join(',').toLowerCase()
          const tagsB = (b.tags || []).join(',').toLowerCase()
          if (tagsA === '' && tagsB === '') return 0
          if (tagsA === '') return 1
          if (tagsB === '') return -1
          return tagsA.localeCompare(tagsB)
        })
      
      case 'tags-desc':
        return linksCopy.sort((a, b) => {
          const tagsA = (a.tags || []).join(',').toLowerCase()
          const tagsB = (b.tags || []).join(',').toLowerCase()
          if (tagsA === '' && tagsB === '') return 0
          if (tagsA === '') return 1
          if (tagsB === '') return -1
          return tagsB.localeCompare(tagsA)
        })
      
      default:
        return linksCopy
    }
  }

  // Sorted links
  const sortedCurrentSiteLinks = React.useMemo(() => {
    return sortLinks(currentSiteLinks, sortByCurrent)
  }, [currentSiteLinks, sortByCurrent])

  const sortedAllLinks = React.useMemo(() => {
    return sortLinks(allLinks, sortByAll)
  }, [allLinks, sortByAll])

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'tags-asc', label: 'Tags (A-Z)' },
    { value: 'tags-desc', label: 'Tags (Z-A)' },
  ]

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
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
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="text-xs text-muted-foreground">
                    {currentSiteLinks.length} link{currentSiteLinks.length !== 1 ? "s" : ""} from {currentHostname}
                    </div>
                    <div className="w-[160px]">
                      <Select
                        value={sortByCurrent}
                        onChange={(value) => setSortByCurrent(value as SortOption)}
                        options={sortOptions}
                        placeholder="Sort by..."
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {sortedCurrentSiteLinks.map((link, index) => renderLinkItem(link, index))}
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
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="text-xs text-muted-foreground">
                    {allLinks.length} total link{allLinks.length !== 1 ? "s" : ""}
                    </div>
                    <div className="w-[160px]">
                      <Select
                        value={sortByAll}
                        onChange={(value) => setSortByAll(value as SortOption)}
                        options={sortOptions}
                        placeholder="Sort by..."
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {sortedAllLinks.map((link, index) => renderLinkItem(link, index))}
                  </div>
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

