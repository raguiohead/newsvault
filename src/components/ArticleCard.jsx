import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
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

function buildPrompt({ title, author, category, categoryEmoji, fullHtml, tags, language, date }) {
  const lang = language === 'pt-BR' ? 'português' : 'inglês'
  const tagList = tags && tags.length > 0 ? tags.join(', ') : 'N/A'
  const dateStr = formatDate(date)
  const fullText = stripHtml(fullHtml)

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
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copiado!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copiar Prompt
        </>
      )}
    </button>
  )
}

export default function ArticleCard({ article, onClick }) {
  const { title, author, date, language, category, categoryEmoji, categoryColor, summary, tags } = article

  return (
    <article
      className="article-card"
      onClick={() => onClick(article)}
      tabIndex={0}
      role="button"
      aria-label={`Abrir artigo: ${title}`}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick(article)}
    >
      <div className="card-header">
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
        <span className="card-lang-chip">
          {language === 'pt-BR' ? '🇧🇷 PT' : '🇺🇸 EN'}
        </span>
      </div>

      <h2 className="card-title">{title}</h2>

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

      <CopyPromptButton article={article} />
    </article>
  )
}
