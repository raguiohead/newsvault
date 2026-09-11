import { useState, useEffect, useMemo, useRef } from 'react'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import ArticleGrid from './components/ArticleGrid.jsx'
import ArticleList from './components/ArticleList.jsx'
import ViewToggle from './components/ViewToggle.jsx'
import ArticleDrawer from './components/ArticleDrawer.jsx'
import AboutModal from './components/AboutModal.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import EmlConverterTab from './components/EmlConverterTab.jsx'
import OutlookSyncTab from './components/OutlookSyncTab.jsx'
import { getArticles, addArticle, deleteArticle, clearArticles } from './db.js'
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
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [bg, setBg] = useState(() => localStorage.getItem('bg') || 'default')
  const [activeTab, setActiveTab] = useState('library')
  const [sortOrder, setSortOrder] = useState('desc')
  const fileInputRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-bg', bg)
    localStorage.setItem('bg', bg)
  }, [bg])

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
  const activeCategories = useMemo(() => {
    const set = new Set(articles.map(a => a.category).filter(Boolean))
    return [...set]
  }, [articles])

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
    let results = articles.filter(a => {
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

    results.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return results
  }, [articles, filters, query, sortOrder])

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

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este PDF?')) return
    await deleteArticle(id)
    if (selected?.id === id) setSelected(null)
    await loadArticles()
  }

  const handleUpdate = async (updatedArticle) => {
    await addArticle(updatedArticle)
    await loadArticles()
  }

  const handleClearDatabase = async () => {
    await clearArticles()
    await loadArticles()
    setSelected(null)
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
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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

      {activeTab === 'outlook' ? (
        <OutlookSyncTab onConverted={() => {
          loadArticles()
          setActiveTab('library')
        }} />
      ) : activeTab === 'eml' ? (
        <EmlConverterTab onConverted={() => {
          loadArticles()
          setActiveTab('library')
        }} />
      ) : articles.length > 0 ? (
        <>
          <FilterBar
            filters={filters}
            onChange={setFilters}
            authors={authors}
            periods={periods}
            activeCategories={activeCategories}
          />

          <main className="main-content">
            <div className="view-controls">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  className="upload-btn primary-btn" 
                  onClick={() => setActiveTab('outlook')}
                  aria-label="Sincronizar do Outlook"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  📬 Sincronizar Outlook
                </button>
                <button 
                  className="upload-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Adicionar novos PDFs"
                >
                  {uploading ? 'Processando...' : '+ Adicionar PDFs'}
                </button>
              </div>
              
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    outline: 'none'
                  }}
                  aria-label="Ordenar por data"
                >
                  <option value="desc">Mais recentes</option>
                  <option value="asc">Mais antigos</option>
                </select>
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>

            {view === 'grid'
              ? <ArticleGrid articles={filtered} onSelect={setSelected} onDelete={handleDelete} onUpdate={handleUpdate} />
              : <ArticleList articles={filtered} onSelect={setSelected} onDelete={handleDelete} onUpdate={handleUpdate} />
            }
          </main>
        </>
      ) : (
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="state-container">
            <div className="state-icon">📬</div>
            <h2 className="state-title">Sua biblioteca está vazia</h2>
            <p className="state-desc">
              Sincronize suas newsletters diretamente do Outlook ou adicione seus PDFs locais.<br />
              O processamento ocorre de forma rápida e segura!
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              <button className="upload-btn primary-btn" onClick={() => setActiveTab('outlook')}>
                📬 Sincronizar do Outlook
              </button>
              <button className="upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <><span className="spinner" /> Processando…</> : '+ Adicionar PDFs'}
              </button>
            </div>
          </div>
        </main>
      )}

      {selected && (
        <ArticleDrawer
          article={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          onUpdate={(updated) => { handleUpdate(updated); setSelected(updated) }}
        />
      )}

      {isAboutOpen && (
        <AboutModal onClose={() => setIsAboutOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          theme={theme}
          setTheme={setTheme}
          bg={bg}
          setBg={setBg}
          onClearDatabase={handleClearDatabase}
        />
      )}
    </div>
  )
}
