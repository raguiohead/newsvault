const ALL_CATEGORIES = [
  { label: 'Todas', value: '', emoji: '✨', color: '#6c63ff' },
  { label: 'Saúde & Fitness',      value: 'Saúde & Fitness',      emoji: '🏋️', color: '#f97316' },
  { label: 'Produtividade',        value: 'Produtividade',        emoji: '🧠', color: '#8b5cf6' },
  { label: 'Negócios & Carreira',  value: 'Negócios & Carreira',  emoji: '💼', color: '#06b6d4' },
  { label: 'Dados & Tecnologia',   value: 'Dados & Tecnologia',   emoji: '📊', color: '#10b981' },
  { label: 'Escrita & Criatividade', value: 'Escrita & Criatividade', emoji: '✍️', color: '#f59e0b' },
  { label: 'Livros & Aprendizado', value: 'Livros & Aprendizado', emoji: '📚', color: '#ec4899' },
  { label: 'Vida & Filosofia',     value: 'Vida & Filosofia',     emoji: '🌱', color: '#84cc16' },
  { label: 'Geral',                value: 'Geral',                emoji: '📄', color: '#6b7280' },
]

export default function FilterBar({ filters, onChange, authors, periods }) {
  const { category, author, language, period } = filters

  const set = (key, val) => onChange({ ...filters, [key]: val })

  const clearAll = () => onChange({ category: '', author: '', language: '', period: '' })

  const hasFilters = category || author || language || period

  return (
    <nav className="filterbar" aria-label="Filtros">
      {/* Category pills */}
      <div className="filter-pills">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`filter-pill${category === cat.value ? ' active' : ''}`}
            style={category === cat.value
              ? { backgroundColor: cat.color + '22', borderColor: cat.color, color: cat.color }
              : {}}
            onClick={() => set('category', cat.value)}
            aria-pressed={category === cat.value}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="filter-divider" />

      {/* Secondary selects */}
      <div className="filter-selects">
        <select
          id="filter-author"
          className="filter-select"
          value={author}
          onChange={e => set('author', e.target.value)}
          aria-label="Filtrar por autor"
        >
          <option value="">Todos os autores</option>
          {authors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          id="filter-language"
          className="filter-select"
          value={language}
          onChange={e => set('language', e.target.value)}
          aria-label="Filtrar por idioma"
        >
          <option value="">Todos os idiomas</option>
          <option value="pt-BR">🇧🇷 Português</option>
          <option value="en">🇺🇸 English</option>
        </select>

        <select
          id="filter-period"
          className="filter-select"
          value={period}
          onChange={e => set('period', e.target.value)}
          aria-label="Filtrar por período"
        >
          <option value="">Todo o período</option>
          {periods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {hasFilters && (
        <button className="clear-filters-btn" onClick={clearAll}>
          ✕ Limpar filtros
        </button>
      )}
    </nav>
  )
}
