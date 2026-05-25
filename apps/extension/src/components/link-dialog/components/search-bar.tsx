import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function SearchBar({ value, onChange, placeholder = "Search saved links...", className }: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 h-10 bg-[#2C2C2C] border-transparent text-white placeholder:text-gray-500 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-gray-500 rounded-lg hover:bg-[#343434] transition-colors"
                placeholder={placeholder}
            />
        </div>
    )
}
