import fs from 'fs'
import path from 'path'

const BOOKS_FILE = path.join(import.meta.dirname, 'books.json')
const HISTORY_FILE = path.join(import.meta.dirname, 'book-history.json')
const IMAGE_HISTORY_FILE = path.join(import.meta.dirname, 'image-history.json')
const MAX_HISTORY = 20
const MAX_IMAGE_REUSE = 10

const IMAGE_DIR = path.join('E:\\Obsidian\\MarsEverthing\\个人项目\\ai公众号（头条号）\\配图')

export function loadBooks() {
  const data = fs.readFileSync(BOOKS_FILE, 'utf-8')
  return JSON.parse(data)
}

export function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) {
    return { history: [], max_history: MAX_HISTORY, last_updated: new Date().toISOString().split('T')[0] }
  }
  const data = fs.readFileSync(HISTORY_FILE, 'utf-8')
  return JSON.parse(data)
}

export function loadImageHistory() {
  if (!fs.existsSync(IMAGE_HISTORY_FILE)) {
    return { history: [], max_reuse: MAX_IMAGE_REUSE, last_updated: new Date().toISOString().split('T')[0] }
  }
  const data = fs.readFileSync(IMAGE_HISTORY_FILE, 'utf-8')
  return JSON.parse(data)
}

export function saveHistory(history) {
  const data = {
    history: history.slice(-MAX_HISTORY),
    max_history: MAX_HISTORY,
    last_updated: new Date().toISOString().split('T')[0]
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2))
}

export function saveImageHistory(history) {
  const data = {
    history: history.slice(-MAX_IMAGE_REUSE),
    max_reuse: MAX_IMAGE_REUSE,
    last_updated: new Date().toISOString().split('T')[0]
  }
  fs.writeFileSync(IMAGE_HISTORY_FILE, JSON.stringify(data, null, 2))
}

export function getAvailableImages() {
  if (!fs.existsSync(IMAGE_DIR)) {
    console.warn(`Image directory not found: ${IMAGE_DIR}`)
    return []
  }
  const files = fs.readdirSync(IMAGE_DIR)
  return files
    .filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
    .map(f => path.join(IMAGE_DIR, f))
}

export function selectRandomImage() {
  const imageHistory = loadImageHistory()
  const usedImages = new Set(imageHistory.history)
  const availableImages = getAvailableImages()
  
  let candidates = availableImages.filter(img => !usedImages.has(img))
  
  if (candidates.length === 0) {
    candidates = availableImages
  }
  
  if (candidates.length === 0) {
    console.warn('No images found in directory')
    return null
  }
  
  const randomIndex = Math.floor(Math.random() * candidates.length)
  const selected = candidates[randomIndex]
  
  const newHistory = [
    ...imageHistory.history,
    selected
  ]
  
  saveImageHistory(newHistory)
  
  return selected
}

export function selectRandomBook(category = null) {
  const books = loadBooks()
  const history = loadHistory()
  
  const usedIds = new Set(history.history.map(item => item.book_id))
  
  let candidates = books.library.filter(book => !usedIds.has(book.id))
  
  if (category) {
    candidates = candidates.filter(book => book.category === category)
  }
  
  if (candidates.length === 0) {
    candidates = books.library
    if (category) {
      candidates = candidates.filter(book => book.category === category)
    }
    if (candidates.length === 0) {
      candidates = books.library
    }
  }
  
  const randomIndex = Math.floor(Math.random() * candidates.length)
  const selected = candidates[randomIndex]
  
  const newHistory = [
    ...history.history,
    {
      book_id: selected.id,
      book_title: selected.title,
      timestamp: new Date().toISOString()
    }
  ]
  
  saveHistory(newHistory)
  
  return selected
}

export function selectMultipleBooks(count = 1, category = null) {
  const results = []
  for (let i = 0; i < count; i++) {
    const book = selectRandomBook(category)
    results.push(book)
  }
  return results
}

export function getHistory() {
  return loadHistory()
}

export function getImageHistory() {
  return loadImageHistory()
}

export function clearHistory() {
  saveHistory([])
}

export function clearImageHistory() {
  saveImageHistory([])
}

const isMainModule = import.meta.url.startsWith('file://') && process.argv[1]?.includes('book-selector.mjs')
if (isMainModule) {
  const args = process.argv.slice(2)
  if (args.includes('--random')) {
    const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : null
    const book = selectRandomBook(category)
    console.log(JSON.stringify(book, null, 2))
  } else if (args.includes('--multiple')) {
    const count = parseInt(args[args.indexOf('--multiple') + 1]) || 5
    const category = args.includes('--category') ? args[args.indexOf('--category') + 1] : null
    const books = selectMultipleBooks(count, category)
    console.log(JSON.stringify(books, null, 2))
  } else if (args.includes('--history')) {
    const history = getHistory()
    console.log(JSON.stringify(history, null, 2))
  } else if (args.includes('--image')) {
    const image = selectRandomImage()
    console.log(JSON.stringify({ image }, null, 2))
  } else if (args.includes('--clear')) {
    clearHistory()
    clearImageHistory()
    console.log('History cleared')
  } else {
    console.log(`Usage:
  node book-selector.mjs --random [--category <category>]
  node book-selector.mjs --multiple <count> [--category <category>]
  node book-selector.mjs --history
  node book-selector.mjs --image
  node book-selector.mjs --clear`)
  }
}