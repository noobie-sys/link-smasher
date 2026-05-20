"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
    setSelectedCategory(null)
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
    setSelectedCategory(null)

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allLinks.forEach((link) => {
      const cat = link.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allLinks]);

  const activeCategories = useMemo(() => {
    return Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  }, [categoryCounts]);

  const categoryFilteredLinks = useMemo(() => {
    if (!selectedCategory) return filteredAllLinks;
    return filteredAllLinks.filter(
      (link) => (link.category || "General") === selectedCategory
    );
  }, [filteredAllLinks, selectedCategory]);

  const getCategoryCardStyle = (category: string | null) => {
    if (!category) return { border: "border-gray-500/20", glow: "bg-gray-500", textColor: "text-gray-400", icon: "🌐" };
    const cat = category.toLowerCase();
    if (cat.includes("development")) {
      return {
        border: "border-violet-500/20 hover:border-violet-500/40",
        glow: "bg-violet-500",
        textColor: "text-violet-400",
        icon: "💻"
      };
    }
    if (cat.includes("linkedin")) {
      return {
        border: "border-blue-500/20 hover:border-blue-500/40",
        glow: "bg-blue-500",
        textColor: "text-blue-400",
        icon: "🔗"
      };
    }
    if (cat.includes("tweet")) {
      return {
        border: "border-slate-500/20 hover:border-slate-500/40",
        glow: "bg-slate-400",
        textColor: "text-slate-300",
        icon: "🐦"
      };
    }
    if (cat.includes("reddit")) {
      return {
        border: "border-orange-500/20 hover:border-orange-500/40",
        glow: "bg-orange-500",
        textColor: "text-orange-400",
        icon: "👽"
      };
    }
    if (cat.includes("social")) {
      return {
        border: "border-pink-500/20 hover:border-pink-500/40",
        glow: "bg-pink-500",
        textColor: "text-pink-400",
        icon: "📣"
      };
    }
    if (cat.includes("productivity")) {
      return {
        border: "border-cyan-500/20 hover:border-cyan-500/40",
        glow: "bg-cyan-500",
        textColor: "text-cyan-400",
        icon: "🎯"
      };
    }
    if (cat.includes("entertainment")) {
      return {
        border: "border-rose-500/20 hover:border-rose-500/40",
        glow: "bg-rose-500",
        textColor: "text-rose-400",
        icon: "🎬"
      };
    }
    if (cat.includes("education")) {
      return {
        border: "border-indigo-500/20 hover:border-indigo-500/40",
        glow: "bg-indigo-500",
        textColor: "text-indigo-400",
        icon: "📚"
      };
    }
    if (cat.includes("news")) {
      return {
        border: "border-amber-500/20 hover:border-amber-500/40",
        glow: "bg-amber-500",
        textColor: "text-amber-400",
        icon: "📰"
      };
    }
    if (cat.includes("shop")) {
      return {
        border: "border-emerald-500/20 hover:border-emerald-500/40",
        glow: "bg-emerald-500",
        textColor: "text-emerald-400",
        icon: "🛒"
      };
    }
    return {
      border: "border-gray-500/20 hover:border-gray-500/40",
      glow: "bg-gray-500",
      textColor: "text-gray-400",
      icon: "🌐"
    };
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[420px] h-[min(600px,calc(100vh-2rem))] max-h-[calc(100vh-2rem)] flex flex-col p-0 overflow-hidden bg-[#1e1e1e] border-[#1e1e1e]/60 text-white gap-0 rounded-2xl shadow-2xl">

          <div className="flex-1 min-w-0 overflow-hidden flex flex-col px-4 pt-2">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0 mt-8">
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

              <TabsContent value={ActiveTab.All} className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden text-left">
                {!selectedCategory ? (
                  <div className="flex flex-col flex-1 min-h-0 text-left">
                    <SearchBar
                      value={searchAll}
                      onChange={setSearchAll}
                      className="mb-3"
                      placeholder="Search saved links..."
                    />
                    
                    {filteredAllLinks.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <p>No links saved yet</p>
                      </div>
                    ) : (
                      <div className="flex flex-col flex-1 w-full min-w-0 max-w-full overflow-hidden min-h-0 text-left">
                        <div className="px-1 py-1 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                          <span>Categories</span>
                          <span className="text-[10px] text-gray-600 normal-case">{allLinks.length} total saved links</span>
                        </div>
                        <ScrollArea className="flex-1 w-full min-w-0 overflow-x-hidden">
                          <div className="grid grid-cols-2 gap-3 pb-4 pr-1">
                            {activeCategories.map((category) => {
                              const count = categoryCounts[category] || 0;
                              const styles = getCategoryCardStyle(category);
                              return (
                                <button
                                  key={category}
                                  onClick={() => setSelectedCategory(category)}
                                  className={`group relative flex flex-col justify-between p-4 rounded-xl border ${styles.border} bg-[#232323] hover:bg-[#2a2a2a] text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 cursor-pointer h-24 overflow-hidden`}
                                >
                                  {/* Glow effect on hover */}
                                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-md ${styles.glow}`}></div>
                                  
                                  <div className="flex items-center justify-between w-full z-10">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider truncate mr-1 ${styles.textColor}`}>
                                      {category}
                                    </span>
                                    <span className="text-xs shrink-0">
                                      {styles.icon}
                                    </span>
                                  </div>
                                  
                                  <div className="mt-auto z-10">
                                    <span className="text-2xl font-bold text-white font-sans tracking-tight leading-none block">
                                      {count}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-medium block mt-1">
                                      {count === 1 ? "Link" : "Links"}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col flex-1 min-h-0 text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800 flex items-center gap-1 px-2 py-1 h-7 rounded-lg cursor-pointer text-xs"
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-0.5" />
                        <span>Back</span>
                      </Button>
                      <div className="h-4 w-px bg-gray-700"></div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded border ${getCategoryCardStyle(selectedCategory).border} ${getCategoryCardStyle(selectedCategory).textColor} bg-[#232323]`}>
                        {selectedCategory}
                      </span>
                    </div>

                    <SearchBar
                      value={searchAll}
                      onChange={setSearchAll}
                      className="mb-3"
                      placeholder={`Search in ${selectedCategory}...`}
                    />
                    <LinkList
                      links={categoryFilteredLinks}
                      isLoading={isLoading}
                      headerContent={`${categoryFilteredLinks.length} SAVED ITEMS`}
                      onOpen={handleOpenLink}
                      onEdit={startEditing}
                      onDelete={handleDeleteLink}
                      emptyMessage={`No links saved in ${selectedCategory} yet`}
                    />
                  </div>
                )}
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
