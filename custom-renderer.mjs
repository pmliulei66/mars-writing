/**
 * 自定义微信公众号 HTML 渲染器
 * 特点：
 * 1. 沉稳配色方案
 * 2. 标题突出显示
 * 3. 句子级别换行，方便阅读
 */

import fs from 'node:fs'
import path from 'node:path'
import { Marked } from 'marked'

const FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

// 沉稳配色方案
const COLORS = {
  background: '#f5f5f5',
  text: '#2d3436',
  primary: '#2c3e50',
  secondary: '#34495e',
  accent: '#7f8c8d',
  quoteBackground: '#e8e8e8'
}

// 渲染配置
const CONFIG = {
  fontSize: '16px',
  lineHeight: '1.8',
  letterSpacing: '0.3px',
  cardRadius: '16px',
  cardShadow: '0 8px 32px rgba(45, 52, 54, 0.08), 0 0 20px rgba(44, 62, 80, 0.2)'
}

/**
 * 将长段落按句子分割
 */
function splitBySentence(text) {
  // 匹配中文句子结尾：。！？
  // 匹配英文句子结尾：.?! 后面跟空格或换行
  const sentenceRegex = /([。！？.!?]+)(?=\s|$)/g
  return text.split(sentenceRegex).filter(s => s.trim()).join('\n\n')
}

/**
 * 渲染 Markdown 为微信 HTML
 */
export function renderMarkdown(markdown) {
  const { background, text: textColor, primary, secondary, quoteBackground } = COLORS
  const { fontSize, lineHeight, letterSpacing, cardRadius, cardShadow } = CONFIG

  const images = []
  let imgIndex = 0

  const marked = new Marked({ gfm: true, breaks: false })

  marked.use({
    renderer: {
      image(href, title, text) {
        const isOnline = href.startsWith('http://') || href.startsWith('https://')
        images.push({ index: imgIndex, alt: text, src: href, type: isOnline ? 'online' : 'local' })
        return `<!-- IMG:${imgIndex++} -->`
      },

      heading(text, depth) {
        if (depth === 1) {
          return `<h1 style="font-family: ${FONT_FAMILY}; font-size: 24px; font-weight: 800; color: ${primary}; text-align: center; margin: 0 0 16px 0; padding: 12px 0; border-bottom: 2px solid ${primary}; letter-spacing: 1px;">${text}</h1>\n`
        }
        if (depth === 2) {
          return `<h2 style="font-family: ${FONT_FAMILY}; font-size: 20px; font-weight: 700; color: ${primary}; border-left: 4px solid ${primary}; padding-left: 12px; margin: 32px 0 16px 0; background: rgba(44, 62, 80, 0.03); padding: 8px 0 8px 16px; border-radius: 0 4px 4px 0;">${text}</h2>\n`
        }
        if (depth === 3) {
          return `<h3 style="font-family: ${FONT_FAMILY}; font-size: 17px; font-weight: 700; color: ${secondary}; background-color: rgba(44, 62, 80, 0.06); padding: 8px 12px; border-radius: 6px; margin: 24px 0 12px 0; display: inline-block;">${text}</h3>\n`
        }
        return `<h${depth} style="font-family: ${FONT_FAMILY}; font-size: 16px; font-weight: 600; color: ${secondary}; margin: 16px 0 8px 0;">${text}</h${depth}>\n`
      },

      paragraph(text) {
        if (/^<!--\s*IMG:\d+\s*-->$/.test(text.trim())) {
          return text.trim() + '\n'
        }
        if (/<!--\s*IMG:\d+\s*-->/.test(text)) {
          const parts = text.split(/(<!--\s*IMG:\d+\s*-->)/)
          return parts.map(part => {
            if (/^<!--\s*IMG:\d+\s*-->/.test(part.trim())) {
              return part.trim() + '\n'
            }
            const clean = part.trim()
            if (!clean) return ''
            const splitText = splitBySentence(clean)
            return `<p style="font-family: ${FONT_FAMILY}; font-size: ${fontSize}; line-height: ${lineHeight}; color: ${textColor}; margin: 0 0 12px 0;">${splitText}</p>\n`
          }).join('')
        }
        const splitText = splitBySentence(text)
        return `<p style="font-family: ${FONT_FAMILY}; font-size: ${fontSize}; line-height: ${lineHeight}; color: ${textColor}; margin: 0 0 12px 0;">${splitText}</p>\n`
      },

      strong(text) {
        return `<strong style="color: ${secondary}; font-weight: 700;">${text}</strong>`
      },

      em(text) {
        return `<em style="color: ${textColor}; font-style: italic;">${text}</em>`
      },

      blockquote(quote) {
        return `<blockquote style="font-family: ${FONT_FAMILY}; background-color: ${quoteBackground}; border-left: 5px solid ${primary}; margin: 16px 0; padding: 12px 16px; border-radius: 0 8px 8px 0;">${quote}</blockquote>\n`
      },

      code(code, lang) {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `<pre style="font-family: 'Courier New', Courier, monospace; background-color: #f6f8fa; border: 1px solid rgba(0,0,0,0.08); border-radius: 6px; padding: 12px 16px; overflow-x: auto; margin: 16px 0;"><code style="font-size: 14px; line-height: 1.6; color: #24292e;">${escaped}</code></pre>\n`
      },

      codespan(text) {
        const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `<code style="font-family: 'Courier New', Courier, monospace; font-size: 14px; background-color: rgba(0,0,0,0.06); border-radius: 3px; padding: 1px 5px; color: ${secondary};">${escaped}</code>`
      },

      list(body, ordered, start) {
        const tag = ordered ? 'ol' : 'ul'
        const startAttr = ordered && start !== 1 ? ` start="${start}"` : ''
        const listStyle = ordered ? 'list-style-type: decimal;' : 'list-style-type: disc;'
        return `<${tag}${startAttr} style="font-family: ${FONT_FAMILY}; font-size: ${fontSize}; line-height: ${lineHeight}; color: ${textColor}; ${listStyle} padding-left: 24px; margin: 0 0 16px 0;">${body}</${tag}>\n`
      },

      listitem(text, task, checked) {
        if (task) {
          const checkbox = `<input type="checkbox" ${checked ? 'checked' : ''} disabled style="margin-right: 6px;">`
          return `<li style="margin-bottom: 6px;">${checkbox}${text}</li>`
        }
        return `<li style="margin-bottom: 6px;">${text}</li>`
      },

      hr() {
        return `<hr style="border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(44, 62, 80, 0.3), transparent);" />\n`
      },

      link(href, title, text) {
        const titleAttr = title ? ` title="${title}"` : ''
        return `<a href="${href}"${titleAttr} style="color: ${primary}; text-decoration: none; border-bottom: 1px solid ${primary};">${text}</a>`
      },
    }
  })

  const cardStyle = [
    'background-color: #ffffff',
    `border: 1px solid rgba(44, 62, 80, 0.1)`,
    `box-shadow: ${cardShadow}`,
    `border-radius: ${cardRadius}`,
    'padding: 28px',
    'max-width: 800px',
    'margin: 0 auto',
    'box-sizing: border-box',
  ].join('; ')

  const html = marked(markdown)
  
  const wrapperStyle = [
    `background-color: ${background}`,
    'padding: 40px 10px',
    `font-family: ${FONT_FAMILY}`,
    `font-size: ${fontSize}`,
    `line-height: ${lineHeight}`,
    `letter-spacing: ${letterSpacing}`,
    'box-sizing: border-box',
  ].join('; ')

  return { html: `<div style="${wrapperStyle}">\n<section style="${cardStyle}">${html}</section>\n</div>`, images }
}

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const inputFile = args.find(arg => arg.startsWith('-i='))?.split('=')[1] || args[0]
  const outputFile = args.find(arg => arg.startsWith('-o='))?.split('=')[1]

  if (!inputFile) {
    console.error('Usage: node custom-renderer.mjs -i=input.md [-o=output.html]')
    process.exit(1)
  }

  try {
    const markdown = fs.readFileSync(inputFile, 'utf-8')
    const { html } = renderMarkdown(markdown)
    
    if (outputFile) {
      fs.writeFileSync(outputFile, html)
      console.log(`✅ 已保存到: ${outputFile}`)
    } else {
      console.log(html)
    }
  } catch (err) {
    console.error('❌ 错误:', err.message)
    process.exit(1)
  }
}
