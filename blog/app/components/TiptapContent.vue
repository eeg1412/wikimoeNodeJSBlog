<template>
  <div
    class="html-content-body"
    :class="{
      'is-loading': !initFlag
    }"
  >
    <div
      v-html="renderedHtml"
      @click.middle="onMidClick"
      @click="onClick"
      ref="htmlContent"
    ></div>
    <div
      class="fixed inset-0 flex items-center justify-center z-50 img-image-load-animate"
      v-if="contentIsLoading"
    >
      <div class="flex items-center justify-center bg-white p-2 rounded shadow">
        <WUIIcon
          class="img-loading-icon animate-spin text-primary-500"
          name="i-heroicons-arrow-path"
        /><span class="pl-2">加载中...</span>
      </div>
    </div>
  </div>
  <EventDialog v-model:show="eventOpen" :currentData="currentEventData" />
</template>
<script setup>
import { getEventDetailApiFetch } from '@/api/event'
import 'highlight.js/styles/base16/dracula.css'

const { pswpIsOpen } = usePswpIsOpen()
const toast = useWToast()

const props = defineProps({
  contentJson: {
    type: Object,
    default: null
  }
})

const componentNameLower = 'tiptapcontent'

const route = useRoute()
const router = useRouter()

// Sanitize CSS values to prevent CSS injection
const sanitizeCssValue = (value) => {
  if (!value) return ''
  // Remove anything that could be used for CSS injection
  return String(value).replace(/[;{}\\<>()'"]/g, '').replace(/expression/gi, '').replace(/javascript/gi, '').replace(/url\s*\(/gi, '').trim()
}

const sanitizeAttrValue = (value) => {
  if (!value) return ''
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Render Tiptap JSON to HTML
const renderNode = (node) => {
  if (!node) return ''

  if (node.type === 'text') {
    let html = (node.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    if (node.marks) {
      node.marks.forEach(mark => {
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
            const href = sanitizeAttrValue(mark.attrs?.href || '')
            const target = mark.attrs?.target || '_blank'
            const rel = mark.attrs?.rel || 'noopener noreferrer nofollow'
            html = `<a href="${href}" target="${sanitizeAttrValue(target)}" rel="${sanitizeAttrValue(rel)}">${html}</a>`
            break
          }
          case 'textStyle': {
            const styles = []
            if (mark.attrs?.color) styles.push(`color: ${sanitizeCssValue(mark.attrs.color)}`)
            if (mark.attrs?.fontSize) styles.push(`font-size: ${sanitizeCssValue(mark.attrs.fontSize)}`)
            if (mark.attrs?.fontFamily) styles.push(`font-family: ${sanitizeCssValue(mark.attrs.fontFamily)}`)
            if (styles.length > 0) {
              html = `<span style="${styles.join('; ')}">${html}</span>`
            }
            break
          }
          case 'highlight': {
            const color = sanitizeCssValue(mark.attrs?.color || '')
            if (color) {
              html = `<mark style="background-color: ${color}">${html}</mark>`
            } else {
              html = `<mark>${html}</mark>`
            }
            break
          }
        }
      })
    }
    return html
  }

  const children = (node.content || []).map(renderNode).join('')

  switch (node.type) {
    case 'doc':
      return children
    case 'paragraph': {
      const attrs = node.attrs || {}
      const styles = []
      if (attrs.textAlign && attrs.textAlign !== 'left') {
        styles.push(`text-align: ${sanitizeCssValue(attrs.textAlign)}`)
      }
      if (attrs.lineHeight) {
        styles.push(`line-height: ${sanitizeCssValue(attrs.lineHeight)}`)
      }
      if (attrs.indent && attrs.indent > 0) {
        const indent = parseInt(attrs.indent) || 0
        styles.push(`margin-left: ${indent * 2}em`)
      }
      const styleStr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''
      return `<p${styleStr}>${children}</p>`
    }
    case 'heading': {
      const level = Math.max(1, Math.min(6, parseInt(node.attrs?.level) || 1))
      const attrs = node.attrs || {}
      const styles = []
      if (attrs.textAlign && attrs.textAlign !== 'left') {
        styles.push(`text-align: ${sanitizeCssValue(attrs.textAlign)}`)
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
      const checked = node.attrs?.checked
      return `<li data-type="taskItem" data-checked="${checked ? 'true' : 'false'}">${children}</li>`
    }
    case 'codeBlock': {
      const language = sanitizeCssValue(node.attrs?.language || '')
      const langClass = language ? ` class="language-${language}"` : ''
      const codeContent = (node.content || []).map(n => (n.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('')
      return `<pre><code${langClass}>${codeContent}</code></pre>`
    }
    case 'horizontalRule':
      return '<hr>'
    case 'hardBreak':
      return '<br>'
    case 'image': {
      const attrs = node.attrs || {}
      const src = sanitizeAttrValue(attrs.src || '')
      const alt = sanitizeAttrValue(attrs.alt || '')
      const width = attrs.width ? ` width="${sanitizeAttrValue(String(attrs.width))}"` : ''
      const height = attrs.height ? ` height="${sanitizeAttrValue(String(attrs.height))}"` : ''
      const dataHref = attrs.dataHref ? ` data-href="${sanitizeAttrValue(attrs.dataHref)}"` : ''
      const dataHrefWidth = attrs.dataHrefWidth ? ` data-href-width="${sanitizeAttrValue(String(attrs.dataHrefWidth))}"` : ''
      const dataHrefHeight = attrs.dataHrefHeight ? ` data-href-height="${sanitizeAttrValue(String(attrs.dataHrefHeight))}"` : ''
      return `<img src="${src}" alt="${alt}"${width}${height}${dataHref}${dataHrefWidth}${dataHrefHeight} loading="lazy">`
    }
    case 'video': {
      const attrs = node.attrs || {}
      const src = attrs.src || ''
      if (src.trim().startsWith('<iframe')) {
        // Sanitize iframe: only allow specific attributes
        const tempDiv = import.meta.client ? document.createElement('div') : null
        if (tempDiv) {
          tempDiv.innerHTML = src
          const iframe = tempDiv.querySelector('iframe')
          if (iframe) {
            const iframeSrc = iframe.getAttribute('src') || ''
            const iframeWidth = iframe.getAttribute('width') || ''
            const iframeHeight = iframe.getAttribute('height') || ''
            const iframeStyle = iframe.getAttribute('style') || ''
            return `<div data-w-e-type="video"><iframe src="${sanitizeAttrValue(iframeSrc)}" width="${sanitizeAttrValue(iframeWidth)}" height="${sanitizeAttrValue(iframeHeight)}" style="${sanitizeCssValue(iframeStyle)}" frameborder="0" allowfullscreen="true" scrolling="no"></iframe></div>`
          }
        }
        return ''
      }
      const poster = attrs.poster ? ` poster="${sanitizeAttrValue(attrs.poster)}"` : ''
      const width = attrs.width ? ` width="${sanitizeAttrValue(String(attrs.width))}"` : ''
      const height = attrs.height ? ` height="${sanitizeAttrValue(String(attrs.height))}"` : ''
      return `<div data-w-e-type="video"><video${poster} playsinline="true" preload="none" muted="muted" loop="loop" controls="true"${width}${height}><source src="${sanitizeAttrValue(src)}" type="video/mp4"/></video></div>`
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
      const id = sanitizeAttrValue(attrs.id || '')
      const textContent = (attrs.textContent || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
        const imgSrc = sanitizeAttrValue(child.src || '')
        const imgWidth = child.width ? ` width="${sanitizeAttrValue(String(child.width))}"` : ''
        const imgHeight = child.height ? ` height="${sanitizeAttrValue(String(child.height))}"` : ''
        const imgDataHref = child.dataHref ? ` data-href="${sanitizeAttrValue(child.dataHref)}"` : ''
        const imgDataHrefWidth = child.dataHrefWidth ? ` data-href-width="${sanitizeAttrValue(String(child.dataHrefWidth))}"` : ''
        const imgDataHrefHeight = child.dataHrefHeight ? ` data-href-height="${sanitizeAttrValue(String(child.dataHrefHeight))}"` : ''
        const imgAlt = sanitizeAttrValue(child.alt || '')
        html += `<div class="w-e-image-group-img-body"><img src="${imgSrc}" class="w-e-image-group-img"${imgWidth}${imgHeight}${imgDataHref}${imgDataHrefWidth}${imgDataHrefHeight} alt="${imgAlt}" loading="lazy" /></div>`
      })
      html += '</div>'
      return html
    }
    case 'panorama360': {
      const attrs = node.attrs || {}
      const src = sanitizeAttrValue(attrs.src || '')
      const width = attrs.width ? ` width="${sanitizeAttrValue(String(attrs.width))}"` : ''
      const height = attrs.height ? ` height="${sanitizeAttrValue(String(attrs.height))}"` : ''
      const dataHref = attrs.dataHref ? ` data-href="${sanitizeAttrValue(attrs.dataHref)}"` : ''
      const dataHrefWidth = attrs.dataHrefWidth ? ` data-href-width="${sanitizeAttrValue(String(attrs.dataHrefWidth))}"` : ''
      const dataHrefHeight = attrs.dataHrefHeight ? ` data-href-height="${sanitizeAttrValue(String(attrs.dataHrefHeight))}"` : ''
      const alt = sanitizeAttrValue(attrs.alt || '360°全景图片')
      return `<div class="w-e-panorama360"><img src="${src}" class="w-e-panorama360-img"${width}${height}${dataHref}${dataHrefWidth}${dataHrefHeight} alt="${alt}" data-type="panorama360" loading="lazy" /></div>`
    }
    default:
      return children
  }
}

const renderedHtml = computed(() => {
  if (!props.contentJson) return ''
  return renderNode(props.contentJson)
})

// Reuse the same event handling from HtmlContent.vue
const getImgHref = e => {
  const target = e.target
  if (target.tagName === 'IMG') {
    let dataHref = target.getAttribute('data-href')
    dataHref = dataHref ? decodeURIComponent(dataHref) : null
    if (dataHref) {
      return dataHref
    }
  }
  return ''
}
const getImgWidAndHeight = e => {
  const target = e.target
  if (target.tagName === 'IMG') {
    const width = target.getAttribute('data-href-width')
    const height = target.getAttribute('data-href-height')
    if (width && height) {
      const numRegex = /^\d+$/
      if (numRegex.test(width) && numRegex.test(height)) {
        return {
          width: Number(width),
          height: Number(height)
        }
      }
    }
  }
  return {
    width: null,
    height: null
  }
}
const findATag = e => {
  let target = e.target
  while (target) {
    if (target.tagName === 'A') {
      return target
    }
    target = target.parentNode
  }
  return null
}
const contentIsLoading = ref(false)

const onClick = async e => {
  const tag = e.target.tagName
  const aTag = findATag(e)
  if (!aTag) {
    switch (tag) {
      case 'IMG':
        clickOnImg(e)
        break
      case 'SPAN':
        clickOnSpan(e)
        break
      default:
        break
    }
  }
}
const clickOnSpan = e => {
  const dataWType = e.target.getAttribute('data-w-e-type') || ''
  switch (dataWType) {
    case 'eventspan':
      getEventDetail(e)
      break
    default:
      break
  }
}
const getMediaList = () => {
  const mediaList = Array.from(htmlContent.value.querySelectorAll('img, video'))
  return mediaList
}
const getIndex = (mediaList, e) => {
  const index = mediaList.findIndex(media => {
    return media === e.target
  })
  return index
}
const getImgList = mediaList => {
  const imgList = []
  mediaList.forEach(media => {
    let src = ''
    let width = null
    let height = null
    let mimetype = ''
    let thumfor = ''
    let is360Panorama = false
    if (media.tagName === 'IMG') {
      const imgE = { target: media }
      const imgWidAndHeight = getImgWidAndHeight(imgE)
      is360Panorama =
        media.getAttribute('data-type') === 'panorama360' ? true : false
      thumfor = media.src
      src = getImgHref(imgE) || media.src
      width = imgWidAndHeight.width || null
      height = imgWidAndHeight.height || null
      mimetype = 'image'
    } else if (media.tagName === 'VIDEO') {
      const source = media.querySelector('source')
      src = source ? source.src : media.src
      width = media.width || null
      height = media.height || null
      thumfor = media.poster
      mimetype = 'video'
    }
    imgList.push({
      src,
      width,
      height,
      mimetype,
      thumfor,
      is360Panorama
    })
  })
  return imgList
}
const getImgListHash = (imgList = undefined) => {
  if (!imgList) {
    const mediaList = getMediaList()
    imgList = getImgList(mediaList)
  }
  const imgListHash = getImgListHashFromImgList(imgList)
  return {
    imgListHash,
    imgList
  }
}
const clickOnImg = e => {
  const dataHref = getImgHref(e) || e.target?.src || ''
  const imageRegex = /\.(jpe?g|png|gif|bmp|svg|webp)$/i
  const dataHrefNoQuery = dataHref.split('?')[0]
  if (imageRegex.test(dataHrefNoQuery)) {
    const mediaList = getMediaList()
    const index = getIndex(mediaList, e)
    const imgList = getImgList(mediaList)
    const { imgListHash } = getImgListHash(imgList)
    openPhotoSwipe(imgList, index, undefined, imgListHash, componentNameLower)
  } else {
    if (dataHref) {
      window.open(dataHref, '_blank')
    }
  }
}
const onMidClick = e => {
  const tag = e.target.tagName
  const aTag = findATag(e)
  if (tag === 'IMG' && !aTag) {
    const dataHref = getImgHref(e) || e.target.src
    if (dataHref) {
      window.open(dataHref, '_blank')
    }
  }
}

const eventOpen = ref(false)
const currentEventData = ref(null)
const getEventDetail = async e => {
  contentIsLoading.value = true
  const id = e.target.getAttribute('data-id')
  getEventDetailApiFetch({
    id
  })
    .then(res => {
      currentEventData.value = res.data
      eventOpen.value = true
    })
    .catch(err => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach(item => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red'
          })
        })
      }
    })
    .finally(() => {
      contentIsLoading.value = false
    })
}

const htmlContent = ref(null)
const codeCopyListeners = []
let hljs = null
const loadhljs = async () => {
  if (hljs) return
  hljs = (await import('@/utils/highlight-bundle')).default
}
const initHljs = async () => {
  const preList = htmlContent.value.querySelectorAll('pre')
  if (preList.length === 0) return

  await loadhljs()

  preList.forEach(pre => {
    let codeBlock = pre.querySelector('code')
    if (!codeBlock) {
      const code = document.createElement('code')
      code.textContent = pre.textContent
      code.className = pre.className
      pre.innerHTML = ''
      pre.appendChild(code)
      pre.removeAttribute('class')
      codeBlock = code
    }

    const regex = /language-/
    const hasLanguageClass = regex.test(codeBlock.className)
    codeBlock.textContent = codeBlock.textContent.trim()
    hljs.highlightElement(codeBlock)
    const result = codeBlock.result
    let language = 'code'
    if (hasLanguageClass) {
      language = result?.language || 'code'
    }
    const lines = (codeBlock.textContent + '\n').split('\n').length - 1
    codeBlock.setAttribute(
      'data-lines',
      Array.from({ length: lines }, (_, i) => i + 1).join('\n')
    )
    const div = document.createElement('div')
    div.classList.add('code-header')
    const copyBtn = document.createElement('button')
    copyBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>'
    copyBtn.classList.add('code-copy-btn')

    const copyHandler = async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent)
        toast.add({
          title: '复制成功',
          icon: 'i-heroicons-check-circle',
          color: 'green'
        })
      } catch (error) {
        toast.add({
          title: '复制失败',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }
    }
    copyBtn.addEventListener('click', copyHandler)
    codeCopyListeners.push({ btn: copyBtn, handler: copyHandler })

    const languageSpan = document.createElement('span')
    languageSpan.textContent = language
    languageSpan.classList.add('code-language')
    div.appendChild(languageSpan)
    div.appendChild(copyBtn)
    pre.prepend(div)
  })
}

const initImgs = () => {
  const imgList = htmlContent.value.querySelectorAll('img')
  imgList.forEach(img => {
    if (!img.getAttribute('data-href')) {
      img.removeAttribute('data-href')
    }
    img.classList.add('common-focus-visible-btn-outline')
    img.tabIndex = 0
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        clickOnImg(e)
      }
    })
  })
}
const initSpans = () => {
  const spanList = htmlContent.value.querySelectorAll(
    'span[data-w-e-type="eventspan"]'
  )
  spanList.forEach(span => {
    span.classList.add('common-focus-visible-btn-outline')
    span.tabIndex = 0
    span.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        clickOnSpan(e)
      }
    })
  })
}

const initFlag = ref(false)

const init = () => {
  if (import.meta.client && htmlContent.value) {
    nextTick(async () => {
      await initHljs()
      initImgs()
      initSpans()
      if (!initFlag.value) {
        initFlag.value = true
      }
    })
  }
}

watch(
  () => props.contentJson,
  () => {
    init()
  },
  { deep: true }
)

const cleanup = () => {
  codeCopyListeners.forEach(({ btn, handler }) => {
    btn.removeEventListener('click', handler)
  })
  codeCopyListeners.length = 0
}

const checkPswp = () => {
  const { pswpopen, pswphash, pswpcomponent, pswpindex = 0 } = route.query
  if (
    pswpopen === '1' &&
    pswpcomponent === componentNameLower &&
    pswpIsOpen.value === false
  ) {
    const { imgListHash, imgList } = getImgListHash()
    if (pswphash === imgListHash && imgList.length > 0) {
      let index = Number(pswpindex)
      if (isNaN(index) || index < 0 || index >= imgList.length) {
        index = 0
      }
      openPhotoSwipe(imgList, index, undefined, imgListHash, componentNameLower)
    }
  }
}

watch(
  () => route.query.pswpopen,
  (newVal, oldVal) => {
    if (newVal === '1' && oldVal !== '1') {
      checkPswp()
    }
  }
)

onMounted(() => {
  init()
  nextTick(() => {
    checkPswp()
  })
})

onUnmounted(() => {
  cleanup()
  if (hljs) {
    hljs = null
  }
})
</script>
<style scoped>
.html-content-body {
  padding-top: 10px;
}
.img-loading-icon {
  font-size: 24px;
}

.img-image-load-animate {
  animation: imgLoad 0.5s 1s forwards;
}
.img-image-load-animate {
  opacity: 0;
}
@keyframes imgLoad {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
