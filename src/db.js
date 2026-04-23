import { openDB } from 'idb'

const DB_NAME = 'NewsVault'
const DB_VERSION = 1

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('articles')) {
        db.createObjectStore('articles', { keyPath: 'id' })
      }
    },
  })
}

export async function getArticles() {
  const db = await initDB()
  return db.getAll('articles')
}

export async function getArticle(id) {
  const db = await initDB()
  return db.get('articles', id)
}

export async function addArticle(article) {
  const db = await initDB()
  await db.put('articles', article)
}

export async function deleteArticle(id) {
  const db = await initDB()
  await db.delete('articles', id)
}
