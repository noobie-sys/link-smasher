import { DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Link2, X } from "lucide-react"

interface DialogHeaderProps {
    title?: string
    logo?: React.ReactNode
    onClose?: () => void
    className?: string
}

export function CustomDialogHeader({ title = "Link Crust", logo, onClose, className }: DialogHeaderProps) {
    return (
        <div className={`flex items-center justify-between p-4 border-b border-[#2C2C2C] ${className}`}>
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
                    {logo || <Link2 className="h-5 w-5 text-white" />}
                </div>
                <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
            </div>
        </div>
    )
}
