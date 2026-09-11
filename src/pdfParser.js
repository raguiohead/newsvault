import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export async function parsePdfFile(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + ' \n'
  }
  
  // Basic heuristic for extracting metadata
  const lines = fullText.split('\n').filter(l => l.trim().length > 0)
  const title = file.name.replace(/\.pdf$/i, '')
  
  // Extracting possible date
  const dateMatch = fullText.match(/\b\d{4}-\d{2}-\d{2}\b/) || fullText.match(/\b\d{2}\/\d{2}\/\d{4}\b/)
  let date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0]
  if (date.includes('/')) {
    const [d, m, y] = date.split('/')
    date = `${y}-${m}-${d}`
  }

  // Generate a random ID
  const id = crypto.randomUUID()
  
  // Create summary
  const summary = fullText.slice(0, 300).trim() + '...'

  // Detect category based on content
  const lowerText = fullText.toLowerCase()
  let category = 'Geral'
  let categoryEmoji = '📄'
  let categoryColor = '#64748b'

  if (lowerText.match(/saúde|fitness|treino|dieta|nutrição|exercício|médico/)) {
    category = 'Saúde & Fitness'
    categoryEmoji = '🏋️'
    categoryColor = '#ea580c'
  } else if (lowerText.match(/produtividade|hábito|foco|gestão de tempo|rotina/)) {
    category = 'Produtividade'
    categoryEmoji = '🧠'
    categoryColor = '#6366f1'
  } else if (lowerText.match(/negócio|carreira|empresa|startup|venda|mercado|trabalho/)) {
    category = 'Negócios & Carreira'
    categoryEmoji = '💼'
    categoryColor = '#0284c7'
  } else if (lowerText.match(/dados|tecnologia|programação|software|ia|inteligência artificial|tech/)) {
    category = 'Dados & Tecnologia'
    categoryEmoji = '📊'
    categoryColor = '#059669'
  } else if (lowerText.match(/escrita|criatividade|arte|design|criação/)) {
    category = 'Escrita & Criatividade'
    categoryEmoji = '✍️'
    categoryColor = '#d97706'
  } else if (lowerText.match(/livro|aprendizado|estudo|curso|leitura|conhecimento/)) {
    category = 'Livros & Aprendizado'
    categoryEmoji = '📚'
    categoryColor = '#db2777'
  } else if (lowerText.match(/vida|filosofia|reflexão|estoicismo|psicologia/)) {
    category = 'Vida & Filosofia'
    categoryEmoji = '🌱'
    categoryColor = '#16a34a'
  }
  
  return {
    id,
    title,
    date,
    author: 'Você (Local)', // Fallback author
    category,
    categoryEmoji,
    categoryColor,
    language: 'PT',
    summary,
    content: fullText,
    fileName: file.name
  }
}
