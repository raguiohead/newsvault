import { useEffect, useRef } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`
}

export default function ArticleList({ articles, onSelect }) {
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
        <div
          key={article.id}
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
          <span className="list-title">{article.title}</span>
          <span className="list-author">{article.author}</span>
          <span className="list-date">{formatDate(article.date)}</span>
          <span className="list-lang">
            {article.language === 'pt-BR' ? 'PT' : 'EN'}
          </span>
        </div>
      ))}
    </div>
  )
}
