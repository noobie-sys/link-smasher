import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/55 flex h-8 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
