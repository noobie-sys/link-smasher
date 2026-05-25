import { Link as LinkType } from "@/shared/types/common.types"
import { ExternalLink, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LinkItemProps {
    link: LinkType
    onOpen?: (url: string) => void
    onEdit?: (link: LinkType) => void
    onDelete?: (id: string) => void
}

// Fallback if helper doesn't exist
const getFavicon = (url: string) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return "";
    }
}

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const getCategoryStyle = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("development")) {
        return "border-violet-500/20 text-violet-400 bg-violet-500/10";
    }
    if (cat.includes("linkedin")) {
        return "border-blue-500/25 text-blue-400 bg-blue-500/10";
    }
    if (cat.includes("tweet") || cat.includes("threads")) {
        return "border-slate-500/30 text-slate-300 bg-slate-500/10";
    }
    if (cat.includes("reddit")) {
        return "border-orange-500/20 text-orange-400 bg-orange-500/10";
    }
    if (cat.includes("social")) {
        return "border-pink-500/20 text-pink-400 bg-pink-500/10";
    }
    if (cat.includes("productivity")) {
        return "border-cyan-500/20 text-cyan-400 bg-cyan-500/10";
    }
    if (cat.includes("entertainment")) {
        return "border-rose-500/20 text-rose-400 bg-rose-500/10";
    }
    if (cat.includes("education")) {
        return "border-indigo-500/20 text-indigo-400 bg-indigo-500/10";
    }
    if (cat.includes("news")) {
        return "border-amber-500/20 text-amber-400 bg-amber-500/10";
    }
    if (cat.includes("shop")) {
        return "border-emerald-500/20 text-emerald-400 bg-emerald-500/10";
    }
    return "border-gray-500/20 text-gray-400 bg-gray-500/10";
}

export function LinkItem({ link, onOpen, onEdit, onDelete }: LinkItemProps) {
    return (
        <div className="group relative flex w-full min-w-0 max-w-full items-start overflow-hidden rounded-xl border border-gray-500/40 bg-[#232323] p-4 mb-3 text-ellipsis transition-all duration-200 hover:border-gray-700 hover:bg-[#2a2a2a]">

            {/* Icon / Image Placeholder */}
            <div className="shrink-0 mr-4">
                <div className="h-10 w-10 rounded-lg bg-[#333] flex items-center justify-center overflow-hidden border border-gray-700/50">
                    <img
                        src={getFavicon(link.url)}
                        alt=""
                        className="h-6 w-6 object-contain opacity-80"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-gray-700', 'to-gray-800');
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 truncate">
                <div className="flex min-w-0 justify-between items-start gap-2">
                    <h3 className="text-sm font-medium text-gray-200 overflow-hidden text-clip pr-8 group-hover:text-white transition-colors truncate max-w-sm">
                        {link.title || link.url}
                    </h3>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-3 flex items-center gap-1 pl-2 rounded-l-lg shadow-lg">
                        {onOpen && (
                            <Button variant="ghost" size="icon-sm" onClick={() => onOpen(link.url)} className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {onEdit && (
                            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(link)} className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(link.id)} className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-900/20 cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>



                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs font-mono text-gray-500 truncate max-w-[240px] opacity-70">
                        {link.url.replace(/^https?:\/\//, '')}
                    </p>
                    {link.category && (
                        <span className={`inline-flex shrink-0 items-center px-1.5 py-0.25 rounded-md text-[9px] font-medium border ${getCategoryStyle(link.category)}`}>
                            {link.category}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-start justify-between gap-2 mt-auto">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {link.tags && link.tags.length > 0 ? (
                            link.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="bg-[#2C2C2C] text-gray-400 hover:bg-[#383838] border-none px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                                    {tag}
                                </Badge>
                            ))
                        ) : null}
                    </div>

                    {/* Metadata (Date) */}
                    <span className="text-[10px] text-gray-600 font-medium ml-auto flex items-center gap-1">
                        {formatDate(link.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    )
}
