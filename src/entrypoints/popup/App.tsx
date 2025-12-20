import { Button } from '@/components/ui/button';
import { usePopup } from './popup.store';

export default function App() {
  const { currentTab, links, tag, setTag, saveLink, status } = usePopup();

  console.log(currentTab, links, tag, saveLink, status, "❤️")

  if (!currentTab) {
    return <div style={{ padding: '1rem' }}>Loading current tab...</div>;
  }

  // Check if current URL is already saved
  const isAlreadySaved = links.some(l => l.url === currentTab.url);
  console.log(isAlreadySaved, "😭")

  return (
    <div style={{ padding: '16px', width: '300px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Link Smasher</h2>

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
            <Button>Click Me</Button>
            {status === 'error' && (
              <div style={{ marginTop: '8px', color: 'red', fontSize: '12px' }}>
                Error saving link. Please try again.
              </div>
            )}
          </div>

        )}
      </div>

      <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
        Saved from this site ({links.length})
      </h3>

      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {links.length === 0 ? (
          <div style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>No links saved yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {links.map(link => (
              <li key={link.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#333', fontSize: '13px', display: 'block' }}>
                  {link.title || link.url}
                </a>
                {link.tags.length > 0 && (
                  link.tags.map((t, i) => (
                    <span key={i} style={{ display: 'inline-block', background: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#555', marginTop: '4px', marginRight: '4px' }}>
                      #{t}
                    </span>
                  ))
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          style={{ background: 'none', border: 'none', color: '#007bff', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Manage All Links
        </button>
      </div>
    </div>
  );
}
