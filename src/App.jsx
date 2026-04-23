import { useState, useEffect, useMemo, useRef } from 'react'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import ArticleGrid from './components/ArticleGrid.jsx'
import ArticleList from './components/ArticleList.jsx'
import ViewToggle from './components/ViewToggle.jsx'
import ArticleDrawer from './components/ArticleDrawer.jsx'
import { getArticles, addArticle } from './db.js'
import { parsePdfFile } from './pdfParser.js'

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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Fetch articles from IndexedDB
  const loadArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getArticles()
      setArticles(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadArticles() }, [])

  // Derived filter options
  const authors = useMemo(() => {
    const set = new Set(articles.map(a => a.author).filter(Boolean))
    return [...set].sort()
  }, [articles])

  const periods = useMemo(() => {
    const set = new Set(articles.map(a => getMonthYear(a.date)).filter(Boolean))
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

  // File Upload Logic
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    
    setUploading(true)
    try {
      for (const file of files) {
        if (file.type !== 'application/pdf') continue
        const parsedData = await parsePdfFile(file)
        await addArticle(parsedData)
      }
      await loadArticles()
    } catch (err) {
      console.error('Error parsing PDFs:', err)
      alert('Erro ao processar o arquivo PDF.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="state-container" style={{ paddingTop: '40vh' }} role="status" aria-live="polite">
        <div className="state-icon"><span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>
        <p className="state-desc" style={{ marginTop: 20 }}>Carregando sua biblioteca…</p>
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
        onReindex={() => fileInputRef.current?.click()}
        reindexing={uploading}
        isClientSide={true}
      />

      {/* Hidden file input for PDF upload */}
      <input 
        type="file" 
        multiple 
        accept="application/pdf" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileUpload}
        aria-label="Upload PDF files"
      />

      {articles.length > 0 ? (
        <>
          <FilterBar
            filters={filters}
            onChange={setFilters}
            authors={authors}
            periods={periods}
          />

          <main className="main-content">
            <div className="view-controls">
              <button 
                className="upload-btn" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Adicionar novos PDFs"
              >
                {uploading ? 'Processando...' : '+ Adicionar PDFs'}
              </button>
              <ViewToggle view={view} onChange={setView} />
            </div>

            {view === 'grid'
              ? <ArticleGrid articles={filtered} onSelect={setSelected} />
              : <ArticleList articles={filtered} onSelect={setSelected} />
            }
          </main>
        </>
      ) : (
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="state-container">
            <div className="state-icon">📄</div>
            <h2 className="state-title">Sua biblioteca está vazia</h2>
            <p className="state-desc">
              Adicione seus PDFs para começar a ler suas newsletters.<br />
              O processamento ocorre 100% no seu navegador!
            </p>
            <button className="upload-btn primary-btn mt-4" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <><span className="spinner" /> Processando…</> : '+ Adicionar seus PDFs'}
            </button>
          </div>
        </main>
      )}

      {selected && (
        <ArticleDrawer
          article={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
