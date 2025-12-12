"use client"

import * as React from "react"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { getUserActions } from "@/lib/user.action"
import { UserAction } from "@/lib/types"

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const [userActions, setUserActions] = React.useState<UserAction[]>([])
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])


    React.useEffect(() => {
        if (!open) return;
        getUserActions().then(setUserActions)
    }, [open])

    return (
        <>
            <p className="text-muted-foreground text-sm">
                Press{" "}
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                    <span className="text-xs">⌘</span>J
                </kbd>
            </p>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command loop={true} className="max-h-96 min-h-96 rounded-lg shadow-md">
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {
                            userActions?.map(action => (
                                <CommandItem
                                    key={action.id}
                                    value={action.title}
                                    onSelect={() => {
                                        action.handler(); setOpen(false);
                                    }}

                                >
                                    <span className="flex-1 truncate px-3 text-start">
                                        {action.title}
                                    </span>
                                </CommandItem>
                            ))
                        }
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}
