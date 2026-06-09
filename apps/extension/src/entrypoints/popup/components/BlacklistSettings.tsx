import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { STORAGE_KEYS } from "@/shared/constants/storage.keys";

/**
 * Renders a settings UI for managing the hidden sites blacklist.
 *
 * Loads the blacklist from `chrome.storage.local` on mount, displays either an empty-state message or a scrollable list of blacklisted domains, and lets the user restore a domain which updates both storage and local component state.
 *
 * @returns The settings UI for viewing and restoring blacklisted domains.
 */
export function BlacklistSettings() {
  const [blacklist, setBlacklist] = useState<string[]>([]);

  useEffect(() => {
    loadBlacklist();
  }, []);

  const loadBlacklist = async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const list = (result[STORAGE_KEYS.BLACKLIST] as string[]) || [];
      setBlacklist(list);
    } catch (err) {
      console.error("[BlacklistSettings] Failed to load blacklist:", err);
    }
  };

  const handleRemove = async (domain: string) => {
    try {
      const updatedList = blacklist.filter((d) => d !== domain);
      await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updatedList });
      setBlacklist(updatedList);
    } catch (err) {
      console.error("[BlacklistSettings] Failed to update blacklist:", err);
    }
  };

  return (
    <div className="space-y-4 mt-6 border-t border-[#273044] pt-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Hidden Sites Blacklist
      </h3>
      <p className="text-[10px] text-slate-400 leading-normal">
        Remove websites from this list to restore the floating bookmark icon on those domains.
      </p>

      {blacklist.length === 0 ? (
        <div className="text-center py-6 px-3 rounded-lg border border-dashed border-[#273044] text-slate-500 text-xs font-medium">
          No hidden sites. Hover over the bookmark icon on any page and click the hide button to add it here.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-0.5 scrollbar-thin">
          {blacklist.map((domain) => (
            <div
              key={domain}
              className="flex justify-between items-center p-2.5 rounded-lg border border-[#273044] bg-[#111827] hover:bg-[#151b2e] transition-colors duration-200 shadow-sm"
            >
              <span className="font-semibold text-xs text-slate-200 truncate pr-2 max-w-[200px]" title={domain}>
                {domain}
              </span>
              <button
                onClick={() => handleRemove(domain)}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#273044] hover:bg-[#263047] text-[10px] font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-rose-500"
                title={`Show bookmark icon on ${domain}`}
              >
                <Trash2 size={12} />
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
