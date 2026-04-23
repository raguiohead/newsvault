export default function ViewToggle({ view, onChange }) {
  return (
    <div className="view-controls" role="group" aria-label="Modo de visualização">
      <button
        id="view-grid-btn"
        className={`view-toggle-btn${view === 'grid' ? ' active' : ''}`}
        onClick={() => onChange('grid')}
        aria-pressed={view === 'grid'}
        title="Visualização em grid"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="8" height="8" rx="1.5"/>
          <rect x="13" y="3" width="8" height="8" rx="1.5"/>
          <rect x="3" y="13" width="8" height="8" rx="1.5"/>
          <rect x="13" y="13" width="8" height="8" rx="1.5"/>
        </svg>
        Grid
      </button>
      <button
        id="view-list-btn"
        className={`view-toggle-btn${view === 'list' ? ' active' : ''}`}
        onClick={() => onChange('list')}
        aria-pressed={view === 'list'}
        title="Visualização em lista"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        Lista
      </button>
    </div>
  )
}
