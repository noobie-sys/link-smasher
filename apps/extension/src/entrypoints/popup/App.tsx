import { usePopup } from './popup.store';
import { useState } from 'react';
import { ShortcutSettings } from './components/ShortcutSettings';

export default function App() {
  const { currentTab, links, tag, setTag, notes, setNotes, saveLink, status } = usePopup();
  const [view, setView] = useState<'home' | 'settings'>('home');

  const MAX_NOTES_LENGTH = 200;


  if (!currentTab) {
    return <div style={{ padding: '1rem' }}>Loading current tab...</div>;
  }

  // Check if current URL is already saved
  const isAlreadySaved = links.some(l => l.url === currentTab.url);

  return (
    <div style={{ padding: '16px', width: '300px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '16px', margin: 0 }}>Link Smasher</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setView('home')}
            style={{
              background: view === 'home' ? '#eee' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: view === 'home' ? 'bold' : 'normal'
            }}
          >
            Home
          </button>
          <button
            onClick={() => setView('settings')}
            style={{
              background: view === 'settings' ? '#eee' : 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: view === 'settings' ? 'bold' : 'normal'
            }}
          >
            Settings
          </button>
        </div>
      </div>

      {view === 'settings' ? (
        <ShortcutSettings />
      ) : (
        <>
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>CURRENT TAB</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTab.hostname}
            </div>

            {isAlreadySaved ? (
              <div style={{ marginTop: '8px', color: 'green', fontSize: '13px' }}>✓ This page is saved</div>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}
                  />
                  <button
                    onClick={saveLink}
                    disabled={status === 'saving'}
                    style={{
                      padding: '6px 12px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
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
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '12px'
                  }}
                />
                <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', textAlign: 'right' }}>
                  {notes.length}/{MAX_NOTES_LENGTH}
                </div>
                {status === 'error' && (
                  <div style={{ marginTop: '8px', color: 'red', fontSize: '12px' }}>
                    Error saving link. Please try again.
                  </div>
                )}
              </div>

            )}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', margin: 0, borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
              Saved from this site ({links.length})
            </h3>
          </div>

          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              transition: 'opacity 0.2s ease'
            }}
          >
            {links.length === 0 ? (
              <div style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>No links saved yet.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((link, index) => (
                  <li
                    key={link.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
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
                          color: '#333',
                          fontSize: '13px',
                          display: 'block',
                          transition: 'color 0.2s ease',
                          flex: 1,
                          marginRight: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                      >
                        {link.title || link.url}
                      </a>
                      <button
                        onClick={async () => {
                          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                          if (tab?.id) {
                            chrome.tabs.sendMessage(tab.id, { type: 'EDIT_LINK', link });
                            window.close(); // Close popup
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          fontSize: '10px',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          // border: '1px solid #eee',
                          // borderRadius: '4px'
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    {link.notes && (
                      <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                        {link.notes}
                      </div>
                    )}
                    {link.tags.length > 0 && (
                      <div>
                        {link.tags.map((t, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'inline-block',
                              background: '#eee',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              color: '#555',
                              marginRight: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#007bff';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#eee';
                              e.currentTarget.style.color = '#555';
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

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              onClick={() => chrome.runtime.openOptionsPage()}
              style={{ background: 'none', border: 'none', color: '#007bff', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Manage All Links
            </button>
          </div>
        </>
      )}
    </div>
  );
}
