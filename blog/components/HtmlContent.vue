<template>
  <div class="html-content-body">
    <div
      v-html="contentCom"
      @click.middle="onMidClick"
      @click="onClick"
      ref="htmlContent"
    ></div>
  </div>
</template>
<script setup>
import { loadAndOpenImg } from '@/utils'
import 'highlight.js/styles/base16/dracula.css'
import hljs from 'highlight.js'
// props
const props = defineProps({
  // content
  content: {
    type: String,
    default: '',
  },
})
// img标签自动添加loading="lazy"
// let htmlContent = '你的HTML内容'
// htmlContent = htmlContent.replace(
//   /<img(?!.*?loading\s*=\s*['"]lazy['"])([^>]*?)>/gi,
//   '<img loading="lazy" $1>'
// )
// console.log(htmlContent)
const contentCom = computed(() => {
  let content = props.content || ''
  content = content.replace(
    /<img(?!.*?loading\s*=\s*['"]lazy['"])([^>]*?)>/gi,
    '<img loading="lazy" $1>'
  )
  // 去掉data-href为空的data-href属性
  // content = content.replace(/data-href=""/gi, '')
  // if (divDom.value) {
  //   divDom.value.innerHTML = content
  //   const imgList = divDom.value.querySelectorAll('img')
  //   imgList.forEach((img) => {
  //     // 检查 data-href 属性是否有值
  //     if (img.getAttribute('data-href')) {
  //       // 如果 data-href 属性有值，添加 pointer 类
  //       img.classList.add('pointer')
  //     }
  //   })
  //   const newHtml = divDom.value.innerHTML
  //   // 清空 divDom
  //   divDom.value.innerHTML = ''
  //   return newHtml
  // }
  return content
})

const getImgHref = (e) => {
  const target = e.target
  // 检查是否为 img 标签
  if (target.tagName === 'IMG') {
    // 检查 data-href 属性是否有值，需要URI decode
    let dataHref = target.getAttribute('data-href')
    dataHref = dataHref ? decodeURIComponent(dataHref) : null
    if (dataHref) {
      return dataHref
    }
  }
  return ''
}
// 点击事件
const onClick = (e) => {
  const dataHref = getImgHref(e)
  if (dataHref) {
    // 正则判断是否是图片的链接 href
    const imageRegex = /\.(jpe?g|png|gif|bmp|svg|webp)$/i
    if (imageRegex.test(dataHref)) {
      // 获取实际的图片宽高
      const img = new Image()
      img.src = dataHref
      img.onload = () => {
        const imgList = [
          {
            src: dataHref,
            width: img.width,
            height: img.height,
          },
        ]
        loadAndOpenImg(0, imgList)
      }
    } else {
      // dataHref 不是图片链接
      window.open(dataHref, '_blank')
    }
  }
}
// 中键点击事件
const onMidClick = (e) => {
  const dataHref = getImgHref(e)
  if (dataHref) {
    // 新窗口打开
    window.open(dataHref, '_blank')
  }
}

const htmlContent = ref(null)

const initHljs = () => {
  const codeList = htmlContent.value.querySelectorAll('pre')
  codeList.forEach((block) => {
    // 去掉block前后的空格和空行
    block.textContent = block.textContent.trim()
    hljs.highlightBlock(block)
    const lines = (block.textContent + '\n').split('\n').length - 1
    block.setAttribute(
      'data-lines',
      Array.from({ length: lines }, (_, i) => i + 1).join('\n')
    )
  })
}

const initImgs = () => {
  const imgList = htmlContent.value.querySelectorAll('img')
  imgList.forEach((img) => {
    // 如果没有 data-href 属性，删除 href 属性
    if (!img.getAttribute('data-href')) {
      img.removeAttribute('data-href')
    }
  })
}

const init = () => {
  if (process.client && htmlContent.value) {
    nextTick(() => {
      initHljs()
      initImgs()
    })
  }
}

watch(
  () => props.content,
  () => {
    init()
  }
)

onMounted(() => {
  init()
})
</script>
<style scoped>
.html-content-body {
  padding-top: 10px;
}
</style>
<style>
.html-content-body img[data-href] {
  @apply cursor-pointer;
}
.html-content-body img {
  max-width: 100% !important;
  height: auto !important;
  display: inline;
}
.html-content-body iframe {
  max-width: 100% !important;
}
.html-content-body video {
  max-width: 100% !important;
}
.html-content-body a {
  @apply text-primary-500;
}
.html-content-body a:hover {
  @apply text-primary-500;
}
.html-content-body ul li {
  @apply list-disc list-inside;
}
.html-content-body ol li {
  @apply list-decimal list-inside;
}
.html-content-body code {
  @apply px-1 py-0.5 rounded-md bg-gray-800 text-white;
}

.html-content-body p {
  line-height: 2;
}
.html-content-body pre {
  @apply my-2 overflow-auto rounded-md bg-gray-800;
}
.html-content-body strong,
.html-content-body b {
  font-weight: 700;
}
.html-content-body pre.hljs {
  position: relative;
  padding-left: 3.5em;
}
.html-content-body pre::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.html-content-body pre::-webkit-scrollbar-thumb {
  height: 40px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0);
}
.html-content-body pre:hover::-webkit-scrollbar-thumb {
  height: 40px;
  border-radius: 4px;
  background-color: #bbb;
}

.html-content-body pre::-webkit-scrollbar-thumb:hover {
  background-color: #bbb;
}
.hljs:before {
  @apply text-primary-50;
  content: attr(data-lines);
  position: absolute;
  top: 0;
  left: 0;
  width: 3em;
  padding: 0 0.5em;
  overflow: hidden;
  letter-spacing: -1px;
  text-align: right;

  text-transform: uppercase;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.html-content-body table {
  @apply table-auto border-collapse;
}

.html-content-body td,
.html-content-body th {
  @apply border p-2;
}
</style>
