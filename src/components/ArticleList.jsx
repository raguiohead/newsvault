import { useState, useEffect, useRef } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`
}

function ArticleListItem({ article, onSelect, onDelete, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="article-list-item"
      onClick={() => onSelect(article)}
      tabIndex={0}
      role="listitem button"
      aria-label={`Abrir: ${article.title}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(article)}
    >
      <span
        className="list-category-dot"
        style={{ background: article.categoryColor }}
        title={article.category}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
        <span
          ref={titleRef}
          className="list-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const newTitle = e.target.textContent.trim();
            if (newTitle && newTitle !== article.title && onUpdate) {
              onUpdate({ ...article, title: newTitle });
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.target.blur();
            }
          }}
          style={{ flex: 1, outline: 'none' }}
        >
          {article.title}
        </span>
      </div>
      <span className="list-author">{article.author}</span>
      <span className="list-date">{formatDate(article.date)}</span>
      
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          title="Opções"
          aria-label="Opções do artigo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>

        {showMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '120px',
            zIndex: 10
          }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(false);
                if (titleRef.current) {
                  titleRef.current.focus();
                  const selection = window.getSelection();
                  const range = document.createRange();
                  range.selectNodeContents(titleRef.current);
                  range.collapse(false);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-primary)',
                padding: '8px 12px', textAlign: 'left', cursor: 'pointer', fontSize: '13px',
                borderRadius: 'var(--radius-sm)'
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--bg-surface)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Editar Título
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(false);
                setTimeout(() => onDelete?.(article.id), 10);
              }}
              style={{
                background: 'transparent', border: 'none', color: '#f43f5e',
                padding: '8px 12px', textAlign: 'left', cursor: 'pointer', fontSize: '13px',
                borderRadius: 'var(--radius-sm)'
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--bg-surface)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleList({ articles, onSelect, onDelete, onUpdate }) {
  const listRef = useRef(null)

  useEffect(() => {
    const items = listRef.current?.querySelectorAll('.article-list-item')
    if (!items || items.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(i => { i.style.opacity = 1 })
      return
    }

    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        items,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.04,
          clearProps: 'transform',
        }
      )
    })
  }, [articles])

  if (articles.length === 0) {
    return (
      <div className="state-container">
        <div className="state-icon">🔍</div>
        <h3 className="state-title">Nenhum artigo encontrado</h3>
        <p className="state-desc">Tente ajustar os filtros ou a busca.</p>
      </div>
    )
  }

  return (
    <div className="article-list" ref={listRef} role="list" aria-label="Artigos">
      {articles.map(article => (
        <ArticleListItem
          key={article.id}
          article={article}
          onSelect={onSelect}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
