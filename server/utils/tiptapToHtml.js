/**
 * Tiptap JSON to HTML converter
 * Converts Tiptap editor JSON content to HTML string
 * Used for RSS generation and legacy content display
 */

const escapeHtml = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const renderMarks = (text, marks) => {
  if (!marks || marks.length === 0) return escapeHtml(text)
  let html = escapeHtml(text)
  marks.forEach(mark => {
    switch (mark.type) {
      case 'bold':
        html = `<strong>${html}</strong>`
        break
      case 'italic':
        html = `<em>${html}</em>`
        break
      case 'underline':
        html = `<u>${html}</u>`
        break
      case 'strike':
        html = `<s>${html}</s>`
        break
      case 'code':
        html = `<code>${html}</code>`
        break
      case 'superscript':
        html = `<sup>${html}</sup>`
        break
      case 'subscript':
        html = `<sub>${html}</sub>`
        break
      case 'link': {
        const href = escapeHtml(mark.attrs?.href || '')
        const target = mark.attrs?.target || '_blank'
        const rel = mark.attrs?.rel || 'noopener noreferrer nofollow'
        html = `<a href="${href}" target="${target}" rel="${rel}">${html}</a>`
        break
      }
      case 'textStyle': {
        const styles = []
        if (mark.attrs?.color) styles.push(`color: ${escapeHtml(mark.attrs.color)}`)
        if (mark.attrs?.fontSize) styles.push(`font-size: ${escapeHtml(mark.attrs.fontSize)}`)
        if (mark.attrs?.fontFamily) styles.push(`font-family: ${escapeHtml(mark.attrs.fontFamily)}`)
        if (styles.length > 0) {
          html = `<span style="${styles.join('; ')}">${html}</span>`
        }
        break
      }
      case 'highlight': {
        const color = mark.attrs?.color || ''
        if (color) {
          html = `<mark style="background-color: ${escapeHtml(color)}">${html}</mark>`
        } else {
          html = `<mark>${html}</mark>`
        }
        break
      }
      default:
        break
    }
  })
  return html
}

const renderNode = (node) => {
  if (!node) return ''

  if (node.type === 'text') {
    return renderMarks(node.text || '', node.marks)
  }

  const children = (node.content || []).map(renderNode).join('')

  switch (node.type) {
    case 'doc':
      return children

    case 'paragraph': {
      const attrs = node.attrs || {}
      const styles = []
      if (attrs.textAlign && attrs.textAlign !== 'left') {
        styles.push(`text-align: ${escapeHtml(attrs.textAlign)}`)
      }
      if (attrs.lineHeight) {
        styles.push(`line-height: ${escapeHtml(attrs.lineHeight)}`)
      }
      if (attrs.indent && attrs.indent > 0) {
        styles.push(`margin-left: ${attrs.indent * 2}em`)
      }
      const styleStr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''
      return `<p${styleStr}>${children}</p>`
    }

    case 'heading': {
      const level = node.attrs?.level || 1
      const attrs = node.attrs || {}
      const styles = []
      if (attrs.textAlign && attrs.textAlign !== 'left') {
        styles.push(`text-align: ${escapeHtml(attrs.textAlign)}`)
      }
      const styleStr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''
      return `<h${level}${styleStr}>${children}</h${level}>`
    }

    case 'blockquote':
      return `<blockquote>${children}</blockquote>`

    case 'bulletList':
      return `<ul>${children}</ul>`

    case 'orderedList': {
      const start = node.attrs?.start || 1
      const startAttr = start !== 1 ? ` start="${start}"` : ''
      return `<ol${startAttr}>${children}</ol>`
    }

    case 'listItem':
      return `<li>${children}</li>`

    case 'taskList':
      return `<ul data-type="taskList">${children}</ul>`

    case 'taskItem': {
      const checked = node.attrs?.checked ? 'true' : 'false'
      return `<li data-type="taskItem" data-checked="${checked}">${children}</li>`
    }

    case 'codeBlock': {
      const language = node.attrs?.language || ''
      const langClass = language ? ` class="language-${escapeHtml(language)}"` : ''
      const codeContent = (node.content || []).map(n => n.text || '').join('')
      return `<pre><code${langClass}>${escapeHtml(codeContent)}</code></pre>`
    }

    case 'horizontalRule':
      return '<hr>'

    case 'hardBreak':
      return '<br>'

    case 'image': {
      const attrs = node.attrs || {}
      const src = escapeHtml(attrs.src || '')
      const alt = escapeHtml(attrs.alt || '')
      const title = attrs.title ? ` title="${escapeHtml(attrs.title)}"` : ''
      const width = attrs.width ? ` width="${escapeHtml(String(attrs.width))}"` : ''
      const height = attrs.height ? ` height="${escapeHtml(String(attrs.height))}"` : ''
      const dataHref = attrs.dataHref ? ` data-href="${escapeHtml(attrs.dataHref)}"` : ''
      const dataHrefWidth = attrs.dataHrefWidth ? ` data-href-width="${escapeHtml(String(attrs.dataHrefWidth))}"` : ''
      const dataHrefHeight = attrs.dataHrefHeight ? ` data-href-height="${escapeHtml(String(attrs.dataHrefHeight))}"` : ''
      return `<img src="${src}" alt="${alt}"${title}${width}${height}${dataHref}${dataHrefWidth}${dataHrefHeight} loading="lazy">`
    }

    case 'video': {
      const attrs = node.attrs || {}
      const src = attrs.src || ''
      const poster = attrs.poster ? ` poster="${escapeHtml(attrs.poster)}"` : ''
      const width = attrs.width ? ` width="${escapeHtml(String(attrs.width))}"` : ''
      const height = attrs.height ? ` height="${escapeHtml(String(attrs.height))}"` : ''
      if (src.trim().startsWith('<iframe')) {
        return `<div data-w-e-type="video">${src}</div>`
      }
      return `<div data-w-e-type="video"><video${poster} playsinline="true" preload="none" muted="muted" loop="loop" controls="true"${width}${height}><source src="${escapeHtml(src)}" type="video/mp4"/></video></div>`
    }

    case 'table':
      return `<table>${children}</table>`

    case 'tableRow':
      return `<tr>${children}</tr>`

    case 'tableHeader':
      return `<th>${children}</th>`

    case 'tableCell':
      return `<td>${children}</td>`

    case 'eventspan': {
      const attrs = node.attrs || {}
      const id = escapeHtml(attrs.id || '')
      const textContent = escapeHtml(attrs.textContent || '')
      return `<span data-w-e-type="eventspan" data-w-e-is-void data-w-e-is-inline data-id="${id}">${textContent}</span>`
    }

    case 'imageGroup': {
      const attrs = node.attrs || {}
      const childrenList = attrs.childrenList || []
      let className = 'w-e-image-group'
      if (childrenList.length % 2 === 0) {
        className += ' w-e-image-group-even'
      } else {
        className += ' w-e-image-group-odd'
      }
      let html = `<div data-w-e-type="imageGroup" class="${className}">`
      childrenList.forEach(child => {
        const imgSrc = escapeHtml(child.src || '')
        const imgWidth = child.width ? ` width="${escapeHtml(String(child.width))}"` : ''
        const imgHeight = child.height ? ` height="${escapeHtml(String(child.height))}"` : ''
        const imgDataHref = child.dataHref ? ` data-href="${escapeHtml(child.dataHref)}"` : ''
        const imgDataHrefWidth = child.dataHrefWidth ? ` data-href-width="${escapeHtml(String(child.dataHrefWidth))}"` : ''
        const imgDataHrefHeight = child.dataHrefHeight ? ` data-href-height="${escapeHtml(String(child.dataHrefHeight))}"` : ''
        const imgAlt = escapeHtml(child.alt || '')
        html += `<div class="w-e-image-group-img-body"><img src="${imgSrc}" class="w-e-image-group-img"${imgWidth}${imgHeight}${imgDataHref}${imgDataHrefWidth}${imgDataHrefHeight} alt="${imgAlt}" loading="lazy" /></div>`
      })
      html += '</div>'
      return html
    }

    case 'panorama360': {
      const attrs = node.attrs || {}
      const src = escapeHtml(attrs.src || '')
      const width = attrs.width ? ` width="${escapeHtml(String(attrs.width))}"` : ''
      const height = attrs.height ? ` height="${escapeHtml(String(attrs.height))}"` : ''
      const dataHref = attrs.dataHref ? ` data-href="${escapeHtml(attrs.dataHref)}"` : ''
      const dataHrefWidth = attrs.dataHrefWidth ? ` data-href-width="${escapeHtml(String(attrs.dataHrefWidth))}"` : ''
      const dataHrefHeight = attrs.dataHrefHeight ? ` data-href-height="${escapeHtml(String(attrs.dataHrefHeight))}"` : ''
      const alt = escapeHtml(attrs.alt || '360°全景图片')
      return `<div class="w-e-panorama360"><img src="${src}" class="w-e-panorama360-img"${width}${height}${dataHref}${dataHrefWidth}${dataHrefHeight} alt="${alt}" data-type="panorama360" loading="lazy" /></div>`
    }

    default:
      return children
  }
}

/**
 * Convert Tiptap JSON content to HTML string
 * @param {Object} json - Tiptap JSON document
 * @returns {string} HTML string
 */
exports.tiptapJsonToHtml = (json) => {
  if (!json || typeof json !== 'object') return ''
  return renderNode(json)
}
