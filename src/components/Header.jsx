export default function Header({ query, onQueryChange, count, total, onReindex, reindexing }) {
  return (
    <header className="header">
      <a className="header-logo" href="/">
        <div className="header-logo-icon">📰</div>
        <span className="header-logo-text">NewsVault</span>
      </a>

      <div className="header-search">
        <span className="header-search-icon">
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
          aria-label="Buscar artigos"
        />
      </div>

      <span className="header-count">
        <strong>{count}</strong> de {total} artigos
      </span>

      <button
        className="reindex-btn"
        onClick={onReindex}
        disabled={reindexing}
        title="Re-parsear os PDFs da pasta"
        style={{ padding: '7px 14px', fontSize: '12px', marginLeft: '4px' }}
      >
        {reindexing ? <span className="spinner" /> : '↺'}
        {reindexing ? 'Indexando…' : 'Reindexar'}
      </button>
    </header>
  )
}
