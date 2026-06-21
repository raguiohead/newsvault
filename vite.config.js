import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import os from 'os'

function emlConverterPlugin() {
  return {
    name: 'eml-converter',
    configureServer(server) {
      server.middlewares.use('/api/convert-eml', (req, res, next) => {
        if (req.method !== 'POST') return next()
        
        const encodedName = req.headers['x-file-name'] || 'email.eml'
        const fileName = decodeURIComponent(encodedName)
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'newsvault-eml-'))
        const inputDir = path.join(tmpDir, 'input')
        const outputDir = path.join(tmpDir, 'output')
        
        fs.mkdirSync(inputDir)
        fs.mkdirSync(outputDir)
        
        const inputFilePath = path.join(inputDir, fileName)
        const fileStream = fs.createWriteStream(inputFilePath)
        
        req.pipe(fileStream)
        
        req.on('end', () => {
          const pythonExec = '/mnt/HD-13/projects/newsvault/eml2pdf/bin/python3'
          const scriptPath = '/mnt/HD-13/projects/newsvault/eml2pdf/bin/eml2pdf'
          
          exec(`${pythonExec} ${scriptPath} "${inputDir}" "${outputDir}"`, (error, stdout, stderr) => {
            if (error) {
              console.error('Conversion error:', stderr)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to convert EML' }))
              return fs.rmSync(tmpDir, { recursive: true, force: true })
            }
            
            const files = fs.readdirSync(outputDir)
            const pdfFile = files.find(f => f.endsWith('.pdf'))
            
            if (pdfFile) {
              const pdfPath = path.join(outputDir, pdfFile)
              const pdfBuffer = fs.readFileSync(pdfPath)
              res.setHeader('Content-Type', 'application/pdf')
              res.setHeader('X-Generated-Filename', encodeURIComponent(pdfFile))
              res.end(pdfBuffer)
            } else {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'PDF not generated' }))
            }
            
            fs.rmSync(tmpDir, { recursive: true, force: true })
          })
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), emlConverterPlugin()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})
