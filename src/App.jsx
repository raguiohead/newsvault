import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import ArticleGrid from './components/ArticleGrid.jsx'
import ArticleList from './components/ArticleList.jsx'
import ViewToggle from './components/ViewToggle.jsx'
import ArticleDrawer from './components/ArticleDrawer.jsx'

function getMonthYear(dateStr) {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

export default function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ category: '', author: '', language: '', period: '' })
  const [view, setView] = useState('grid')
  const [selected, setSelected] = useState(null)
  const [reindexing, setReindexing] = useState(false)
  const [reindexLog, setReindexLog] = useState('')

  // Fetch articles on mount
  const loadArticles = () => {
    setLoading(true)
    setError(null)
    fetch('/api/articles')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => { setArticles(data); setLoading(false) })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => { loadArticles() }, [])

  // Derived filter options
  const authors = useMemo(() => {
    const set = new Set(articles.map(a => a.author).filter(Boolean))
    return [...set].sort()
  }, [articles])

  const periods = useMemo(() => {
    const set = new Set(articles.map(a => getMonthYear(a.date)).filter(Boolean))
    // Sort descending by original date
    const withDate = articles.reduce((acc, a) => {
      const k = getMonthYear(a.date)
      if (k && !acc[k]) acc[k] = a.date
      return acc
    }, {})
    return [...set].sort((a, b) => (withDate[b] || '').localeCompare(withDate[a] || ''))
  }, [articles])

  // Filter + search logic
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return articles.filter(a => {
      if (filters.category && a.category !== filters.category) return false
      if (filters.author && a.author !== filters.author) return false
      if (filters.language && a.language !== filters.language) return false
      if (filters.period && getMonthYear(a.date) !== filters.period) return false
      if (q) {
        const haystack = `${a.title} ${a.summary} ${(a.tags || []).join(' ')}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [articles, filters, query])

  // Reindex handler
  const handleReindex = () => {
    setReindexing(true)
    setReindexLog('')
    const es = new EventSource('/api/reindex')

    // EventSource only supports GET via browser; use fetch for POST SSE
    es.close()

    fetch('/api/reindex', { method: 'POST' })
      .then(r => {
        const reader = r.body.getReader()
        const decoder = new TextDecoder()
        const pump = () => reader.read().then(({ done, value }) => {
          if (done) {
            setReindexing(false)
            loadArticles()
            return
          }
          const text = decoder.decode(value)
          const lines = text.split('\n').filter(l => l.startsWith('data: '))
          lines.forEach(l => {
            const msg = l.slice(6)
            if (msg.startsWith('DONE:')) {
              setReindexing(false)
              loadArticles()
            } else {
              setReindexLog(prev => prev + msg)
            }
          })
          pump()
        })
        pump()
      })
      .catch(() => setReindexing(false))
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="state-container" style={{ paddingTop: '40vh' }}>
        <div className="state-icon"><span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>
        <p className="state-desc" style={{ marginTop: 20 }}>Carregando sua biblioteca…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-container" style={{ paddingTop: '30vh' }}>
        <div className="state-icon">⚠️</div>
        <h2 className="state-title">Não foi possível carregar os artigos</h2>
        <p className="state-desc">
          Execute <code style={{ color: '#6c63ff' }}>npm run parse</code> para gerar o índice de artigos.<br />
          Erro: {error}
        </p>
        <button className="reindex-btn" onClick={handleReindex} disabled={reindexing}>
          {reindexing ? <><span className="spinner" /> Indexando…</> : '↺ Gerar índice agora'}
        </button>
        {reindexLog && (
          <pre style={{
            marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.4)',
            borderRadius: 8, fontSize: 12, color: '#a0a0b8',
            maxHeight: 200, overflow: 'auto', textAlign: 'left',
          }}>
            {reindexLog}
          </pre>
        )}
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Header
        query={query}
        onQueryChange={setQuery}
        count={filtered.length}
        total={articles.length}
        onReindex={handleReindex}
        reindexing={reindexing}
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        authors={authors}
        periods={periods}
      />

      <main className="main-content">
        <ViewToggle view={view} onChange={setView} />

        {view === 'grid'
          ? <ArticleGrid articles={filtered} onSelect={setSelected} />
          : <ArticleList articles={filtered} onSelect={setSelected} />
        }
      </main>

      {selected && (
        <ArticleDrawer
          article={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
