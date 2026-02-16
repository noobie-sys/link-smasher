import { Link as LinkType } from "@/shared/types/common.types"
import { LinkItem } from "./link-item"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LinkListProps {
    links: LinkType[]
    isLoading?: boolean
    emptyMessage?: string
    onOpen?: (url: string) => void
    onEdit?: (link: LinkType) => void
    onDelete?: (id: string) => void
    className?: string
    headerContent?: React.ReactNode // e.g. "12 Saved Item" count
}

export function LinkList({
    links,
    isLoading,
    emptyMessage = "No links found.",
    onOpen,
    onEdit,
    onDelete,
    className,
    headerContent
}: LinkListProps) {

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (links.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className={`flex flex-col flex-1 min-h-0 ${className}`}>
            {headerContent && (
                <div className="px-1 py-3 text-xs font-medium text-gray-500 uppercase tracking-widest border-b border-transparent mb-1 flex items-center justify-between">
                    {headerContent}
                </div>
            )}
            <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="pb-4">
                    {links.map((link) => (
                        <LinkItem
                            key={link.id}
                            link={link}
                            onOpen={onOpen}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
