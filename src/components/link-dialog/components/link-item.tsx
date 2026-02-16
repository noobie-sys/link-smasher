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

export function LinkItem({ link, onOpen, onEdit, onDelete }: LinkItemProps) {
    return (
        <div className="group relative flex items-start p-4 mb-3 rounded-xl bg-[#232323] hover:bg-[#2a2a2a] border border-transparent hover:border-gray-700 transition-all duration-200">

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
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-gray-200 truncate pr-8 group-hover:text-white transition-colors">
                        {link.title || link.url}
                    </h3>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 flex items-center gap-1 bg-[#232323] pl-2 rounded-l-lg shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.5)]">
                        {onOpen && (
                            <Button variant="ghost" size="icon-sm" onClick={() => onOpen(link.url)} className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700">
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {onEdit && (
                            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(link)} className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(link.id)} className="h-7 w-7 text-red-400/70 hover:text-red-400 hover:bg-red-900/20">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                <p className="text-xs text-gray-500 truncate mt-0.5 mb-2 font-mono opacity-70">
                    {link.url.replace(/^https?:\/\//, '')}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
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
