import { usePopup } from './popup.store';
import { useState } from 'react';
import { ShortcutSettings } from './components/ShortcutSettings';

export default function App() {
  const {
    currentTab,
    links,
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
  const [view, setView] = useState<'home' | 'settings'>('home');

  const MAX_NOTES_LENGTH = 200;

  if (isLoadingAuth) {
    return (
      <div style={{
        padding: '24px',
        width: '320px',
        height: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#121212',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div className="spinner" style={{
          width: '28px',
          height: '28px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #6366F1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Checking session...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        padding: '24px',
        width: '320px',
        background: '#121212',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Glow effect header */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366F1, #EC4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '16px',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
        }}>
          🍰
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>
          Welcome to Link Crust
        </h2>
        
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 24px 0', lineHeight: '1.5' }}>
          Save, tag, and organize your favorite bookmarks directly to your vault. Let's get you set up first!
        </p>

        <button
          onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/login' })}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            transition: 'transform 0.2s, filter 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
        >
          Sign in on Web Portal
        </button>

        <div style={{ marginTop: '16px', fontSize: '11px', color: '#4B5563' }}>
          Link Smasher Extensions Suite v1.4.2
        </div>
      </div>
    );
  }

  if (!currentTab) {
    return (
      <div style={{
        padding: '24px',
        width: '320px',
        background: '#121212',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center'
      }}>
        Retrieving active page information...
      </div>
    );
  }

  const isAlreadySaved = links.some(l => l.url === currentTab.url);

  return (
    <div style={{
      padding: '16px',
      width: '320px',
      background: '#121212',
      color: '#F9FAFB',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Top Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🍰</span>
          <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #6366F1, #A5B4FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Link Crust
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#1E1E1E', padding: '2px', borderRadius: '6px' }}>
          <button
            onClick={() => setView('home')}
            style={{
              background: view === 'home' ? '#2D2D2D' : 'transparent',
              border: 'none',
              color: view === 'home' ? '#FFF' : '#9CA3AF',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            Home
          </button>
          <button
            onClick={() => setView('settings')}
            style={{
              background: view === 'settings' ? '#2D2D2D' : 'transparent',
              border: 'none',
              color: view === 'settings' ? '#FFF' : '#9CA3AF',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            Settings
          </button>
        </div>
      </div>

      {view === 'settings' ? (
        <ShortcutSettings />
      ) : currentTab.hostname === "system-page" ? (
        <div style={{
          padding: '20px',
          background: '#1E1E1E',
          borderRadius: '12px',
          border: '1px solid #2A2A2A',
          textAlign: 'center',
          marginTop: '12px'
        }}>
          <span style={{ fontSize: '28px', display: 'block', marginBottom: '12px' }}>🔒</span>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#FFF', margin: '0 0 6px 0' }}>
            System Page Restricted
          </h3>
          <p style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: '1.4', margin: 0 }}>
            Link Crust is active and ready, but vault integration is restricted on internal browser pages (like <code style={{ color: '#818CF8' }}>chrome://</code> or empty tabs).
          </p>
          <p style={{ fontSize: '11px', color: '#818CF8', fontWeight: 500, marginTop: '12px', cursor: 'pointer' }} onClick={() => chrome.tabs.create({ url: 'https://google.com' })}>
            Try opening google.com ↗
          </p>
        </div>
      ) : (
        <>
          {/* Current Page Header */}
          <div style={{ marginBottom: '16px', padding: '12px', background: '#1E1E1E', borderRadius: '10px', border: '1px solid #2A2A2A' }}>
            <div style={{ fontSize: '9px', color: '#6B7280', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>ACTIVE DOMAIN</div>
            <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#F3F4F6' }}>
              {currentTab.hostname}
            </div>

            {isAlreadySaved ? (
              <div style={{ marginTop: '10px', color: '#10B981', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>✓</span> This page is saved in your vault
              </div>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Tags (tag1, tag2...)"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #2D2D2D',
                      background: '#121212',
                      color: 'white',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={saveLink}
                    disabled={status === 'saving'}
                    style={{
                      padding: '8px 12px',
                      background: '#6366F1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {status === 'saving' ? '...' : 'Save'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Notes (max 200 chars)"
                  value={notes}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, MAX_NOTES_LENGTH);
                    setNotes(value);
                  }}
                  maxLength={MAX_NOTES_LENGTH}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #2D2D2D',
                    background: '#121212',
                    color: 'white',
                    fontSize: '11px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ fontSize: '9px', color: '#4B5563', marginTop: '4px', textAlign: 'right' }}>
                  {notes.length}/{MAX_NOTES_LENGTH}
                </div>
                {status === 'error' && (
                  <div style={{ marginTop: '8px', color: '#EF4444', fontSize: '11px', fontWeight: 500 }}>
                    Error saving link. Please try again.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subtitle */}
          <div style={{ marginBottom: '8px' }}>
            <h3 style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, borderBottom: '1px solid #222', paddingBottom: '6px', fontWeight: 600 }}>
              Saved from this site ({links.length})
            </h3>
          </div>

          {/* Saved List */}
          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              transition: 'opacity 0.2s ease'
            }}
          >
            {links.length === 0 ? (
              <div style={{ color: '#4B5563', fontSize: '11px', fontStyle: 'italic', padding: '12px 0' }}>
                No links saved from this domain yet.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((link, index) => (
                  <li
                    key={link.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #1C1C1C',
                      animation: `fadeIn 0.3s ease ${index * 0.03}s both`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          color: '#E5E7EB',
                          fontSize: '12px',
                          display: 'block',
                          transition: 'color 0.2s ease',
                          flex: 1,
                          marginRight: '8px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#818CF8'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#E5E7EB'}
                      >
                        {link.title || link.url}
                      </a>
                      <button
                        onClick={async () => {
                          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                          if (tab?.id) {
                            chrome.tabs.sendMessage(tab.id, { type: 'EDIT_LINK', link });
                            window.close();
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6366F1',
                          fontSize: '10px',
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    {link.notes && (
                      <div style={{ fontSize: '10px', color: '#9CA3AF', fontStyle: 'italic' }}>
                        {link.notes}
                      </div>
                    )}
                    {link.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {link.tags.map((t, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'inline-block',
                              background: '#1F2937',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              color: '#9CA3AF',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#6366F1';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#1F2937';
                              e.currentTarget.style.color = '#9CA3AF';
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Manage Dashboard Button */}
          <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid #1E1E1E', paddingTop: '12px' }}>
            <button
              onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/dashboard' })}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366F1',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Go to Web Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
