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
import { Link } from "@/shared/types/common.types";

const WEB_APP_URL = "http://localhost:3000";
const MAX_NOTES_LENGTH = 200;

const colors = {
  bg: "#0B1020",
  panel: "#111827",
  panelSoft: "#151B2E",
  border: "#273044",
  text: "#F8FAFC",
  muted: "#94A3B8",
  subtle: "#64748B",
  brand: "#818CF8",
  brandStrong: "#6366F1",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
};

function openWeb(path: string) {
  chrome.tabs.create({ url: `${WEB_APP_URL}${path}` });
}

function iconButtonStyle(active: boolean): React.CSSProperties {
  return {
    width: "32px",
    height: "28px",
    borderRadius: "7px",
    border: "1px solid transparent",
    background: active ? "#263047" : "transparent",
    color: active ? colors.text : colors.muted,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
}

function LinkRow({
  link,
  canEdit,
}: {
  link: Link;
  canEdit: boolean;
}) {
  const openEditor = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "EDIT_LINK", link });
      window.close();
    }
  };

  return (
    <li
      style={{
        padding: "10px 0",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: "#1E293B",
            color: colors.brand,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <Link2 size={14} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || link.url}
            style={{
              color: colors.text,
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 650,
              lineHeight: 1.35,
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {link.title || link.url}
          </a>
          <div
            style={{
              color: colors.subtle,
              fontSize: "10px",
              marginTop: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {link.hostname}
          </div>
        </div>
        <button
          onClick={openEditor}
          disabled={!canEdit}
          title={canEdit ? "Edit link" : "Open a normal webpage to edit"}
          style={{
            border: "none",
            background: "transparent",
            color: canEdit ? colors.brand : colors.subtle,
            cursor: canEdit ? "pointer" : "not-allowed",
            padding: "3px",
            lineHeight: 0,
          }}
        >
          <ExternalLink size={13} />
        </button>
      </div>

      {link.notes && (
        <div
          style={{
            color: colors.muted,
            fontSize: "10px",
            lineHeight: 1.35,
            paddingLeft: "36px",
          }}
        >
          {link.notes}
        </div>
      )}

      {link.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            paddingLeft: "36px",
          }}
        >
          {link.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              style={{
                background: "#202A40",
                color: "#CBD5E1",
                borderRadius: "999px",
                padding: "2px 6px",
                fontSize: "9px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

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
      <div
        style={{
          width: "340px",
          minHeight: "360px",
          padding: "24px",
          background: colors.bg,
          color: colors.text,
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: `3px solid ${colors.border}`,
            borderTopColor: colors.brand,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ color: colors.muted, fontSize: "12px" }}>
          Loading local vault...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!currentTab) {
    return (
      <div
        style={{
          width: "340px",
          padding: "24px",
          background: colors.bg,
          color: colors.text,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        Retrieving active page information...
      </div>
    );
  }

  const isSystemPage = currentTab.hostname === "system-page";
  const isAlreadySaved = !isSystemPage && allLinks.some((l) => l.url === currentTab.url);
  const recentLinks = allLinks.slice(0, 12);

  return (
    <div
      style={{
        width: "340px",
        maxHeight: "580px",
        overflow: "hidden",
        background: colors.bg,
        color: colors.text,
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "14px 14px 10px",
          borderBottom: `1px solid ${colors.border}`,
          background: "linear-gradient(180deg, #111827 0%, #0B1020 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #6366F1, #14B8A6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(99, 102, 241, 0.24)",
            }}
          >
            <Link2 size={18} color="#FFFFFF" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "15px", lineHeight: 1.2 }}>
              Link Crust
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                color: colors.muted,
                fontSize: "10px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {isAuthenticated ? user?.email || "Cloud sync active" : "Local vault mode"}
            </p>
          </div>
          <nav
            style={{
              display: "flex",
              gap: "4px",
              padding: "3px",
              background: "#0F172A",
              border: `1px solid ${colors.border}`,
              borderRadius: "9px",
            }}
          >
            <button
              onClick={() => setView("home")}
              title="Home"
              style={iconButtonStyle(view === "home")}
            >
              <Home size={14} />
            </button>
            <button
              onClick={() => setView("settings")}
              title="Settings"
              style={iconButtonStyle(view === "settings")}
            >
              <Settings size={14} />
            </button>
          </nav>
        </div>
      </header>

      <main
        style={{
          padding: "12px 14px 0",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {view === "settings" ? (
          <ShortcutSettings />
        ) : (
          <>
            <section
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  color: colors.subtle,
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                Active page
              </div>
              <div
                style={{
                  color: colors.text,
                  fontSize: "13px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isSystemPage ? "Browser system page" : currentTab.hostname}
              </div>

              {isSystemPage ? (
                <p
                  style={{
                    margin: "8px 0 0",
                    color: colors.muted,
                    fontSize: "11px",
                    lineHeight: 1.45,
                  }}
                >
                  Saving is unavailable on internal browser pages, but your local links
                  are still shown below.
                </p>
              ) : isAlreadySaved ? (
                <div
                  style={{
                    marginTop: "10px",
                    color: colors.success,
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: 650,
                  }}
                >
                  <CheckCircle2 size={14} />
                  This page is saved locally
                </div>
              ) : (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <label style={{ position: "relative", flex: 1 }}>
                      <Tag
                        size={13}
                        style={{
                          position: "absolute",
                          left: "9px",
                          top: "9px",
                          color: colors.subtle,
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Tags"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "8px 8px 8px 28px",
                          borderRadius: "8px",
                          border: `1px solid ${colors.border}`,
                          background: colors.bg,
                          color: colors.text,
                          fontSize: "11px",
                          outline: "none",
                        }}
                      />
                    </label>
                    <button
                      onClick={saveLink}
                      disabled={status === "saving"}
                      style={{
                        border: "none",
                        borderRadius: "8px",
                        padding: "0 12px",
                        background:
                          status === "saving" ? "#475569" : colors.brandStrong,
                        color: "#FFFFFF",
                        fontWeight: 750,
                        fontSize: "11px",
                        cursor: status === "saving" ? "default" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Save size={13} />
                      {status === "saving" ? "Saving" : "Save"}
                    </button>
                  </div>
                  <label style={{ position: "relative", display: "block" }}>
                    <FileText
                      size={13}
                      style={{
                        position: "absolute",
                        left: "9px",
                        top: "9px",
                        color: colors.subtle,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Notes"
                      value={notes}
                      onChange={(e) =>
                        setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))
                      }
                      maxLength={MAX_NOTES_LENGTH}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "8px 8px 8px 28px",
                        borderRadius: "8px",
                        border: `1px solid ${colors.border}`,
                        background: colors.bg,
                        color: colors.text,
                        fontSize: "11px",
                        outline: "none",
                      }}
                    />
                  </label>
                  <div
                    style={{
                      marginTop: "5px",
                      display: "flex",
                      justifyContent: "space-between",
                      color: status === "error" ? colors.error : colors.subtle,
                      fontSize: "9px",
                    }}
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

            <section>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: colors.text,
                    fontSize: "12px",
                    fontWeight: 750,
                  }}
                >
                  Local saved links ({allLinks.length})
                </h2>
                {!isSystemPage && (
                  <span style={{ color: colors.subtle, fontSize: "10px" }}>
                    {links.length} from this site
                  </span>
                )}
              </div>

              <div
                style={{
                  borderRadius: "10px",
                  border: `1px solid ${colors.border}`,
                  background: colors.panelSoft,
                  maxHeight: "236px",
                  overflowY: "auto",
                  padding: "0 10px",
                }}
              >
                {recentLinks.length === 0 ? (
                  <div
                    style={{
                      padding: "18px 6px",
                      color: colors.muted,
                      fontSize: "11px",
                      lineHeight: 1.45,
                      textAlign: "center",
                    }}
                  >
                    No local links yet. Save the current page to start your vault.
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
          </>
        )}
      </main>

      <footer
        style={{
          padding: "12px 14px 14px",
          borderTop: `1px solid ${colors.border}`,
          background: "#0A0F1D",
        }}
      >
        {isAuthenticated ? (
          <button
            onClick={() => openWeb("/dashboard")}
            style={{
              width: "100%",
              border: `1px solid ${colors.border}`,
              borderRadius: "9px",
              background: colors.panel,
              color: colors.text,
              padding: "9px 10px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "7px",
            }}
          >
            Open web dashboard
            <ExternalLink size={13} />
          </button>
        ) : (
          <div
            role="alert"
            style={{
              border: "1px solid rgba(251, 191, 36, 0.32)",
              background: "rgba(251, 191, 36, 0.08)",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              gap: "9px",
              alignItems: "flex-start",
            }}
          >
            <AlertCircle size={16} color={colors.warning} style={{ flex: "0 0 auto" }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  color: colors.text,
                  fontSize: "11px",
                  fontWeight: 750,
                  lineHeight: 1.35,
                }}
              >
                You are viewing local links only.
              </div>
              <div
                style={{
                  color: colors.muted,
                  fontSize: "10px",
                  lineHeight: 1.4,
                  marginTop: "2px",
                }}
              >
                Login to sync saved links across devices.
              </div>
            </div>
            <button
              onClick={() => openWeb("/login")}
              style={{
                border: "none",
                borderRadius: "7px",
                background: colors.brandStrong,
                color: "#FFFFFF",
                padding: "7px 9px",
                fontSize: "10px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
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
