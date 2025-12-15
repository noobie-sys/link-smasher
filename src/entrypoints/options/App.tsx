import React, { useRef } from 'react';
import { useOptions } from './options.store';

export default function App() {
    const { links, isLoading, deleteLink, exportData, importData } = useOptions();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            importData(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ margin: 0 }}>Link Smasher Manager</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={exportData}
                        style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Export JSON
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Import JSON
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            {isLoading ? (
                <div>Loading links...</div>
            ) : links.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
                    No links saved. Go collect some!
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                        <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Date</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Title / URL</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Tags</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.map(link => (
                            <tr key={link.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px', fontSize: '12px', whiteSpace: 'nowrap', color: '#666' }}>
                                    {new Date(link.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{link.title}</div>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#007bff' }}>
                                        {link.url}
                                    </a>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {link.tags.map(tag => (
                                        <span key={tag} style={{ background: '#eee', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button
                                        onClick={() => deleteLink(link.id)}
                                        style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
