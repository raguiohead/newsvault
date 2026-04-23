export default function Header({ query, onQueryChange, count, total }) {
  return (
    <header className="header" role="banner">
      <a className="header-logo" href="/" aria-label="Página Inicial do NewsVault">
        <div className="header-logo-icon" aria-hidden="true">📰</div>
        <span className="header-logo-text">NewsVault</span>
      </a>

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

      <span className="header-count" aria-live="polite">
        <strong>{count}</strong> de {total} artigos
      </span>
    </header>
  )
}
