import { useState, useRef, useEffect } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`
}

// ── Prompt Template (Prompt Engineering: Template System + System Prompt Design)
// Hierarchy: [Role/System] → [Task] → [Article Data] → [Output Format]

function stripHtml(html) {
  return (html || '')
    .replace(/<h2[^>]*>/gi, '\n\n## ')
    .replace(/<\/h2>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildPrompt({ title, author, category, categoryEmoji, fullHtml, content, tags, language, date }) {
  const lang = language === 'pt-BR' ? 'português' : 'inglês'
  const tagList = tags && tags.length > 0 ? tags.join(', ') : 'N/A'
  const dateStr = formatDate(date)
  const fullText = content || stripHtml(fullHtml)


  return `Você é um mentor especialista em síntese de conhecimento e aprendizado aplicado.

Analise o seguinte conteúdo de newsletter e responda de forma estruturada e didática.

## Contexto do Artigo
- **Título:** ${title}
- **Autor:** ${author}
- **Categoria:** ${categoryEmoji} ${category}
- **Idioma original:** ${lang}
- **Data:** ${dateStr}
- **Palavras-chave:** ${tagList}

## Conteúdo completo do artigo
${fullText}

---

## Sua tarefa — responda nas 3 seções abaixo:

### 1. 📖 Síntese Didática
Explique as ideias principais deste conteúdo em 4–6 pontos claros.
- Escreva como se estivesse explicando para alguém inteligente que nunca teve contato com o tema.
- Use linguagem direta, sem jargões desnecessários.
- Destaque o insight central que diferencia este conteúdo do óbvio.

### 2. ⚡ Aplicação Prática
Liste 3 ações concretas que posso implementar **esta semana** com base neste conteúdo.
- Cada ação deve ser específica, mensurável e realista.
- Indique o contexto ideal: vida pessoal, trabalho, aprendizado ou saúde.

### 3. 🔗 Conteúdos e Autores Relacionados
Sugira 4–5 recursos que aprofundam os temas deste artigo:
- Livros, autores, podcasts, artigos ou criadores de conteúdo.
- Para cada um, escreva uma linha explicando **por que** ele se conecta com este conteúdo.
- Priorize recursos que complementam (não apenas repetem) o que foi abordado aqui.`
}

// ── Copy Prompt Button
function CopyPromptButton({ article }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation() // Prevent card click from firing

    const prompt = buildPrompt(article)
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = prompt
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className={`copy-prompt-btn${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      title="Copiar prompt personalizado para IA"
      aria-label="Copiar prompt de síntese deste artigo"
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiado!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar Prompt
        </>
      )}
    </button>
  )
}

export default function ArticleCard({ article, onClick, onDelete, onUpdate }) {
  const { title, author, date, language, category, categoryEmoji, categoryColor, summary, tags } = article
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <article
      className="article-card"
      onClick={() => onClick(article)}
      tabIndex={0}
      role="button"
      aria-label={`Abrir artigo: ${title}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick(article)}
    >
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <span
          className="card-category-badge"
          style={{
            backgroundColor: categoryColor + '22',
            color: categoryColor,
            border: `1px solid ${categoryColor}44`,
          }}
        >
          <span>{categoryEmoji}</span>
          <span>{category}</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }} ref={menuRef}>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '2px',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 
          ref={titleRef}
          className="card-title"
          contentEditable
          suppressContentEditableWarning
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => {
            const newTitle = e.target.textContent.trim();
            if (newTitle && newTitle !== title && onUpdate) {
              onUpdate({ ...article, title: newTitle });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.target.blur();
            }
          }}
          style={{ flex: 1, margin: 0, outline: 'none' }}
        >
          {title}
        </h2>
      </div>

      <div className="card-meta">
        <span>{author}</span>
        <span className="card-meta-dot" />
        <span>{formatDate(date)}</span>
        {article.wordCount > 0 && (
          <>
            <span className="card-meta-dot" />
            <span>~{Math.ceil(article.wordCount / 200)} min</span>
          </>
        )}
      </div>

      <p className="card-summary">{summary}</p>

      {tags && tags.length > 0 && (
        <div className="card-tags">
          {tags.slice(0, 4).map(tag => (
            <span key={tag} className="card-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <CopyPromptButton article={article} />
        
        <span style={{ 
          color: 'var(--text-muted)', 
          fontSize: '13px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontWeight: '500',
          transition: 'color 0.2s',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Ver conteúdo
        </span>
      </div>
    </article>
  )
}
