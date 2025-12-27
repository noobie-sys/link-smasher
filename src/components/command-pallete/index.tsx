"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { toast } from "sonner"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const [shortcutLabel, setShortcutLabel] = React.useState("⌘J");

    React.useEffect(() => {
        // Load shortcut label
        const loadShortcut = async () => {
            const { shortcutService } = await import("@/core/services/shortcut.service");
            const { ShortcutAction } = await import("@/shared/types/shortcut.types");
            const shortcuts = await shortcutService.getShortcuts();
            const paletteShortcut = shortcuts.find(s => s.id === ShortcutAction.TOGGLE_PALETTE);
            if (paletteShortcut?.currentCombo) {
                const { key, metaKey, shiftKey, ctrlKey, altKey } = paletteShortcut.currentCombo;
                let label = "";
                if (metaKey) label += "⌘";
                if (ctrlKey) label += "^"; // or Ctrl
                if (altKey) label += "⌥";
                if (shiftKey) label += "⇧";
                label += key.toUpperCase();
                setShortcutLabel(label);
            }
        };
        loadShortcut();

        // Listen for toggle event
        const toggleHandler = () => setOpen((prev) => !prev);
        window.addEventListener("ls-toggle-palette", toggleHandler);

        return () => {
            window.removeEventListener("ls-toggle-palette", toggleHandler);
        };
    }, [])

    return (
        <>
            <p className="text-muted-foreground text-sm">
                Press{" "}
                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                    <span className="text-xs">{shortcutLabel}</span>
                </kbd>
            </p>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem>
                            <Calendar />
                            <span>Calendar</span>
                        </CommandItem>
                        <CommandItem>
                            <Smile />
                            <span>Search Emoji</span>
                        </CommandItem>
                        <CommandItem>
                            <Calculator />
                            <span>Calculator</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem>
                            <User />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <CreditCard />
                            <span>Billing</span>
                            <CommandShortcut>⌘B</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <Settings />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}