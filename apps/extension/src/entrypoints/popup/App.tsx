import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Home,
  Link2,
  LogIn,
  Save,
  Settings,
  Tag,
} from "lucide-react";
import { usePopup } from "./popup.store";
import { ShortcutSettings } from "./components/ShortcutSettings";
import { BlacklistSettings } from "./components/BlacklistSettings";
import { Link } from "@/shared/types/common.types";
import { cn } from "@/lib/utils";

const WEB_APP_URL = "http://localhost:3000";
const MAX_NOTES_LENGTH = 200;

/**
 * Open a route of the web dashboard in a new browser tab or window.
 *
 * @param path - The path to append to `WEB_APP_URL` (e.g. `/dashboard` or `/login`) to form the destination URL.
 */
function openWeb(path: string) {
  if (chrome.tabs) {
    chrome.tabs.create({ url: `${WEB_APP_URL}${path}` });
  } else {
    window.open(`${WEB_APP_URL}${path}`, "_blank");
  }
}

/**
 * Renders a list row for a saved link showing its title (or URL), hostname, optional notes, and up to four tags, with an optional edit action.
 *
 * When the edit action is enabled, clicking the edit button sends an `EDIT_LINK` message containing the `link` to the active tab and closes the popup.
 *
 * @param link - Saved link object (expects `url`, `title`, `hostname`, `notes`, and `tags`)
 * @param canEdit - Enables the edit button and its behavior when `true`; disables the button and changes its tooltip when `false`
 * @returns A JSX element representing the list item for the given `link`
 */
function LinkRow({
  link,
  canEdit,
}: {
  link: Link;
  canEdit: boolean;
}) {
  const openEditor = async () => {
    const tabs = chrome.tabs ? await chrome.tabs.query({ active: true, currentWindow: true }) : [];
    const tab = tabs?.[0];
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "EDIT_LINK", link });
      window.close();
    }
  };

  return (
    <li className="py-2.5 border-b border-[#273044] flex flex-col gap-1.5 list-none last:border-b-0">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded bg-[#1e293b] text-indigo-400 flex items-center justify-center shrink-0">
          <Link2 size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || link.url}
            className="text-slate-100 text-xs font-semibold hover:text-indigo-400 no-underline leading-snug block truncate outline-none focus:text-indigo-400"
          >
            {link.title || link.url}
          </a>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {link.hostname}
          </div>
        </div>
        <button
          onClick={openEditor}
          disabled={!canEdit}
          title={canEdit ? "Edit link" : "Open a normal webpage to edit"}
          className={cn(
            "border-none bg-transparent p-0.5 leading-none transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500 rounded",
            canEdit ? "text-indigo-400 hover:text-indigo-300" : "text-slate-600 cursor-not-allowed"
          )}
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {link.notes && (
        <div className="text-[10px] text-slate-300 leading-relaxed pl-9 break-words">
          {link.notes}
        </div>
      )}

      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-9">
          {link.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="bg-[#202a40] text-slate-300 rounded-full px-2 py-0.5 text-[9px] border border-[#273044]/30"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

/**
 * Popup UI for the extension that displays the active page, local saved links, and settings.
 *
 * Renders the header (branding and view switch), a main area that shows either settings or the
 * active page card with save controls and a list of recent local links, and a footer with
 * authentication-dependent actions (open dashboard or login).
 *
 * @returns The React element for the extension popup UI.
 */
export default function App() {
  const {
    currentTab,
    links,
    allLinks,
    tag,
    setTag,
    notes,
    setNotes,
    saveLink,
    status,
    isAuthenticated,
    isLoadingAuth,
    user,
  } = usePopup();
  const [view, setView] = useState<"home" | "settings">("home");

  if (isLoadingAuth) {
    return (
      <div className="w-[340px] min-h-[360px] p-6 bg-[#0b1020] text-slate-100 flex flex-col items-center justify-center gap-3 font-sans box-border">
        <div className="w-8 h-8 border-[3px] border-[#273044] border-t-indigo-400 rounded-full animate-spin" />
        <div className="text-slate-400 text-xs">Loading local vault...</div>
      </div>
    );
  }

  if (!currentTab) {
    return (
      <div className="w-[340px] p-6 bg-[#0b1020] text-slate-100 text-center font-sans box-border">
        Retrieving active page information...
      </div>
    );
  }

  const isSystemPage = currentTab.hostname === "system-page";
  const isAlreadySaved = !isSystemPage && allLinks.some((l) => l.url === currentTab.url);
  const recentLinks = allLinks.slice(0, 12);

  return (
    <div className="w-[340px] max-h-[580px] overflow-hidden bg-[#0b1020] text-slate-100 font-sans flex flex-col box-border border border-[#273044] rounded-xl">
      <header className="px-3.5 pt-3.5 pb-2.5 border-b border-[#273044] bg-gradient-to-b from-[#111827] to-[#0b1020]">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Link2 size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 text-sm font-bold tracking-tight text-white leading-tight">Link Crust</h1>
              <p className="m-0 mt-0.5 text-[10px] text-slate-400 truncate leading-none">
                {isAuthenticated ? user?.email || "Cloud sync active" : "Local vault mode"}
              </p>
            </div>
          </div>
          <nav className="flex gap-1 p-1 bg-[#0f172a] border border-[#273044] rounded-lg shrink-0">
            <button
              onClick={() => setView("home")}
              title="Home"
              className={cn(
                "w-8 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer outline-none",
                view === "home"
                  ? "bg-[#263047] text-slate-100 border border-[#374151]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#151b2e] border border-transparent"
              )}
            >
              <Home size={14} />
            </button>
            <button
              onClick={() => setView("settings")}
              title="Settings"
              className={cn(
                "w-8 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer outline-none",
                view === "settings"
                  ? "bg-[#263047] text-slate-100 border border-[#374151]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#151b2e] border border-transparent"
              )}
            >
              <Settings size={14} />
            </button>
          </nav>
        </div>
      </header>

      <main className="px-3.5 pt-3 overflow-y-auto flex-1 scrollbar-thin">
        {view === "settings" ? (
          <div className="py-1 pb-4">
            <ShortcutSettings />
            <BlacklistSettings />
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            <section className="p-3 rounded-lg border border-[#273044] bg-[#111827] shadow-md bg-opacity-70">
              <div className="text-slate-500 text-[9px] font-extrabold tracking-wider uppercase mb-1">
                Active page
              </div>
              <div className="text-slate-100 text-xs font-bold truncate">
                {isSystemPage ? "Browser system page" : currentTab.hostname}
              </div>

              {isSystemPage ? (
                <p className="m-0 mt-2 text-slate-400 text-[10px] leading-relaxed">
                  Saving is unavailable on internal browser pages, but your local links
                  are still shown below.
                </p>
              ) : isAlreadySaved ? (
                <div className="mt-2.5 text-emerald-400 text-[10px] font-semibold flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/40 py-1.5 px-2.5 rounded">
                  <CheckCircle2 size={13} className="shrink-0" />
                  This page is saved locally
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <label className="relative flex-1 block">
                      <Tag size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Tags (comma separated)"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        className="w-full bg-[#0a0f1d] text-slate-100 text-xs border border-[#273044] rounded-lg pl-8 pr-2.5 py-1.5 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-slate-600"
                      />
                    </label>
                    <button
                      onClick={saveLink}
                      disabled={status === "saving"}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold text-xs rounded-lg px-3 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <Save size={13} />
                      {status === "saving" ? "Saving" : "Save"}
                    </button>
                  </div>
                  <label className="relative block">
                    <FileText size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Add short note..."
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))
                      }
                      maxLength={MAX_NOTES_LENGTH}
                      className="w-full bg-[#0a0f1d] text-slate-100 text-xs border border-[#273044] rounded-lg pl-8 pr-2.5 py-1.5 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-slate-600"
                    />
                  </label>
                  <div
                    className={cn(
                      "flex justify-between text-[9px] font-medium px-0.5",
                      status === "error" ? "text-red-400" : "text-slate-500"
                    )}
                  >
                    <span>
                      {status === "success"
                        ? "Saved locally"
                        : status === "error"
                          ? "Could not save. Try again."
                          : "Saved links sync after login"}
                    </span>
                    <span>
                      {notes.length}/{MAX_NOTES_LENGTH}
                    </span>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <h2 className="m-0 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  Local saved links ({allLinks.length})
                </h2>
                {!isSystemPage && (
                  <span className="text-slate-500 text-[10px] font-medium">
                    {links.length} from this site
                  </span>
                )}
              </div>

              <div className="border border-[#273044] bg-[#111827] rounded-lg max-h-[236px] overflow-y-auto px-3 shadow-inner bg-opacity-50">
                {recentLinks.length === 0 ? (
                  <div className="py-6 px-1.5 text-slate-500 text-xs text-center leading-relaxed font-medium">
                    No local links yet. Save this page to start your vault!
                  </div>
                ) : (
                  <ul className="list-none p-0 m-0">
                    {recentLinks.map((link) => (
                      <LinkRow
                        key={link.id}
                        link={link}
                        canEdit={!isSystemPage}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="p-3.5 border-t border-[#273044] bg-[#0a0f1d] mt-auto">
        {isAuthenticated ? (
          <button
            onClick={() => openWeb("/dashboard")}
            className="w-full flex items-center justify-center gap-2 border border-[#273044] hover:border-slate-600 bg-[#111827] hover:bg-[#151b2e] text-slate-200 hover:text-white rounded-lg py-2 px-2.5 text-xs font-semibold cursor-pointer transition-colors duration-200 outline-none focus:ring-1 focus:ring-slate-500"
          >
            Open web dashboard
            <ExternalLink size={13} />
          </button>
        ) : (
          <div
            role="alert"
            className="border border-amber-900/40 bg-amber-950/10 rounded-lg p-2.5 flex items-start gap-2.5"
          >
            <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-slate-200 text-[11px] font-bold leading-normal">
                Local links only
              </div>
              <div className="text-slate-400 text-[10px] leading-relaxed mt-0.5">
                Login to sync your links.
              </div>
            </div>
            <button
              onClick={() => openWeb("/login")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded px-2.5 py-1.5 text-[10px] flex items-center gap-1 cursor-pointer transition-colors duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 shrink-0"
            >
              <LogIn size={12} />
              Login
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

