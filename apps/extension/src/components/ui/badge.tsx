import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                // Custom variants based on the image description/requirements if needed
                blue: "border-transparent bg-blue-500/15 text-blue-500 hover:bg-blue-500/25",
                purple: "border-transparent bg-purple-500/15 text-purple-500 hover:bg-purple-500/25",
                pink: "border-transparent bg-pink-500/15 text-pink-500 hover:bg-pink-500/25",
                gray: "border-transparent bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "blue" | "purple" | "pink" | "gray" | null
}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
