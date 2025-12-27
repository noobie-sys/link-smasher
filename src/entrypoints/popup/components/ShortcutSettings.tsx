import React, { useState, useEffect } from "react";
import { shortcutService } from "@/core/services/shortcut.service";
import { ShortcutDef, KeyCombo } from "@/shared/types/shortcut.types";

const KeyDisplay = ({ combo }: { combo?: KeyCombo }) => {
    if (!combo) return <span>None</span>;
    const parts = [];
    if (combo.metaKey) parts.push("⌘");
    if (combo.ctrlKey) parts.push("^");
    if (combo.altKey) parts.push("⌥");
    if (combo.shiftKey) parts.push("⇧");
    parts.push(combo.key.toUpperCase());
    return <kbd style={{
        background: "#eee",
        padding: "2px 6px",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "12px"
    }}>{parts.join("+")}</kbd>;
};

export function ShortcutSettings() {
    const [shortcuts, setShortcuts] = useState<ShortcutDef[]>([]);
    const [recordingId, setRecordingId] = useState<string | null>(null);

    useEffect(() => {
        loadShortcuts();
    }, []);

    const loadShortcuts = async () => {
        const list = await shortcutService.getShortcuts();
        setShortcuts(list);
    };

    const handleKeyDown = async (e: React.KeyboardEvent, shortcut: ShortcutDef) => {
        e.preventDefault();
        e.stopPropagation();

        // Ignore modifier-only keydowns
        if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return;

        const newCombo: KeyCombo = {
            key: e.key,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
        };

        try {
            await shortcutService.updateShortcut(shortcut.id, newCombo);
            await loadShortcuts();
            setRecordingId(null);
        } catch (err) {
            console.error("Failed to update shortcut", err);
        }
    };

    return (
        <div>
            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Keyboard Shortcuts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {shortcuts.map((s) => (
                    <div key={s.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        background: "#fafafa",
                        borderRadius: "6px",
                        border: "1px solid #eee"
                    }}>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: "13px" }}>{s.name}</div>
                            <div style={{ fontSize: "11px", color: "#666" }}>{s.description}</div>
                        </div>

                        {recordingId === s.id ? (
                            <div
                                style={{
                                    padding: "4px 8px",
                                    background: "#e3f2fd",
                                    border: "1px solid #2196f3",
                                    borderRadius: "4px",
                                    color: "#0d47a1",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    outline: "none",
                                    minWidth: "60px",
                                    textAlign: "center"
                                }}
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyDown(e, s)}
                                onBlur={() => setRecordingId(null)}
                                autoFocus
                            >
                                Recording...
                            </div>
                        ) : (
                            <div
                                onClick={() => setRecordingId(s.id)}
                                style={{ cursor: "pointer" }}
                                title="Click to edit"
                            >
                                <KeyDisplay combo={s.currentCombo} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
