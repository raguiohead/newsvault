export default function Header({ query, onQueryChange, count, total, onOpenAbout, onOpenSettings, activeTab, onTabChange }) {
  return (
    <header className="header" role="banner">
      <a className="header-logo" href="/" aria-label="Página Inicial do NewsVault" onClick={(e) => { e.preventDefault(); onTabChange?.('library'); }}>
        <div className="header-logo-icon" aria-hidden="true" style={{ color: 'var(--text-secondary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8"/>
            <path d="M15 18h-5"/>
            <path d="M10 6h8v4h-8V6Z"/>
          </svg>
        </div>
        <span className="header-logo-text">NewsVault</span>
      </a>

      {activeTab === 'library' && (
        <div className="header-search">
          <span className="header-search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            id="search-input"
            type="search"
            placeholder="Buscar por título, resumo ou tag..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            aria-label="Buscar artigos por texto"
          />
        </div>
      )}

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button 
            className={`view-toggle-btn ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => onTabChange?.('library')}
            style={{ padding: '4px 12px', background: activeTab === 'library' ? 'var(--primary)' : 'transparent', color: activeTab === 'library' ? '#fff' : 'inherit', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Biblioteca
          </button>
          <button 
            className={`view-toggle-btn ${activeTab === 'outlook' ? 'active' : ''}`}
            onClick={() => onTabChange?.('outlook')}
            style={{ padding: '4px 12px', background: activeTab === 'outlook' ? 'var(--primary)' : 'transparent', color: activeTab === 'outlook' ? '#fff' : 'inherit', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            📬 Outlook
          </button>
          <button 
            className={`view-toggle-btn ${activeTab === 'eml' ? 'active' : ''}`}
            onClick={() => onTabChange?.('eml')}
            style={{ padding: '4px 12px', background: activeTab === 'eml' ? 'var(--primary)' : 'transparent', color: activeTab === 'eml' ? '#fff' : 'inherit', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Converter EML
          </button>
        </div>

        {activeTab === 'library' && (
          <span className="header-count" aria-live="polite">
            <strong>{count}</strong> de {total} artigos
          </span>
        )}
        <button 
          onClick={onOpenAbout}
          className="view-toggle-btn"
          style={{ padding: '6px 12px' }}
        >
          Sobre
        </button>
        <button 
          onClick={onOpenSettings}
          className="view-toggle-btn"
          aria-label="Configurações"
          style={{ padding: '6px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  )
}
