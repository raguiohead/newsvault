import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PDFS_DIR = path.join(__dirname, '..', 'pdfs')
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data.json')

// ── Author detection map ──────────────────────────────────────────────────────
const AUTHOR_MAP = [
  { pattern: /3-2-1/i,                    author: 'James Clear' },
  { pattern: /4_minute_fridays|dan_go/i,  author: 'Dan Go' },
  { pattern: /boletim_pirado/i,            author: 'Boletim Pirado' },
  { pattern: /seedance/i,                  author: 'Seedance' },
  { pattern: /5_tópicos_de_terça/i,        author: '5 Tópicos de Terça' },
  { pattern: /newsletter_-_/i,             author: 'Newsletter BR Tech' },
  { pattern: /diário_de_bordo/i,           author: 'Diário de Bordo' },
  { pattern: /mesa_dos_magos/i,            author: 'Mesa dos Magos' },
]

// ── Category keyword map ──────────────────────────────────────────────────────
const CATEGORY_MAP = [
  {
    category: 'Saúde & Fitness',
    emoji: '🏋️',
    color: '#f97316',
    keywords: ['fat', 'muscle', 'health', 'ozempic', 'nutrition', 'metabol', 'sleep',
      'workout', 'creatine', 'visceral', 'longevity', 'saúde', 'emagrecer',
      'fitness', 'exercise', 'body', 'weight', 'diet', 'protein', 'aging',
      'supplement', 'vo2', 'heart', 'blood', 'breakfast', 'food', 'carb'],
  },
  {
    category: 'Produtividade',
    emoji: '🧠',
    color: '#8b5cf6',
    keywords: ['focus', 'habit', 'attention', 'system', 'procrastin', 'learn',
      'deep work', 'atenção', 'produtividade', 'aprender', 'skill', 'memory',
      'reading', 'thinking', 'decision', 'mental', 'clarity', 'obsession',
      'motivation', 'discipline', 'planning', 'goals', 'performance'],
  },
  {
    category: 'Negócios & Carreira',
    emoji: '💼',
    color: '#06b6d4',
    keywords: ['business', 'startup', 'career', 'brand', 'income', 'freelance',
      'money', 'negócio', 'carreira', 'empreend', 'revenue', 'customer',
      'marketing', 'sales', 'product', 'founder', 'company', 'work',
      'job', 'professional', 'expert', 'content creator', 'newsletter'],
  },
  {
    category: 'Dados & Tecnologia',
    emoji: '📊',
    color: '#10b981',
    keywords: ['data', 'analytics', 'sql', 'python', ' ia ', 'inteligência artificial',
      'governança', 'dados', 'tecnologia', 'linux', 'ai', 'machine learning',
      'software', 'código', 'developer', 'programming', 'tech', 'digital',
      'algorithm', 'model', 'pipeline', 'dashboard', 'database'],
  },
  {
    category: 'Escrita & Criatividade',
    emoji: '✍️',
    color: '#f59e0b',
    keywords: ['writing', 'essay', 'newsletter', 'creative', 'design', 'escrita',
      'criatividade', 'write', 'writer', 'story', 'article', 'publish',
      'content', 'creative', 'art', 'expression', 'voice', 'style'],
  },
  {
    category: 'Livros & Aprendizado',
    emoji: '📚',
    color: '#ec4899',
    keywords: ['livro', 'book', 'leitura', 'recomend', 'reading list', 'library',
      'author', 'chapter', 'literature', 'knowledge', 'education', 'course',
      'lesson', 'teach', 'study', 'learn from'],
  },
  {
    category: 'Vida & Filosofia',
    emoji: '🌱',
    color: '#84cc16',
    keywords: ['life', 'purpose', 'meaning', 'simpl', 'valor', 'felicidade', 'vida',
      'escolha', 'philosophy', 'identity', 'happiness', 'values', 'freedom',
      'gratitude', 'mindset', 'perspective', 'change', 'growth', 'self',
      'authentic', 'solitude', 'relationship', 'family', 'love'],
  },
]

// ── PT-BR stopwords for language detection ────────────────────────────────────
const PT_STOPWORDS = ['que', 'para', 'com', 'uma', 'não', 'por', 'mais', 'como',
  'mas', 'seu', 'sua', 'você', 'isso', 'essa', 'este', 'esta', 'são', 'tem',
  'pelo', 'pela', 'foi', 'dos', 'das', 'nos', 'nas', 'quando', 'sobre']

// ── Utilities ─────────────────────────────────────────────────────────────────

function extractDateFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

function inferAuthor(filename) {
  const normalized = filename.replace(/\s/g, '_')
  for (const { pattern, author } of AUTHOR_MAP) {
    if (pattern.test(normalized)) return author
  }
  return 'Desconhecido'
}

function detectLanguage(text) {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/)
  const ptCount = words.filter(w => PT_STOPWORDS.includes(w)).length
  return ptCount > 8 ? 'pt-BR' : 'en'
}

function categorize(text) {
  const lower = text.toLowerCase()
  let best = { category: 'Geral', emoji: '📄', color: '#6b7280', score: 0 }

  for (const cat of CATEGORY_MAP) {
    const score = cat.keywords.reduce((acc, kw) => {
      const regex = new RegExp(kw, 'gi')
      const matches = lower.match(regex)
      return acc + (matches ? matches.length : 0)
    }, 0)
    if (score > best.score) {
      best = { category: cat.category, emoji: cat.emoji, color: cat.color, score }
    }
  }
  return { category: best.category, emoji: best.emoji, color: best.color }
}

function extractTags(text, language) {
  const lower = text.toLowerCase()
  const stopwords = new Set([
    // English stopwords
    'the', 'and', 'for', 'that', 'this', 'with', 'you', 'are', 'have', 'not',
    'from', 'your', 'but', 'can', 'all', 'when', 'what', 'how', 'its', 'was',
    'they', 'will', 'been', 'more', 'than', 'like', 'just', 'into', 'out',
    'there', 'their', 'about', 'would', 'which', 'one', 'some', 'time',
    'here', 'also', 'very', 'only', 'over', 'after', 'before', 'then',
    'make', 'made', 'most', 'much', 'does', 'dont', 'every', 'even',
    'read', 'want', 'need', 'know', 'good', 'well', 'right', 'best',
    'stop', 'next', 'back', 'because', 'paid', 'email', 'subject',
    'substack', 'forwarded', 'subscribe', 'newsletter', 'comments',
    'likes', 'reply', 'share', 'send', 'click', 'link', 'view',
    'date', 'week', 'month', 'year', 'today', 'tomorrow', 'yesterday',
    'thing', 'things', 'people', 'person', 'something', 'anything',
    'first', 'second', 'third', 'really', 'still', 'same', 'each',
    'high', 'take', 'gets', 'done', 'them', 'come', 'keep', 'feel',
    'help', 'work', 'works', 'start', 'never', 'always', 'often',
    // PT-BR stopwords extra
    ...PT_STOPWORDS,
    'que', 'para', 'uma', 'não', 'por', 'mais', 'como', 'mas', 'seu',
    'sua', 'você', 'isso', 'essa', 'este', 'são', 'tem', 'pelo', 'pela',
    'aqui', 'esse', 'qual', 'muito', 'todo', 'toda', 'todos', 'todas',
    'também', 'ainda', 'então', 'quando', 'onde', 'quem', 'porque',
    'sobre', 'entre', 'antes', 'depois', 'durante', 'através', 'cada',
    'mesmo', 'mesma', 'sempre', 'nunca', 'agora', 'hoje', 'aqui',
  ])

  const words = lower.match(/\b[a-záàãâéêíóôõúüçñ]{4,}\b/g) || []
  const freq = {}
  for (const w of words) {
    if (!stopwords.has(w)) freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w)
}

function cleanText(rawText) {
  const lines = rawText.split('\n').map(line => line.trim())
  const filtered = []
  let skipMode = false

  for (const line of lines) {
    // Skip very short lines
    if (line.length < 4) continue
    // Skip URLs
    if (/^https?:\/\//i.test(line)) continue
    // Skip email addresses
    if (/^\S+@\S+\.\S+$/.test(line)) continue
    // Skip separator lines
    if (/^[=\-_*•]{3,}$/.test(line)) continue
    // Skip email header boilerplate
    if (/^(From|To|Date|Subject|Forwarded|CC|BCC):/i.test(line)) continue
    // Skip newsletter boilerplate
    if (/unsubscribe|manage preference|view in browser|click here|forward this|subscribe here|follow me|powered by|copyright|all rights reserved|privacy policy|terms of service/i.test(line)) continue
    // Skip social share lines
    if (/^(share|like|comment|reply|tweet|retweet|follow us|connect with|find us on)\b/i.test(line)) continue
    // Skip lines that are just email addresses embedded in text
    if (/\S+@\S+\.\S+/.test(line) && line.length < 80) continue
    // Skip lines with only numbers/punctuation
    if (/^[\d\s.,;:!?()\-]+$/.test(line)) continue

    filtered.push(line)
  }

  return filtered.join('\n')
}

function buildSummary(cleanedText) {
  const paragraphs = cleanedText.split(/\n{2,}/).map(p => p.replace(/\n/g, ' ').trim())
  const useful = paragraphs.filter(p => p.length > 80)
  const raw = useful.slice(0, 3).join(' ')
  return raw.length > 300 ? raw.slice(0, 297) + '…' : raw
}

function buildFullHtml(cleanedText) {
  const lines = cleanedText.split('\n')
  const htmlLines = []
  let inParagraph = false
  let paragraphBuffer = []

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(' ').trim()
      if (text) htmlLines.push(`<p>${escapeHtml(text)}</p>`)
      paragraphBuffer = []
      inParagraph = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushParagraph()
      continue
    }
    // Detect heading: short line (<80 chars), no period at end, mostly words
    const isHeading = trimmed.length < 80 &&
      !trimmed.endsWith('.') &&
      !trimmed.endsWith(',') &&
      /^[A-ZÁÀÃÂÉÊÍÓÔÕÚ]/.test(trimmed) &&
      paragraphBuffer.length === 0

    if (isHeading && trimmed.length < 60) {
      flushParagraph()
      htmlLines.push(`<h2>${escapeHtml(trimmed)}</h2>`)
    } else {
      inParagraph = true
      paragraphBuffer.push(trimmed)
    }
  }
  flushParagraph()

  return htmlLines.join('\n')
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function formatTitle(filename) {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')  // remove date prefix
    .replace(/\.pdf$/i, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Lazy import pdf-parse (CommonJS module in ESM context)
  const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js')

  const files = fs.readdirSync(PDFS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'))
  console.log(`📚 Found ${files.length} PDFs. Parsing...`)

  const articles = []
  let done = 0

  for (const filename of files) {
    const filepath = path.join(PDFS_DIR, filename)
    const date = extractDateFromFilename(filename)
    const author = inferAuthor(filename)
    const title = formatTitle(filename)

    let rawText = ''
    let parseError = false

    try {
      const buffer = fs.readFileSync(filepath)
      const data = await pdfParse(buffer, { max: 0 })
      rawText = data.text || ''
    } catch (err) {
      console.warn(`  ⚠️  Could not parse: ${filename}`)
      parseError = true
    }

    const cleaned = parseError ? '' : cleanText(rawText)
    const language = cleaned ? detectLanguage(cleaned) : 'en'
    const { category, emoji, color } = categorize(cleaned + ' ' + filename.toLowerCase())
    const tags = cleaned ? extractTags(cleaned, language) : []
    const summary = cleaned ? buildSummary(cleaned) : 'Conteúdo não disponível (PDF baseado em imagem).'
    const fullHtml = cleaned ? buildFullHtml(cleaned) : '<p><em>Conteúdo não disponível. Este PDF pode ser baseado em imagem.</em></p>'
    const wordCount = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0

    articles.push({
      id: slugify(filename.replace(/\.pdf$/i, '')),
      filename,
      title,
      author,
      date: date || '2025-01-01',
      language,
      category,
      categoryEmoji: emoji,
      categoryColor: color,
      tags,
      summary,
      fullHtml,
      wordCount,
    })

    done++
    if (done % 20 === 0) console.log(`  ✓ ${done}/${files.length} processed...`)
  }

  // Sort by date desc
  articles.sort((a, b) => b.date.localeCompare(a.date))

  // Ensure public dir exists
  const publicDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articles, null, 2), 'utf-8')
  console.log(`\n✅ Done! ${articles.length} articles saved to public/data.json`)

  // Print category summary
  const catCount = {}
  for (const a of articles) catCount[a.category] = (catCount[a.category] || 0) + 1
  console.log('\n📊 Categories:')
  Object.entries(catCount).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
    console.log(`  ${c}: ${n}`)
  })
}

main().catch(err => { console.error(err); process.exit(1) })
