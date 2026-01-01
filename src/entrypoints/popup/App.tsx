import { usePopup } from './popup.store';
import { useState, useMemo } from 'react';
import { ShortcutSettings } from './components/ShortcutSettings';
import { Select } from '@/components/ui/select';

type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'tags-asc' | 'tags-desc';

export default function App() {
  const { currentTab, links, tag, setTag, saveLink, status } = usePopup();
  const [view, setView] = useState<'home' | 'settings'>('home');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');


  if (!currentTab) {
    return <div style={{ padding: '1rem' }}>Loading current tab...</div>;
  }

  // Check if current URL is already saved
  const isAlreadySaved = links.some(l => l.url === currentTab.url);

  // Sort links based on selected option
  const sortedLinks = useMemo(() => {
    const linksCopy = [...links];
    
    switch (sortBy) {
      case 'name-asc':
        return linksCopy.sort((a, b) => {
          const titleA = (a.title || a.url).toLowerCase();
          const titleB = (b.title || b.url).toLowerCase();
          return titleA.localeCompare(titleB);
        });
      
      case 'name-desc':
        return linksCopy.sort((a, b) => {
          const titleA = (a.title || a.url).toLowerCase();
          const titleB = (b.title || b.url).toLowerCase();
          return titleB.localeCompare(titleA);
        });
      
      case 'date-asc':
        return linksCopy.sort((a, b) => a.createdAt - b.createdAt);
      
      case 'date-desc':
        return linksCopy.sort((a, b) => b.createdAt - a.createdAt);
      
      case 'tags-asc':
        return linksCopy.sort((a, b) => {
          const tagsA = a.tags.join(',').toLowerCase();
          const tagsB = b.tags.join(',').toLowerCase();
          if (tagsA === '' && tagsB === '') return 0;
          if (tagsA === '') return 1;
          if (tagsB === '') return -1;
          return tagsA.localeCompare(tagsB);
        });
      
      case 'tags-desc':
        return linksCopy.sort((a, b) => {
          const tagsA = a.tags.join(',').toLowerCase();
          const tagsB = b.tags.join(',').toLowerCase();
          if (tagsA === '' && tagsB === '') return 0;
          if (tagsA === '') return 1;
          if (tagsB === '') return -1;
          return tagsB.localeCompare(tagsA);
        });
      
      default:
        return linksCopy;
    }
  }, [links, sortBy]);

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'tags-asc', label: 'Tags (A-Z)' },
    { value: 'tags-desc', label: 'Tags (Z-A)' },
  ];

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
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
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
                    cursor: 'pointer'
                  }}
                >
                  {status === 'saving' ? '...' : 'Save'}
                </button>
                {status === 'error' && (
                  <div style={{ marginTop: '8px', color: 'red', fontSize: '12px' }}>
                    Error saving link. Please try again.
                  </div>
                )}
              </div>

            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', margin: 0, borderBottom: '1px solid #eee', paddingBottom: '4px', flex: 1 }}>
              Saved from this site ({links.length})
            </h3>
            {links.length > 0 && (
              <div style={{ width: '140px', marginLeft: '8px' }}>
                <Select
                  value={sortBy}
                  onChange={(value) => setSortBy(value as SortOption)}
                  options={sortOptions}
                  placeholder="Sort by..."
                />
              </div>
            )}
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
                {sortedLinks.map((link, index) => (
                  <li 
                    key={link.id} 
                    style={{ 
                      padding: '8px 0', 
                      borderBottom: '1px solid #f0f0f0',
                      animation: `fadeIn 0.3s ease ${index * 0.03}s both`
                    }}
                  >
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        textDecoration: 'none', 
                        color: '#333', 
                        fontSize: '13px', 
                        display: 'block',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                    >
                      {link.title || link.url}
                    </a>
                    {link.tags.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
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
