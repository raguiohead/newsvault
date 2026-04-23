import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { execFile } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const app = express()
app.use(cors())
app.use(express.json())

// Serve static public files (data.json, etc.)
app.use('/public', express.static(path.join(ROOT, 'public')))

// Serve PDFs
app.use('/pdfs', express.static(path.join(ROOT, 'pdfs')))

// API: get all articles
app.get('/api/articles', (req, res) => {
  const dataPath = path.join(ROOT, 'public', 'data.json')
  res.sendFile(dataPath, err => {
    if (err) {
      res.status(404).json({
        error: 'data.json not found. Run "npm run parse" first.'
      })
    }
  })
})

// API: reindex (re-run parse script)
app.post('/api/reindex', (req, res) => {
  const scriptPath = path.join(ROOT, 'scripts', 'parse-pdfs.js')
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })

  const child = execFile('node', [scriptPath], { cwd: ROOT })

  child.stdout.on('data', data => res.write(`data: ${data}\n\n`))
  child.stderr.on('data', data => res.write(`data: ${data}\n\n`))
  child.on('close', code => {
    res.write(`data: DONE:${code}\n\n`)
    res.end()
  })
})

// Serve Vite build in production
app.use(express.static(path.join(ROOT, 'dist')))
app.get('*', (req, res) => {
  const index = path.join(ROOT, 'dist', 'index.html')
  res.sendFile(index, err => {
    if (err) res.status(404).send('Run "npm run build" to generate the frontend.')
  })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`🚀 NewsVault backend running at http://localhost:${PORT}`)
})
