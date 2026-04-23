import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

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
  
  return {
    id,
    title,
    date,
    author: 'Você (Local)', // Fallback author
    category: 'Newsletter',
    language: 'PT',
    summary,
    content: fullText,
    fileName: file.name
  }
}
