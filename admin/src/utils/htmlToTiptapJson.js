/**
 * WangEditor HTML to Tiptap JSON converter
 * Used for upgrading old posts from WangEditor (v4/v5) to Tiptap (v6)
 */

/**
 * Convert WangEditor HTML to Tiptap JSON
 * @param {string} html - WangEditor HTML content
 * @returns {Object} Tiptap JSON document
 */
export function htmlToTiptapJson(html) {
  if (!html || !html.trim()) {
    return { type: 'doc', content: [{ type: 'paragraph' }] }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(
    `<div id="root">${html}</div>`,
    'text/html'
  )
  const root = doc.getElementById('root')

  const content = parseChildren(root)

  // Ensure at least one content node
  if (content.length === 0) {
    content.push({ type: 'paragraph' })
  }

  return { type: 'doc', content }
}

function parseChildren(parent) {
  const result = []
  const childNodes = parent.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i]
    const parsed = parseNode(node)
    if (parsed) {
      if (Array.isArray(parsed)) {
        result.push(...parsed)
      } else {
        result.push(parsed)
      }
    }
  }

  return result
}

function parseNode(node) {
  // Text node
  if (node.nodeType === 3) {
    const text = node.textContent
    if (!text) return null
    return { type: 'text', text }
  }

  // Element node
  if (node.nodeType !== 1) return null

  const tagName = node.tagName.toUpperCase()

  // Check for WangEditor custom types
  const weType = node.getAttribute('data-w-e-type')
  if (weType === 'eventspan') {
    return parseEventSpan(node)
  }
  if (weType === 'imageGroup') {
    return parseImageGroup(node)
  }
  if (weType === 'video') {
    return parseVideo(node)
  }

  // Check for panorama360
  if (node.classList && node.classList.contains('w-e-panorama360')) {
    return parsePanorama360(node)
  }

  switch (tagName) {
    case 'P':
      return parseParagraph(node)
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      return parseHeading(node)
    case 'BLOCKQUOTE':
      return parseBlockquote(node)
    case 'UL':
      return parseList(node, 'bulletList')
    case 'OL':
      return parseList(node, 'orderedList')
    case 'LI':
      return parseListItem(node)
    case 'PRE':
      return parseCodeBlock(node)
    case 'TABLE':
      return parseTable(node)
    case 'HR':
      return { type: 'horizontalRule' }
    case 'BR':
      return { type: 'hardBreak' }
    case 'IMG':
      return parseImage(node)
    case 'VIDEO':
      return parseVideoTag(node)
    case 'DIV':
      return parseDiv(node)
    case 'IFRAME':
      return parseIframe(node)
    // Inline elements
    case 'STRONG':
    case 'B':
      return wrapWithMark(node, { type: 'bold' })
    case 'EM':
    case 'I':
      return wrapWithMark(node, { type: 'italic' })
    case 'U':
      return wrapWithMark(node, { type: 'underline' })
    case 'S':
    case 'DEL':
    case 'STRIKE':
      return wrapWithMark(node, { type: 'strike' })
    case 'CODE':
      return wrapWithMark(node, { type: 'code' })
    case 'SUP':
      return wrapWithMark(node, { type: 'superscript' })
    case 'SUB':
      return wrapWithMark(node, { type: 'subscript' })
    case 'A':
      return parseLink(node)
    case 'SPAN':
      return parseSpan(node)
    case 'MARK':
      return parseMark(node)
    case 'THEAD':
    case 'TBODY':
    case 'TFOOT':
      // Pass through to children
      return parseChildren(node)
    case 'TR':
      return parseTableRow(node)
    case 'TH':
      return parseTableHeader(node)
    case 'TD':
      return parseTableCell(node)
    default:
      // For unknown block-level elements, try to parse children
      if (isBlockElement(tagName)) {
        const children = parseInlineContent(node)
        if (children.length > 0) {
          return { type: 'paragraph', content: children }
        }
        return null
      }
      // For unknown inline elements, parse children
      return parseInlineChildren(node)
  }
}

function isBlockElement(tagName) {
  const blockElements = [
    'DIV',
    'P',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'BLOCKQUOTE',
    'UL',
    'OL',
    'LI',
    'PRE',
    'TABLE',
    'FIGURE',
    'SECTION',
    'ARTICLE',
    'HEADER',
    'FOOTER',
    'NAV',
    'ASIDE',
    'MAIN'
  ]
  return blockElements.includes(tagName)
}

function getTextStyleMarks(node) {
  const marks = []
  const style = node.style

  if (style) {
    const color = style.color
    const fontSize = style.fontSize
    const fontFamily = style.fontFamily
    const bgColor = style.backgroundColor

    if (color || fontSize || fontFamily) {
      const attrs = {}
      if (color) attrs.color = color
      if (fontSize) attrs.fontSize = fontSize
      if (fontFamily) attrs.fontFamily = fontFamily.replace(/['"]/g, '')
      marks.push({ type: 'textStyle', attrs })
    }

    if (bgColor) {
      marks.push({ type: 'highlight', attrs: { color: bgColor } })
    }
  }

  return marks
}

function parseInlineChildren(node) {
  const result = []
  const childNodes = node.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    const parsed = parseNode(child)
    if (parsed) {
      if (Array.isArray(parsed)) {
        result.push(...parsed)
      } else {
        result.push(parsed)
      }
    }
  }

  return result
}

function parseInlineContent(node) {
  const result = []
  const childNodes = node.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (child.nodeType === 3) {
      const text = child.textContent
      if (text) {
        result.push({ type: 'text', text })
      }
    } else if (child.nodeType === 1) {
      const tagName = child.tagName.toUpperCase()
      const weType = child.getAttribute('data-w-e-type')

      if (weType === 'eventspan') {
        result.push(parseEventSpan(child))
        continue
      }

      if (tagName === 'BR') {
        result.push({ type: 'hardBreak' })
        continue
      }

      if (tagName === 'IMG') {
        // Images found inline - this can happen
        // We'll handle this by creating a separate block later
        continue
      }

      const parsed = parseNode(child)
      if (parsed) {
        if (Array.isArray(parsed)) {
          // Flatten inline results
          parsed.forEach(p => {
            if (p.type === 'text' || p.marks) {
              result.push(p)
            }
          })
        } else if (parsed.type === 'text') {
          result.push(parsed)
        }
      }
    }
  }

  return result
}

function wrapWithMark(node, mark) {
  const children = parseInlineChildren(node)
  return children.map(child => {
    if (child.type === 'text') {
      const marks = child.marks ? [...child.marks, mark] : [mark]
      return { ...child, marks }
    }
    if (child.marks) {
      return { ...child, marks: [...child.marks, mark] }
    }
    return child
  })
}

function parseParagraph(node) {
  const content = parseInlineContent(node)
  const attrs = {}

  const style = node.style
  if (style) {
    if (style.textAlign && style.textAlign !== 'start') {
      attrs.textAlign = style.textAlign
    }
    if (style.lineHeight) {
      attrs.lineHeight = style.lineHeight
    }
    if (style.marginLeft) {
      const match = style.marginLeft.match(/^(\d+)/)
      if (match) {
        attrs.indent = Math.round(parseInt(match[1]) / 32)
      }
    }
  }

  const result = { type: 'paragraph' }
  if (Object.keys(attrs).length > 0) {
    result.attrs = attrs
  }
  if (content.length > 0) {
    result.content = content
  }

  return result
}

function parseHeading(node) {
  const level = parseInt(node.tagName.substring(1))
  const content = parseInlineContent(node)
  const attrs = { level }

  const style = node.style
  if (style && style.textAlign && style.textAlign !== 'start') {
    attrs.textAlign = style.textAlign
  }

  const result = { type: 'heading', attrs }
  if (content.length > 0) {
    result.content = content
  }

  return result
}

function parseBlockquote(node) {
  const content = parseChildren(node)
  // Wrap text nodes in paragraphs
  const wrapped = content.map(child => {
    if (child.type === 'text') {
      return { type: 'paragraph', content: [child] }
    }
    return child
  })

  return {
    type: 'blockquote',
    content: wrapped.length > 0 ? wrapped : [{ type: 'paragraph' }]
  }
}

function parseList(node, listType) {
  const items = []
  const childNodes = node.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (child.nodeType === 1 && child.tagName.toUpperCase() === 'LI') {
      // Check if it's a task item
      const dataType = child.getAttribute('data-type')
      if (dataType === 'taskItem') {
        items.push(parseTaskItem(child))
      } else {
        items.push(parseListItem(child))
      }
    }
  }

  if (listType === 'bulletList' && node.getAttribute('data-type') === 'taskList') {
    return {
      type: 'taskList',
      content: items.length > 0 ? items : [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph' }] }]
    }
  }

  const result = { type: listType }
  if (listType === 'orderedList') {
    const start = node.getAttribute('start')
    if (start && parseInt(start) !== 1) {
      result.attrs = { start: parseInt(start) }
    }
  }
  result.content = items.length > 0 ? items : [{ type: 'listItem', content: [{ type: 'paragraph' }] }]

  return result
}

function parseListItem(node) {
  const children = parseChildren(node)
  // Wrap inline content in paragraphs
  const content = []
  let inlineBuffer = []

  const flushInline = () => {
    if (inlineBuffer.length > 0) {
      content.push({ type: 'paragraph', content: inlineBuffer })
      inlineBuffer = []
    }
  }

  children.forEach(child => {
    if (child.type === 'text' || child.type === 'hardBreak') {
      inlineBuffer.push(child)
    } else if (child.type === 'paragraph' || child.type === 'bulletList' || child.type === 'orderedList') {
      flushInline()
      content.push(child)
    } else if (child.marks) {
      // It's a text node with marks
      inlineBuffer.push(child)
    } else {
      flushInline()
      content.push(child)
    }
  })
  flushInline()

  return {
    type: 'listItem',
    content: content.length > 0 ? content : [{ type: 'paragraph' }]
  }
}

function parseTaskItem(node) {
  const checked = node.getAttribute('data-checked') === 'true'
  const children = parseChildren(node)
  const content = []
  let inlineBuffer = []

  const flushInline = () => {
    if (inlineBuffer.length > 0) {
      content.push({ type: 'paragraph', content: inlineBuffer })
      inlineBuffer = []
    }
  }

  children.forEach(child => {
    if (child.type === 'text' || child.type === 'hardBreak' || child.marks) {
      inlineBuffer.push(child)
    } else {
      flushInline()
      content.push(child)
    }
  })
  flushInline()

  return {
    type: 'taskItem',
    attrs: { checked },
    content: content.length > 0 ? content : [{ type: 'paragraph' }]
  }
}

function parseCodeBlock(node) {
  const codeNode = node.querySelector('code')
  const textContent = codeNode ? codeNode.textContent : node.textContent
  const language = extractLanguage(codeNode || node)

  const result = {
    type: 'codeBlock',
    content: [{ type: 'text', text: textContent || '' }]
  }
  if (language) {
    result.attrs = { language }
  }

  return result
}

function extractLanguage(node) {
  const className = node.className || ''
  const match = className.match(/language-(\w+)/)
  if (match) return match[1]

  // Check data-language attribute
  const dataLang = node.getAttribute('data-language')
  if (dataLang) return dataLang

  return ''
}

function parseTable(node) {
  const rows = []
  // Handle thead, tbody, tfoot
  const processSection = section => {
    const trs = section.querySelectorAll(':scope > tr')
    trs.forEach(tr => {
      rows.push(parseTableRow(tr))
    })
  }

  const thead = node.querySelector('thead')
  const tbody = node.querySelector('tbody')
  const tfoot = node.querySelector('tfoot')

  if (thead) processSection(thead)
  if (tbody) processSection(tbody)
  if (tfoot) processSection(tfoot)

  // Direct tr children
  if (!thead && !tbody && !tfoot) {
    const trs = node.querySelectorAll(':scope > tr')
    trs.forEach(tr => {
      rows.push(parseTableRow(tr))
    })
  }

  return {
    type: 'table',
    content: rows
  }
}

function parseTableRow(node) {
  const cells = []
  const childNodes = node.childNodes
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i]
    if (child.nodeType === 1) {
      const tagName = child.tagName.toUpperCase()
      if (tagName === 'TH') {
        cells.push(parseTableHeader(child))
      } else if (tagName === 'TD') {
        cells.push(parseTableCell(child))
      }
    }
  }

  return {
    type: 'tableRow',
    content: cells
  }
}

function parseTableHeader(node) {
  const content = parseInlineContent(node)
  return {
    type: 'tableHeader',
    content: [{ type: 'paragraph', content: content.length > 0 ? content : undefined }]
  }
}

function parseTableCell(node) {
  const content = parseInlineContent(node)
  return {
    type: 'tableCell',
    content: [{ type: 'paragraph', content: content.length > 0 ? content : undefined }]
  }
}

function parseImage(node) {
  const attrs = {
    src: node.getAttribute('src') || '',
    alt: node.getAttribute('alt') || ''
  }

  const title = node.getAttribute('title')
  if (title) attrs.title = title

  const width = node.getAttribute('width')
  const height = node.getAttribute('height')
  if (width) attrs.width = width
  if (height) attrs.height = height

  const dataHref = node.getAttribute('data-href')
  if (dataHref) attrs.dataHref = decodeURIComponent(dataHref)

  const dataHrefWidth = node.getAttribute('data-href-width')
  if (dataHrefWidth) attrs.dataHrefWidth = dataHrefWidth

  const dataHrefHeight = node.getAttribute('data-href-height')
  if (dataHrefHeight) attrs.dataHrefHeight = dataHrefHeight

  return { type: 'image', attrs }
}

function parseVideoTag(node) {
  const source = node.querySelector('source')
  const src = source ? source.getAttribute('src') : node.getAttribute('src') || ''
  return {
    type: 'video',
    attrs: {
      src,
      poster: node.getAttribute('poster') || '',
      width: node.getAttribute('width') || '',
      height: node.getAttribute('height') || ''
    }
  }
}

function parseIframe(node) {
  return {
    type: 'video',
    attrs: {
      src: node.outerHTML,
      width: node.getAttribute('width') || '',
      height: node.getAttribute('height') || ''
    }
  }
}

function parseDiv(node) {
  const weType = node.getAttribute('data-w-e-type')

  if (weType === 'video') {
    return parseVideo(node)
  }
  if (weType === 'imageGroup') {
    return parseImageGroup(node)
  }
  if (node.classList && node.classList.contains('w-e-panorama360')) {
    return parsePanorama360(node)
  }

  // Generic div - parse as block content
  const children = parseChildren(node)
  if (children.length === 0) return null
  return children
}

function parseVideo(node) {
  const iframe = node.querySelector('iframe')
  if (iframe) {
    return {
      type: 'video',
      attrs: {
        src: iframe.outerHTML,
        width: iframe.getAttribute('width') || '',
        height: iframe.getAttribute('height') || ''
      }
    }
  }

  const video = node.querySelector('video')
  if (video) {
    return parseVideoTag(video)
  }

  return null
}

function parseImageGroup(node) {
  const imgs = node.querySelectorAll('img')
  const childrenList = []

  imgs.forEach(img => {
    childrenList.push({
      src: img.getAttribute('src') || '',
      width: img.getAttribute('width') || '',
      height: img.getAttribute('height') || '',
      dataHref: img.getAttribute('data-href') || '',
      dataHrefWidth: img.getAttribute('data-href-width') || '',
      dataHrefHeight: img.getAttribute('data-href-height') || '',
      alt: img.getAttribute('alt') || ''
    })
  })

  return {
    type: 'imageGroup',
    attrs: { childrenList }
  }
}

function parsePanorama360(node) {
  const img = node.querySelector('img')
  if (!img) return null

  return {
    type: 'panorama360',
    attrs: {
      src: img.getAttribute('src') || '',
      width: img.getAttribute('width') || '100%',
      height: img.getAttribute('height') || '400px',
      dataHref: img.getAttribute('data-href') || '',
      dataHrefWidth: img.getAttribute('data-href-width') || '',
      dataHrefHeight: img.getAttribute('data-href-height') || '',
      alt: img.getAttribute('alt') || '360°全景图片'
    }
  }
}

function parseEventSpan(node) {
  return {
    type: 'eventspan',
    attrs: {
      id: node.getAttribute('data-id') || '',
      textContent: node.textContent || ''
    }
  }
}

function parseLink(node) {
  const href = node.getAttribute('href') || ''
  const target = node.getAttribute('target') || '_blank'
  const rel = node.getAttribute('rel') || 'noopener noreferrer nofollow'
  const mark = {
    type: 'link',
    attrs: { href, target, rel }
  }

  const children = parseInlineChildren(node)
  return children.map(child => {
    if (child.type === 'text') {
      const marks = child.marks ? [...child.marks, mark] : [mark]
      return { ...child, marks }
    }
    if (child.marks) {
      return { ...child, marks: [...child.marks, mark] }
    }
    return child
  })
}

function parseSpan(node) {
  const weType = node.getAttribute('data-w-e-type')

  if (weType === 'eventspan') {
    return parseEventSpan(node)
  }

  // Regular span with styles
  const marks = getTextStyleMarks(node)
  const children = parseInlineChildren(node)

  if (marks.length > 0) {
    return children.map(child => {
      if (child.type === 'text') {
        const existingMarks = child.marks || []
        return { ...child, marks: [...existingMarks, ...marks] }
      }
      if (child.marks) {
        return { ...child, marks: [...child.marks, ...marks] }
      }
      return child
    })
  }

  return children
}

function parseMark(node) {
  const bgColor = node.style.backgroundColor || ''
  const mark = {
    type: 'highlight',
    attrs: bgColor ? { color: bgColor } : {}
  }

  const children = parseInlineChildren(node)
  return children.map(child => {
    if (child.type === 'text') {
      const marks = child.marks ? [...child.marks, mark] : [mark]
      return { ...child, marks }
    }
    return child
  })
}
