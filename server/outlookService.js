import fs from 'fs'
import path from 'path'
import os from 'os'

// Dynamic resolution of ms-365 auth manager from npx cache or local node_modules
function getMs365PackagePath() {
  const npxDir = path.join(os.homedir(), '.npm', '_npx')
  if (fs.existsSync(npxDir)) {
    try {
      const hashes = fs.readdirSync(npxDir)
      for (const h of hashes) {
        const candidate = path.join(npxDir, h, 'node_modules', '@softeria', 'ms-365-mcp-server', 'dist', 'auth.js')
        if (fs.existsSync(candidate)) return candidate
      }
    } catch (_) {}
  }
  return null
}

export async function getOutlookAuth() {
  const authPath = getMs365PackagePath()
  if (!authPath) {
    throw new Error('Módulo de autenticação Microsoft 365 não encontrado em ~/.npm/_npx.')
  }
  const m = await import(authPath)
  const scopes = m.resolveAuthScopes({})
  const auth = await m.default.create(scopes)
  await auth.loadTokenCache()
  const token = await auth.getToken()
  if (!token) {
    throw new Error('Não foi possível obter o token do Outlook. Certifique-se de que sua conta Microsoft está conectada.')
  }
  return { auth, token }
}

export async function getOutlookProfile(token) {
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    throw new Error(`Erro ao obter perfil Microsoft: HTTP ${res.status}`)
  }
  return res.json()
}

export async function getOutlookFolders(token) {
  const res = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders?$top=100&$select=id,displayName,childFolderCount,totalItemCount,unreadItemCount,parentFolderId', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`Falha ao listar pastas do Outlook: HTTP ${res.status}`)
  const data = await res.json()
  const root = data.value || []

  const list = []
  for (const f of root) {
    list.push({
      id: f.id,
      name: f.displayName,
      path: f.displayName,
      totalItemCount: f.totalItemCount,
      unreadItemCount: f.unreadItemCount,
      hasChildren: f.childFolderCount > 0
    })

    if (f.childFolderCount > 0) {
      try {
        const cRes = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/${f.id}/childFolders?$top=100&$select=id,displayName,childFolderCount,totalItemCount,unreadItemCount,parentFolderId`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (cRes.ok) {
          const cData = await cRes.json()
          for (const c of cData.value || []) {
            list.push({
              id: c.id,
              name: c.displayName,
              path: `${f.displayName} / ${c.displayName}`,
              totalItemCount: c.totalItemCount,
              unreadItemCount: c.unreadItemCount,
              hasChildren: c.childFolderCount > 0
            })
          }
        }
      } catch (_) {}
    }
  }

  // Prioritize folders like "Para ler depois" and folders with items
  return list.sort((a, b) => {
    const aIsPld = a.name.toLowerCase().includes('ler depois')
    const bIsPld = b.name.toLowerCase().includes('ler depois')
    if (aIsPld && !bIsPld) return -1
    if (!aIsPld && bIsPld) return 1
    if ((b.totalItemCount > 0) !== (a.totalItemCount > 0)) {
      return (b.totalItemCount > 0) ? 1 : -1
    }
    return a.path.localeCompare(b.path)
  })
}

export async function findParaLerDepoisFolder(token) {
  const knownId = "AQMkADAwATY0MDABLWZjZjItN2M5My0wMAItMDAKAC4AAAOyFxSpPiVKRLyZFSpDh_SVAQDPAo_aDo65RoJvrelWZIlxAAY7AjUQAAAA"
  try {
    const checkRes = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/${knownId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (checkRes.ok) {
      return await checkRes.json()
    }
  } catch (_) {}

  const folders = await getOutlookFolders(token)
  const match = folders.find(f => f.name.toLowerCase().includes('ler depois'))
  if (match) return match

  throw new Error('Pasta "Para ler depois" não encontrada no Outlook.')
}

export function categorizeArticle(title, text) {
  const full = `${title} ${text}`.toLowerCase()
  if (full.match(/saúde|fitness|treino|dieta|nutrição|exercício|médico|sono|longevidade/)) {
    return { category: 'Saúde & Fitness', categoryEmoji: '🏋️', categoryColor: '#ea580c' }
  }
  if (full.match(/produtividade|hábito|foco|gestão de tempo|rotina|meta|organização/)) {
    return { category: 'Produtividade', categoryEmoji: '🧠', categoryColor: '#6366f1' }
  }
  if (full.match(/negócio|carreira|empresa|startup|venda|mercado|trabalho|invest|dinheiro|financeiro|economia/)) {
    return { category: 'Negócios & Carreira', categoryEmoji: '💼', categoryColor: '#0284c7' }
  }
  if (full.match(/dados|tecnologia|programação|software|ia|inteligência artificial|tech|código|dev|python|llm/)) {
    return { category: 'Dados & Tecnologia', categoryEmoji: '📊', categoryColor: '#059669' }
  }
  if (full.match(/escrita|criatividade|arte|design|criação|storytelling|conteúdo/)) {
    return { category: 'Escrita & Criatividade', categoryEmoji: '✍️', categoryColor: '#d97706' }
  }
  if (full.match(/livro|aprendizado|estudo|curso|leitura|conhecimento|ensino/)) {
    return { category: 'Livros & Aprendizado', categoryEmoji: '📚', categoryColor: '#db2777' }
  }
  if (full.match(/vida|filosofia|reflexão|estoicismo|psicologia|mente/)) {
    return { category: 'Vida & Filosofia', categoryEmoji: '🌱', categoryColor: '#16a34a' }
  }
  return { category: 'Geral', categoryEmoji: '📄', categoryColor: '#64748b' }
}

function extractCleanText(html, bodyPreview) {
  if (!html) return bodyPreview || ''
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim()

  return text || bodyPreview || ''
}

export async function getOutlookStatus() {
  const { token } = await getOutlookAuth()
  const profile = await getOutlookProfile(token)
  const folders = await getOutlookFolders(token)
  const defaultFolder = folders.find(f => f.name.toLowerCase().includes('ler depois')) || folders[0]

  return {
    connected: true,
    user: {
      displayName: profile.displayName,
      mail: profile.mail || profile.userPrincipalName
    },
    folder: defaultFolder,
    folders
  }
}

export async function syncOutlookFolder({ folderId, top = 25, unreadOnly = false, markAsRead = false } = {}) {
  const { token } = await getOutlookAuth()
  
  let targetFolder = null
  if (folderId) {
    const checkRes = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/${folderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (checkRes.ok) {
      targetFolder = await checkRes.json()
    }
  }

  if (!targetFolder) {
    targetFolder = await findParaLerDepoisFolder(token)
  }

  let url = `https://graph.microsoft.com/v1.0/me/mailFolders/${targetFolder.id}/messages?$top=${top}&$select=id,subject,from,receivedDateTime,body,bodyPreview,isRead&$orderby=receivedDateTime desc`
  if (unreadOnly) {
    url += `&$filter=isRead eq false`
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Prefer: 'outlook.body-content-type="html"'
    }
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Falha ao buscar e-mails do Outlook: ${err}`)
  }

  const data = await res.json()
  const messages = data.value || []

  const articles = []
  for (const msg of messages) {
    const title = msg.subject || 'Sem Assunto'
    const author = msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || 'Desconhecido'
    const date = msg.receivedDateTime ? msg.receivedDateTime.split('T')[0] : new Date().toISOString().split('T')[0]
    const fullHtml = msg.body?.content || ''
    const content = extractCleanText(fullHtml, msg.bodyPreview)
    const words = content.split(/\s+/).filter(Boolean).length
    const cat = categorizeArticle(title, content)
    const summary = msg.bodyPreview || (content.slice(0, 300) + '...')

    articles.push({
      id: `outlook-${msg.id}`,
      outlookId: msg.id,
      title,
      author,
      authorEmail: msg.from?.emailAddress?.address || '',
      date,
      ...cat,
      language: 'PT',
      summary: summary.trim(),
      content,
      fullHtml,
      wordCount: words,
      isRead: msg.isRead,
      source: 'outlook',
      folderName: targetFolder.displayName || targetFolder.name,
      tags: ['outlook', 'newsletter', cat.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')]
    })

    if (markAsRead && !msg.isRead) {
      fetch(`https://graph.microsoft.com/v1.0/me/messages/${msg.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead: true })
      }).catch(e => console.error(`Erro ao marcar mensagem ${msg.id} como lida:`, e))
    }
  }

  return {
    folder: {
      id: targetFolder.id,
      displayName: targetFolder.displayName || targetFolder.name,
      totalItemCount: targetFolder.totalItemCount,
      unreadItemCount: targetFolder.unreadItemCount
    },
    count: articles.length,
    articles
  }
}
