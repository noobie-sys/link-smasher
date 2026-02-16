interface DialogFooterProps {
    version?: string
    onSettings?: () => void
    onExport?: () => void
    className?: string
}

export function CustomDialogFooter({ version = "1.0.0", onSettings, onExport, className }: DialogFooterProps) {
    return (
        <div className={`flex items-center justify-between py-4 px-4 border-t border-[#2C2C2C] mt-2 ${className}`}>
            <span className="text-[10px] text-gray-600 font-medium tracking-widest uppercase">
                Version {version}
            </span>
            <div className="flex items-center gap-4">
                <button
                    onClick={onSettings}
                    className="text-[10px] text-gray-500 hover:text-gray-300 font-bold tracking-widest uppercase transition-colors"
                >
                    Settings
                </button>
                <button
                    onClick={onExport}
                    className="text-[10px] text-gray-500 hover:text-gray-300 font-bold tracking-widest uppercase transition-colors"
                >
                    Export
                </button>
            </div>
        </div>
    )
}
