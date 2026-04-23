import { useEffect, useRef } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return `${d} de ${months[parseInt(m, 10) - 1]} de ${y}`
}

export default function ArticleDrawer({ article, onClose }) {
  const panelRef = useRef(null)
  const overlayRef = useRef(null)

  // Animate in
  useEffect(() => {
    if (!article) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      if (panelRef.current) panelRef.current.style.transform = 'translateX(0)'
      return
    }

    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      )
      gsap.fromTo(
        panelRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      )
    })
  }, [article])

  // Close with animation
  const handleClose = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) { onClose(); return }

    import('gsap').then(({ gsap }) => {
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: onClose,
      })
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 })
    })
  }

  // ESC key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!article) return null

  const { title, author, date, category, categoryEmoji, categoryColor, language, fullHtml, wordCount } = article

  return (
    <div
      className="drawer-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) handleClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Artigo: ${title}`}
    >
      <div className="drawer-panel" ref={panelRef}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-top">
            <h1 className="drawer-title">{title}</h1>
            <button
              className="drawer-close-btn"
              onClick={handleClose}
              aria-label="Fechar artigo"
              title="Fechar (ESC)"
            >✕</button>
          </div>

          <div className="drawer-meta">
            <span
              className="drawer-meta-badge"
              style={{
                backgroundColor: categoryColor + '22',
                color: categoryColor,
                border: `1px solid ${categoryColor}44`,
              }}
            >
              {categoryEmoji} {category}
            </span>
            <span>·</span>
            <span>{author}</span>
            <span>·</span>
            <span>{formatDate(date)}</span>
            <span>·</span>
            <span>{language === 'pt-BR' ? '🇧🇷 PT' : '🇺🇸 EN'}</span>
            {wordCount > 0 && (
              <>
                <span>·</span>
                <span>~{Math.ceil(wordCount / 200)} min de leitura</span>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="drawer-body">
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: fullHtml }}
          />
        </div>
      </div>
    </div>
  )
}
