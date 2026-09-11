import { useState, useRef } from 'react'
import { parsePdfFile } from '../pdfParser.js'
import { addArticle } from '../db.js'

export default function EmlConverterTab({ onConverted }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' })
  const fileInputRef = useRef(null)

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    
    const confirmMessage = `Você selecionou ${files.length} arquivo(s) para conversão. Por favor, não feche ou saia da página até que a operação seja concluída. Deseja iniciar?`
    if (!window.confirm(confirmMessage)) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    
    setLoading(true)
    setError(null)
    setProgress({ current: 0, total: files.length, fileName: '' })
    
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = '' // Requerido por navegadores para exibir o prompt nativo
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    try {
      let currentFileIndex = 0;
      for (const file of files) {
        currentFileIndex++;
        if (!file.name.toLowerCase().endsWith('.eml')) {
          console.warn(`[Conversão] Pulando arquivo não-EML: ${file.name}`)
          continue
        }

        console.log(`[Conversão] Iniciando arquivo ${currentFileIndex}/${files.length}: ${file.name}`)
        setProgress({ current: currentFileIndex, total: files.length, fileName: file.name })

        // Send raw file data
        const buffer = await file.arrayBuffer()
        const res = await fetch('/api/convert-eml', {
          method: 'POST',
          headers: {
            'X-File-Name': encodeURIComponent(file.name),
            'Content-Type': 'application/octet-stream'
          },
          body: buffer
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          console.error(`[Conversão] Erro ao converter ${file.name}:`, errData)
          throw new Error(errData.error || `Erro HTTP ${res.status} ao converter ${file.name}`)
        }

        const pdfBlob = await res.blob()
        // Mock a File object so pdf.js can read it properly
        const pdfFile = new File([pdfBlob], file.name.replace(/\.eml$/i, '.pdf'), { type: 'application/pdf' })
        
        // Feed into pdfParser and indexedDB
        const parsedData = await parsePdfFile(pdfFile)
        await addArticle(parsedData)
        console.log(`[Conversão] Concluído com sucesso: ${file.name}`)
      }
      
      console.log('[Conversão] Todas as operações foram finalizadas.')
      onConverted() // Return to library and reload
    } catch (err) {
      console.error('[Conversão] Processo interrompido com erro:', err)
      setError(err.message || 'Erro desconhecido ao converter EML.')
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0, fileName: '' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }

  return (
    <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="state-container">
        <div className="state-icon">📧</div>
        <h2 className="state-title">Converter EML para PDF</h2>
        <p className="state-desc" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
          Faça o upload de arquivos de e-mail (<b>.eml</b>). Eles serão convertidos localmente para PDF e adicionados automaticamente à sua biblioteca NewsVault.
        </p>
        
        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '16px', padding: '12px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <input 
          type="file" 
          multiple 
          accept=".eml" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />

        {loading ? (
          <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }} title={progress.fileName}>
                Convertendo: {progress.fileName}
              </span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'var(--primary)', 
                  width: `${(progress.current / progress.total) * 100}%`,
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
          </div>
        ) : (
          <button 
            className="upload-btn primary-btn" 
            onClick={() => fileInputRef.current?.click()} 
            style={{ fontSize: '1.1rem', padding: '12px 24px' }}
          >
            + Selecionar Arquivos .EML
          </button>
        )}
      </div>
    </main>
  )
}
