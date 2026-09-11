import { useState, useEffect, useMemo } from 'react'
import { addArticle } from '../db.js'

export default function OutlookSyncTab({ onConverted }) {
  const [status, setStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [successCount, setSuccessCount] = useState(null)
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [limit, setLimit] = useState(25)
  const [unreadOnly, setUnreadOnly] = useState(true)
  const [markAsRead, setMarkAsRead] = useState(false)

  const fetchStatus = async () => {
    setLoadingStatus(true)
    setError(null)
    try {
      const res = await fetch('/api/outlook/status')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Erro HTTP ${res.status}`)
      }
      const data = await res.json()
      setStatus(data)
      if (data.folder?.id) {
        setSelectedFolderId(data.folder.id)
      }
    } catch (err) {
      console.error('Erro ao verificar status do Outlook:', err)
      setError(err.message || 'Falha ao conectar com o Outlook.')
    } finally {
      setLoadingStatus(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const currentFolder = useMemo(() => {
    if (!status?.folders || !selectedFolderId) return status?.folder || null
    return status.folders.find(f => f.id === selectedFolderId) || status.folder
  }, [status, selectedFolderId])

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setSuccessCount(null)

    try {
      const res = await fetch('/api/outlook/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId: selectedFolderId,
          top: Number(limit),
          unreadOnly,
          markAsRead
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Erro HTTP ${res.status} ao sincronizar`)
      }

      const data = await res.json()
      const articles = data.articles || []

      // Ingest into IndexedDB
      for (const article of articles) {
        await addArticle(article)
      }

      setSuccessCount(articles.length)
      await fetchStatus()
    } catch (err) {
      console.error('Erro durante a sincronização:', err)
      setError(err.message || 'Erro inesperado na sincronização.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh' }}>
      <div className="state-container" style={{ maxWidth: '640px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="state-icon" style={{ margin: 0, fontSize: '2.5rem' }}>📬</div>
          <div>
            <h2 className="state-title" style={{ margin: 0, fontSize: '1.6rem' }}>Sincronização com o Outlook</h2>
            <p className="state-desc" style={{ margin: '4px 0 0', fontSize: '0.95rem' }}>
              Importe seus e-mails e newsletters diretamente de qualquer pasta do seu Outlook sem precisar baixar arquivos .eml.
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            color: '#f43f5e',
            margin: '16px 0',
            padding: '12px 16px',
            background: 'rgba(244, 63, 94, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            fontSize: '14px'
          }}>
            ⚠️ {error}
            <button
              onClick={fetchStatus}
              style={{
                marginLeft: '12px',
                background: 'transparent',
                color: 'inherit',
                border: '1px solid currentColor',
                borderRadius: '4px',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loadingStatus ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 2, display: 'inline-block', marginBottom: 10 }} />
            <p>Carregando pastas da sua conta Microsoft...</p>
          </div>
        ) : status ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {/* Account & Folder Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Conta Conectada</span>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {status.user?.displayName} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>({status.user?.mail})</span>
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  ● Online
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Pasta Selecionada</span>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                    📂 {currentFolder?.path || currentFolder?.displayName || 'Para ler depois'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Status dos E-mails</span>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                    <b style={{ color: '#00d4aa' }}>{currentFolder?.unreadItemCount ?? 0}</b> não lidos / {currentFolder?.totalItemCount ?? 0} no total
                  </div>
                </div>
              </div>
            </div>

            {/* Folder & Sync Configuration */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {/* Folder Selector */}
              <div>
                <label htmlFor="folder-select" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Escolha a Pasta do Outlook para Sincronizar:
                </label>
                <select
                  id="folder-select"
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  disabled={syncing}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {(status.folders || [status.folder]).map(f => (
                    <option key={f.id} value={f.id}>
                      📁 {f.path || f.displayName} ({f.unreadItemCount} não lidos / {f.totalItemCount} total)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <label htmlFor="sync-limit" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  Quantidade de e-mails para importar:
                </label>
                <select
                  id="sync-limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  disabled={syncing}
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value={10}>10 mais recentes</option>
                  <option value={25}>25 mais recentes</option>
                  <option value={50}>50 mais recentes</option>
                  <option value={100}>100 mais recentes</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="unread-only"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  disabled={syncing}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="unread-only" style={{ fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Importar apenas mensagens não lidas ({currentFolder?.unreadItemCount ?? 0} disponíveis)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="mark-read"
                  checked={markAsRead}
                  onChange={(e) => setMarkAsRead(e.target.checked)}
                  disabled={syncing}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="mark-read" style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Marcar como lidas no Outlook após importar
                </label>
              </div>
            </div>

            {/* Success Feedback */}
            {successCount !== null && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 500 }}>
                  ✨ {successCount} artigo(s) importado(s) da pasta <b>{currentFolder?.name || currentFolder?.displayName}</b> com sucesso!
                </div>
                <button
                  onClick={onConverted}
                  className="upload-btn"
                  style={{ padding: '6px 14px', fontSize: '13px', background: '#10b981', color: '#fff', border: 'none' }}
                >
                  Ver na Biblioteca ➔
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                className="upload-btn primary-btn"
                onClick={handleSync}
                disabled={syncing}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {syncing ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Sincronizando com o Outlook...
                  </>
                ) : (
                  <>📥 Sincronizar de "{currentFolder?.name || 'Pasta Selecionada'}"</>
                )}
              </button>

              <button
                className="view-toggle-btn"
                onClick={onConverted}
                disabled={syncing}
                style={{ padding: '12px 18px', fontSize: '1rem' }}
              >
                Biblioteca
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
