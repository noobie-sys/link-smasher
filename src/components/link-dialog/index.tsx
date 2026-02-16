"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { linkService } from "@/core/services/link.service"
import { Link, ActiveTab } from "@/shared/types/common.types"
import { getHostname } from "@/core/utils/url.util"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

// New components
import { CustomDialogHeader } from "./components/dialog-header"
import { CustomDialogFooter } from "./components/dialog-footer"
import { SearchBar } from "./components/search-bar"
import { LinkList } from "./components/link-list"


interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkToEdit?: Link | null
  onEditComplete?: () => void
}

export function LinkDialog({ open, onOpenChange, linkToEdit, onEditComplete }: LinkDialogProps) {
  // Default to Save tab
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Save)
  const [currentUrl, setCurrentUrl] = useState("")
  const [currentTitle, setCurrentTitle] = useState("")
  const [tags, setTags] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)

  const MAX_NOTES_LENGTH = 200

  // Current website links
  const [currentSiteLinks, setCurrentSiteLinks] = useState<Link[]>([])
  const [currentHostname, setCurrentHostname] = useState("")
  // All saved links
  const [allLinks, setAllLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Search queries
  const [searchCurrent, setSearchCurrent] = useState("")
  const [searchAll, setSearchAll] = useState("")

  // Load current page info when dialog opens
  useEffect(() => {
    if (open) {
      const url = window.location.href
      const hostname = getHostname(url)
      setCurrentHostname(hostname)

      if (linkToEdit) {
        // Edit mode from externals
        startEditing(linkToEdit)
      } else {
        // New link mode
        // We ensure the form is clean. The tab is already reset to Save on close.
        const title = document.title || url
        setCurrentUrl(url)
        setCurrentTitle(title)
      }

      // Load current site links
      loadCurrentSiteLinks(hostname)

      // Only load all links if we are actually ON the All tab
      if (activeTab === ActiveTab.All) {
        loadAllLinks()
      }
    } else {
      // Cleanup when closing
      setEditingLinkId(null)
      resetForm() // Reset everything (including Tab to Save) so it's ready for next open
    }
  }, [open, linkToEdit])

  const clearFormNodes = () => {
    const url = window.location.href
    const title = document.title || url
    setCurrentUrl(url)
    setCurrentTitle(title)
    setTags("")
    setNotes("")
    setEditingLinkId(null)
    setSearchCurrent("")
    setSearchAll("")
  }

  const resetForm = () => {
    clearFormNodes()
    setActiveTab(ActiveTab.Save)
  }

  const startEditing = (link: Link) => {
    setCurrentUrl(link.url)
    setCurrentTitle(link.title)
    setTags(link.tags.join(", "))
    setNotes(link.notes || "")
    setEditingLinkId(link.id)
    setActiveTab(ActiveTab.Save)
  }

  const handleTabChange = (value: string) => {
    const newTab = value as ActiveTab
    if (editingLinkId) {
      clearFormNodes()
    }
    setActiveTab(newTab)

    if (newTab === ActiveTab.All) {
      loadAllLinks()
    } else if (newTab === ActiveTab.Current) {
      loadCurrentSiteLinks(currentHostname)
    }
  }

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
        setActiveTab(ActiveTab.Current)

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
      if (activeTab === ActiveTab.Current) {
        await loadCurrentSiteLinks(currentHostname)
      } else if (activeTab === ActiveTab.All) {
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
  const filteredCurrentSiteLinks = useMemo(() => {
    return filterLinks(currentSiteLinks, searchCurrent)
  }, [currentSiteLinks, searchCurrent])

  const filteredAllLinks = useMemo(() => {
    return filterLinks(allLinks, searchAll)
  }, [allLinks, searchAll])


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[420px] max-h-[600px] h-[600px] flex flex-col p-0 overflow-hidden bg-[#1e1e1e] border-[#1e1e1e]/60 text-white gap-0 rounded-2xl shadow-2xl">
          <CustomDialogHeader onClose={() => onOpenChange(false)} />

          <div className="flex-1 overflow-hidden flex flex-col px-4 pt-2">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3 bg-[#1A1A1A] mb-4">
                <TabsTrigger
                  value={ActiveTab.Save}
                  className="data-[state=active]:bg-[#2C2C2C] data-[state=active]:text-[#FFFFFF] text-[#808080]"
                >
                  Save Link
                </TabsTrigger>
                <TabsTrigger
                  value={ActiveTab.Current}
                  className="data-[state=active]:bg-[#2C2C2C] data-[state=active]:text-[#FFFFFF] text-[#808080]"
                >
                  Current Site
                </TabsTrigger>
                <TabsTrigger
                  value={ActiveTab.All}
                  className="data-[state=active]:bg-[#2C2C2C] data-[state=active]:text-[#FFFFFF] text-[#808080]"
                >
                  All Links
                </TabsTrigger>
              </TabsList>

              <TabsContent value={ActiveTab.Save} className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">URL</Label>
                    <Input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => setCurrentUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-transparent bg-[#2C2C2C] text-sm text-white placeholder:text-gray-500 focus-visible:ring-gray-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Title</Label>
                    <Input
                      type="text"
                      value={currentTitle}
                      onChange={(e) => setCurrentTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-transparent bg-[#2C2C2C] text-sm text-white placeholder:text-gray-500 focus-visible:ring-gray-500"
                      placeholder="Link title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Tags (comma separated)</Label>
                    <Input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-transparent bg-[#2C2C2C] text-sm text-white placeholder:text-gray-500 focus-visible:ring-gray-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, MAX_NOTES_LENGTH)
                        setNotes(value)
                      }}
                      maxLength={MAX_NOTES_LENGTH}
                      className="w-full px-3 py-2 rounded-lg border-transparent bg-[#2C2C2C] text-sm text-white placeholder:text-gray-500 focus-visible:ring-gray-500 min-h-[80px]"
                      placeholder="Add a short note..."
                    />
                    <div className="text-[10px] text-gray-500 text-right">
                      {notes.length}/{MAX_NOTES_LENGTH}
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveLink}
                    disabled={saving || !currentUrl.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    {saving ? "Saving..." : "Save Link"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value={ActiveTab.Current} className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
                <SearchBar
                  value={searchCurrent}
                  onChange={setSearchCurrent}
                  className="mb-3"
                  placeholder="Search saved links..."
                />
                <LinkList
                  links={filteredCurrentSiteLinks}
                  isLoading={isLoading}
                  headerContent={`${filteredCurrentSiteLinks.length} SAVED ITEMS FROM ${currentHostname.toUpperCase()}`}
                  onOpen={handleOpenLink}
                  onEdit={startEditing}
                  onDelete={handleDeleteLink}
                  emptyMessage={`No links saved from ${currentHostname}`}
                />
              </TabsContent>

              <TabsContent value={ActiveTab.All} className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
                <SearchBar
                  value={searchAll}
                  onChange={setSearchAll}
                  className="mb-3"
                  placeholder="Search saved links..."
                />
                <LinkList
                  links={filteredAllLinks}
                  isLoading={isLoading}
                  headerContent={`${filteredAllLinks.length} SAVED ITEMS`}
                  onOpen={handleOpenLink}
                  onEdit={startEditing}
                  onDelete={handleDeleteLink}
                  emptyMessage="No links saved yet"
                />
              </TabsContent>
            </Tabs>
          </div>

          <CustomDialogFooter
            version="1.4.2"
            onSettings={() => console.log("Settings Clicked")}
            onExport={() => console.log("Export Clicked")}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

