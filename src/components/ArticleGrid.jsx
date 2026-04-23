import { useEffect, useRef } from 'react'
import ArticleCard from './ArticleCard.jsx'

export default function ArticleGrid({ articles, onSelect }) {
  const gridRef = useRef(null)
  const prevLength = useRef(0)

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.article-card')
    if (!cards || cards.length === 0) return

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach(c => { c.style.opacity = 1 })
      return
    }

    // Lazy-load GSAP
    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.07,
          clearProps: 'transform',
        }
      )
    })

    prevLength.current = cards.length
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
    <div className="article-grid" ref={gridRef} role="list" aria-label="Artigos">
      {articles.map(article => (
        <ArticleCard
          key={article.id}
          article={article}
          onClick={onSelect}
        />
      ))}
    </div>
  )
}
