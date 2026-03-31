<template>
  <!-- text node -->
  <TiptapText v-if="node.type === 'text'" :node="node" />

  <!-- doc node: render children only -->
  <template v-else-if="node.type === 'doc'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </template>

  <!-- paragraph -->
  <p v-else-if="node.type === 'paragraph'" :style="blockStyle">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </p>

  <!-- heading -->
  <component
    v-else-if="node.type === 'heading'"
    :is="headingTag"
    :style="headingStyle"
  >
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </component>

  <!-- blockquote -->
  <blockquote v-else-if="node.type === 'blockquote'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </blockquote>

  <!-- bulletList -->
  <ul v-else-if="node.type === 'bulletList'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </ul>

  <!-- orderedList -->
  <ol v-else-if="node.type === 'orderedList'" :start="olStart">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </ol>

  <!-- listItem -->
  <li v-else-if="node.type === 'listItem'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </li>

  <!-- taskList -->
  <ul v-else-if="node.type === 'taskList'" data-type="taskList">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </ul>

  <!-- taskItem -->
  <li
    v-else-if="node.type === 'taskItem'"
    data-type="taskItem"
    :data-checked="node.attrs?.checked ? 'true' : 'false'"
  >
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </li>

  <!-- codeBlock -->
  <pre v-else-if="node.type === 'codeBlock'"><code :class="codeBlockLangClass">{{ codeBlockText }}</code></pre>

  <!-- horizontalRule -->
  <hr v-else-if="node.type === 'horizontalRule'" />

  <!-- hardBreak -->
  <br v-else-if="node.type === 'hardBreak'" />

  <!-- image -->
  <img
    v-else-if="node.type === 'image'"
    :src="node.attrs?.src || ''"
    :alt="node.attrs?.alt || ''"
    :width="node.attrs?.width || undefined"
    :height="node.attrs?.height || undefined"
    :data-href="node.attrs?.dataHref || undefined"
    :data-href-width="node.attrs?.dataHrefWidth || undefined"
    :data-href-height="node.attrs?.dataHrefHeight || undefined"
    loading="lazy"
  />

  <!-- video (iframe) -->
  <div
    v-else-if="node.type === 'video' && isIframe"
    data-w-e-type="video"
    v-html="sanitizedIframe"
  ></div>

  <!-- video (native) -->
  <div v-else-if="node.type === 'video'" data-w-e-type="video">
    <video
      :poster="node.attrs?.poster || undefined"
      playsinline="true"
      preload="none"
      muted="muted"
      loop="loop"
      controls="true"
      :width="node.attrs?.width || undefined"
      :height="node.attrs?.height || undefined"
    >
      <source :src="node.attrs?.src || ''" type="video/mp4" />
    </video>
  </div>

  <!-- table -->
  <table v-else-if="node.type === 'table'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </table>

  <!-- tableRow -->
  <tr v-else-if="node.type === 'tableRow'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </tr>

  <!-- tableHeader -->
  <th v-else-if="node.type === 'tableHeader'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </th>

  <!-- tableCell -->
  <td v-else-if="node.type === 'tableCell'">
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </td>

  <!-- eventspan -->
  <span
    v-else-if="node.type === 'eventspan'"
    data-w-e-type="eventspan"
    data-w-e-is-void
    data-w-e-is-inline
    :data-id="node.attrs?.id || ''"
    >{{ node.attrs?.textContent || '' }}</span
  >

  <!-- imageGroup -->
  <div
    v-else-if="node.type === 'imageGroup'"
    data-w-e-type="imageGroup"
    :class="imageGroupClass"
  >
    <div
      class="w-e-image-group-img-body"
      v-for="(child, i) in imageGroupChildren"
      :key="i"
    >
      <img
        class="w-e-image-group-img"
        :src="child.src || ''"
        :alt="child.alt || ''"
        :width="child.width || undefined"
        :height="child.height || undefined"
        :data-href="child.dataHref || undefined"
        :data-href-width="child.dataHrefWidth || undefined"
        :data-href-height="child.dataHrefHeight || undefined"
        loading="lazy"
      />
    </div>
  </div>

  <!-- panorama360 -->
  <div v-else-if="node.type === 'panorama360'" class="w-e-panorama360">
    <img
      class="w-e-panorama360-img"
      :src="node.attrs?.src || ''"
      :alt="node.attrs?.alt || '360°全景图片'"
      :width="node.attrs?.width || undefined"
      :height="node.attrs?.height || undefined"
      :data-href="node.attrs?.dataHref || undefined"
      :data-href-width="node.attrs?.dataHrefWidth || undefined"
      :data-href-height="node.attrs?.dataHrefHeight || undefined"
      data-type="panorama360"
      loading="lazy"
    />
  </div>

  <!-- contentBlock -->
  <TiptapContentBlock
    v-else-if="node.type === 'contentBlock'"
    :blockType="node.attrs?.blockType || ''"
    :blockId="node.attrs?.blockId || ''"
    :blockTitle="node.attrs?.blockTitle || ''"
  />

  <!-- fallback: render children -->
  <template v-else>
    <TiptapNode v-for="(child, i) in children" :key="i" :node="child" />
  </template>
</template>

<script setup>
const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

const sanitizeCssValue = (value) => {
  if (!value) return ''
  return String(value)
    .replace(/[;{}\\<>()'"]/g, '')
    .replace(/expression/gi, '')
    .replace(/javascript/gi, '')
    .replace(/url\s*\(/gi, '')
    .trim()
}

const children = computed(() => props.node.content || [])

// paragraph / heading styles
const blockStyle = computed(() => {
  const attrs = props.node.attrs || {}
  const style = {}
  if (attrs.textAlign && attrs.textAlign !== 'left') {
    style.textAlign = sanitizeCssValue(attrs.textAlign)
  }
  if (attrs.lineHeight) {
    style.lineHeight = sanitizeCssValue(attrs.lineHeight)
  }
  if (attrs.indent && attrs.indent > 0) {
    const indent = parseInt(attrs.indent) || 0
    style.marginLeft = `${indent * 2}em`
  }
  return style
})

const headingTag = computed(() => {
  const level = Math.max(1, Math.min(6, parseInt(props.node.attrs?.level) || 1))
  return `h${level}`
})

const headingStyle = computed(() => {
  const attrs = props.node.attrs || {}
  const style = {}
  if (attrs.textAlign && attrs.textAlign !== 'left') {
    style.textAlign = sanitizeCssValue(attrs.textAlign)
  }
  return style
})

// orderedList
const olStart = computed(() => {
  const start = props.node.attrs?.start || 1
  return start !== 1 ? start : undefined
})

// codeBlock
const codeBlockLangClass = computed(() => {
  const language = props.node.attrs?.language || ''
  return language ? `language-${language}` : undefined
})

const codeBlockText = computed(() => {
  return (props.node.content || []).map((n) => n.text || '').join('')
})

// video iframe detection
const isIframe = computed(() => {
  const src = props.node.attrs?.src || ''
  return src.trim().startsWith('<iframe')
})

const sanitizedIframe = computed(() => {
  if (!isIframe.value) return ''
  const src = props.node.attrs?.src || ''
  if (!import.meta.client) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = src
  const iframe = tempDiv.querySelector('iframe')
  if (!iframe) return ''
  const iframeSrc = iframe.getAttribute('src') || ''
  const iframeWidth = iframe.getAttribute('width') || ''
  const iframeHeight = iframe.getAttribute('height') || ''
  const iframeStyle = iframe.getAttribute('style') || ''
  const safeSrc = String(iframeSrc).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeWidth = String(iframeWidth).replace(/"/g, '&quot;')
  const safeHeight = String(iframeHeight).replace(/"/g, '&quot;')
  const safeStyle = sanitizeCssValue(iframeStyle)
  return `<iframe src="${safeSrc}" width="${safeWidth}" height="${safeHeight}" style="${safeStyle}" frameborder="0" allowfullscreen="true" scrolling="no"></iframe>`
})

// imageGroup
const imageGroupChildren = computed(() => {
  return props.node.attrs?.childrenList || []
})

const imageGroupClass = computed(() => {
  const list = imageGroupChildren.value
  let className = 'w-e-image-group'
  if (list.length % 2 === 0) {
    className += ' w-e-image-group-even'
  } else {
    className += ' w-e-image-group-odd'
  }
  return className
})
</script>
