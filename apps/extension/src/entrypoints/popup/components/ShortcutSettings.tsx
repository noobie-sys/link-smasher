import React, { useState, useEffect, useRef } from "react";
import { keyboardConfigService, KeyboardShortcutConfig, ShortcutAction } from "@/core/services/keyboard-config.service";

const KeyDisplay = ({ combo }: { combo?: KeyboardShortcutConfig["defaultCombo"] }) => {
    if (!combo) return <span className="text-slate-500 text-xs">None</span>;
    const parts = [];
    if (combo.metaKey) parts.push("⌘");
    if (combo.ctrlKey) parts.push("^");
    if (combo.altKey) parts.push("⌥");
    if (combo.shiftKey) parts.push("⇧");
    parts.push(combo.key.toUpperCase());
    return (
        <kbd className="bg-[#263047] text-slate-200 border border-[#374151] px-1.5 py-0.5 rounded font-mono text-xs shadow-inner">
            {parts.join("+")}
        </kbd>
    );
};

/**
 * Renders the keyboard shortcuts settings UI, allowing recording of new combos and resetting to defaults.
 *
 * Loads shortcuts on mount, persists updates and resets via the keyboard configuration service, and refreshes the displayed list after changes.
 *
 * @returns A React element that displays each shortcut's name, description, current combo (or "None"), a recording target when active, and a conditional "Reset" action when the combo differs from the default.
 */
export function ShortcutSettings() {
    const [shortcuts, setShortcuts] = useState<KeyboardShortcutConfig[]>([]);
    const [recordingId, setRecordingId] = useState<string | null>(null);
    const recordingRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        console.log("[ShortcutSettings] Mounted. Loading initial shortcuts...");
        loadShortcuts();
    }, []);

    // Ensure the recording element gets focus immediately when rendering
    useEffect(() => {
        if (recordingId && recordingRef.current) {
            console.log("[ShortcutSettings] Focus shifted to recording element for:", recordingId);
            recordingRef.current.focus();
        }
    }, [recordingId]);

    const loadShortcuts = async () => {
        try {
            const list = await keyboardConfigService.getShortcuts();
            console.log("[ShortcutSettings] Loaded shortcuts from config service:", list);
            setShortcuts(list);
        } catch (err) {
            console.error("[ShortcutSettings] Failed to load shortcuts:", err);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent, shortcut: KeyboardShortcutConfig) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("[ShortcutSettings] handleKeyDown intercepted key:", e.key, {
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
        });

        // Ignore modifier-only keydowns
        if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
            console.log("[ShortcutSettings] Ignored modifier-only keydown:", e.key);
            return;
        }

        const newCombo = {
            key: e.key,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
        };

        console.log("[ShortcutSettings] Attempting to save new shortcut combo:", newCombo);

        try {
            await keyboardConfigService.updateShortcut(shortcut.id as ShortcutAction, newCombo);
            console.log("[ShortcutSettings] Shortcut successfully updated in storage!");
            await loadShortcuts();
            setRecordingId(null);
        } catch (err) {
            console.error("[ShortcutSettings] Failed to update shortcut:", err);
        }
    };

    const handleReset = async (shortcut: KeyboardShortcutConfig) => {
        console.log("[ShortcutSettings] Reset requested for shortcut:", shortcut.id);
        try {
            await keyboardConfigService.resetShortcut(shortcut.id as ShortcutAction);
            console.log("[ShortcutSettings] Shortcut successfully reset in storage!");
            await loadShortcuts();
        } catch (err) {
            console.error("[ShortcutSettings] Failed to reset shortcut:", err);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Keyboard Shortcuts</h3>
            <div className="flex flex-col gap-3">
                {shortcuts.map((s) => (
                    <div
                        key={s.id}
                        className="flex justify-between items-center p-3 rounded-lg border border-[#273044] bg-[#111827] hover:bg-[#151b2e] transition-colors duration-200 shadow-sm"
                    >
                        <div className="min-w-0 flex-1 pr-2">
                            <div className="font-semibold text-xs text-slate-200">{s.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{s.description}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {recordingId === s.id ? (
                                <div
                                    ref={recordingRef}
                                    className="px-2 py-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-700 text-[11px] font-medium cursor-pointer select-none outline-none animate-pulse min-w-[75px] text-center focus:ring-1 focus:ring-indigo-500"
                                    tabIndex={0}
                                    onKeyDown={(e) => handleKeyDown(e, s)}
                                    onBlur={() => {
                                        console.log("[ShortcutSettings] Input blurred, cancelling recording");
                                        setRecordingId(null);
                                    }}
                                    autoFocus
                                >
                                    Press keys...
                                </div>
                            ) : (
                                <>
                                    <div
                                        onClick={() => {
                                            console.log("[ShortcutSettings] Clicked key combo. Entering recording mode for:", s.id);
                                            setRecordingId(s.id);
                                        }}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                        title="Click to change shortcut"
                                    >
                                        <KeyDisplay combo={s.currentCombo} />
                                    </div>
                                    {s.currentCombo && JSON.stringify(s.currentCombo) !== JSON.stringify(s.defaultCombo) && (
                                        <button
                                            onClick={() => handleReset(s)}
                                            className="px-2 py-0.5 rounded border border-[#273044] hover:bg-[#263047] text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-slate-500"
                                            title="Reset to default"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

