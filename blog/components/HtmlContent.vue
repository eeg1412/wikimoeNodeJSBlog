<template>
  <div
    class="html-content-body"
    :class="{
      'is-loading': !initFlag,
    }"
    :id="componentUUID"
  >
    <div
      v-html="contentCom"
      @click.middle="onMidClick"
      @click="onClick"
      ref="htmlContent"
    ></div>
    <!-- v-if="contentIsLoading" -->
    <div
      class="fixed inset-0 flex items-center justify-center z-50 img-image-load-animate"
      v-if="contentIsLoading"
    >
      <div class="flex items-center justify-center bg-white p-2 rounded shadow">
        <UIcon
          class="img-loading-icon animate-spin text-primary-500"
          name="i-heroicons-arrow-path"
        /><span class="pl-2">加载中...</span>
      </div>
    </div>
  </div>
  <EventDialog v-model:show="eventOpen" :currentData="currentEventData" />
  <ClientOnly>
    <Teleport
      v-for="(item, index) in albumList"
      :key="item.id"
      :to="`#${componentUUID} #photoswiper-${item.id}`"
    >
      <div class="html-content-swiper-body">
        <Swiper
          :modules="[SwiperAutoplay, SwiperPagination, SwiperMousewheel]"
          :slides-per-view="1"
          :mousewheel="{
            releaseOnEdges: true,
          }"
          :pagination="{
            type: 'fraction',
          }"
          @slideChangeTransitionStart="slideChangeTransitionStart"
          @slideChangeTransitionEnd="slideChangeTransitionEnd"
        >
          <SwiperSlide
            v-for="(attachment, index) in item.list"
            :key="attachment._id"
          >
            <template v-if="attachment.mimetype.includes('video')">
              <video
                controls
                :poster="attachment.thumfor || attachment.filepath"
                :id="`${componentUUID}-${attachment._id}`"
                :data-id="attachment._id"
                preload="none"
                muted
                loop
                playsinline
              >
                <source :src="`${attachment.filepath}`" type="video/mp4" />
              </video>
            </template>
            <WikimoeImage
              class="top-banner-list-item-img"
              :src="attachment.filepath"
              :alt="attachment.name"
              fit="contain"
              loading="lazy"
              v-else
            />
          </SwiperSlide>
        </Swiper>
      </div>
    </Teleport>
  </ClientOnly>
</template>
<script setup>
import { getEventDetailApiFetch } from '@/api/event'
import 'highlight.js/styles/base16/dracula.css'
import hljs from 'highlight.js'
import { getAttachmentListApiFetch } from '@/api/attachment'

const toast = useToast()
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
  // 如果最后是<p><br></p> 则去掉
  content = content.replace(/<p><br><\/p>$/gi, '')
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
const getImgWidAndHeight = (e) => {
  const target = e.target
  // 检查是否为 img 标签
  if (target.tagName === 'IMG') {
    // 查看img标签是否包含width和height属性
    const width = target.getAttribute('data-href-width')
    const height = target.getAttribute('data-href-height')
    // 如果包含正则检查是否为数字
    if (width && height) {
      const numRegex = /^\d+$/
      if (numRegex.test(width) && numRegex.test(height)) {
        // 如果是数字，返回宽高的number
        return {
          width: Number(width),
          height: Number(height),
        }
      }
    }
  }
  return {
    width: null,
    height: null,
  }
}
const findATag = (e) => {
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

// 点击事件
const onClick = async (e) => {
  const tag = e.target.tagName
  const aTag = findATag(e)
  if (!aTag) {
    switch (tag) {
      case 'IMG':
        clickOnImg(e)
        break
      // span
      case 'SPAN':
        clickOnSpan(e)
        break

      default:
        break
    }
  }
}
const clickOnSpan = (e) => {
  // 获取span标签的data-w-e-type属性
  const dataWType = e.target.getAttribute('data-w-e-type') || ''
  switch (dataWType) {
    case 'eventspan':
      getEventDetail(e)
      break

    default:
      break
  }
}
const clickOnImg = (e) => {
  const dataHref = getImgHref(e) || e.target?.src || ''
  const imageRegex = /\.(jpe?g|png|gif|bmp|svg|webp)$/i
  // 去掉dataHref的?后面的参数
  const dataHrefNoQuery = dataHref.split('?')[0]
  if (imageRegex.test(dataHrefNoQuery)) {
    // 获取htmlContent下的所有img和video标签，按照它们在htmlContent中的顺序
    const mediaList = Array.from(
      htmlContent.value.querySelectorAll('img, video')
    )
    // 获取当前点击的img标签在mediaList中的索引
    const index = mediaList.findIndex((media) => {
      return media === e.target
    })

    const imgList = []

    mediaList.forEach((media) => {
      let src = ''
      let width = null
      let height = null
      let mimetype = ''
      let thumfor = ''
      if (media.tagName === 'IMG') {
        const imgE = {
          target: media,
        }
        const imgWidAndHeight = getImgWidAndHeight(imgE)
        thumfor = media.src
        src = getImgHref(imgE) || media.src
        width = imgWidAndHeight.width || null
        height = imgWidAndHeight.height || null
        mimetype = 'image'
      } else if (media.tagName === 'VIDEO') {
        // 获取source标签的src
        const source = media.querySelector('source')
        src = source.src || media.src
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
      })
    })
    openPhotoSwipe(imgList, index)
  } else {
    // 新窗口
    if (dataHref) {
      window.open(dataHref, '_blank')
    }
  }
}
// 中键点击事件
const onMidClick = (e) => {
  const tag = e.target.tagName
  const aTag = findATag(e)
  if (tag === 'IMG' && !aTag) {
    const dataHref = getImgHref(e) || e.target.src
    if (dataHref) {
      // 新窗口打开
      window.open(dataHref, '_blank')
    }
  }
}

const eventOpen = ref(false)
const currentEventData = ref(null)
const getEventDetail = async (e) => {
  contentIsLoading.value = true
  const id = e.target.getAttribute('data-id')
  getEventDetailApiFetch({
    id,
  })
    .then((res) => {
      currentEventData.value = res.data
      eventOpen.value = true
    })
    .catch((err) => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach((item) => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
          })
        })
      }
    })
    .finally(() => {
      contentIsLoading.value = false
    })
}

const htmlContent = ref(null)

const initHljs = () => {
  const preList = htmlContent.value.querySelectorAll('pre')
  preList.forEach((pre) => {
    let codeBlock = pre.querySelector('code')
    if (!codeBlock) {
      // 在pre标签中没有找到code标签，将pre标签的内容用code标签包裹
      const code = document.createElement('code')
      code.textContent = pre.textContent
      // 将pre的class赋值给code
      code.className = pre.className
      pre.innerHTML = ''
      pre.appendChild(code)
      // 去掉pre的class
      pre.removeAttribute('class')
      codeBlock = code
    }

    // 查看codeBlock是否有lang-xxx的class
    const regex = /language-/
    const hasLanguageClass = regex.test(codeBlock.className)
    // 去掉block前后的空格和空行
    codeBlock.textContent = codeBlock.textContent.trim()
    hljs.highlightBlock(codeBlock)
    const result = codeBlock.result
    let language = 'code'
    if (hasLanguageClass) {
      language = result.language || 'code'
    }
    const lines = (codeBlock.textContent + '\n').split('\n').length - 1
    codeBlock.setAttribute(
      'data-lines',
      Array.from({ length: lines }, (_, i) => i + 1).join('\n')
    )
    // 添加显示代码语言的功能
    const div = document.createElement('div')
    // class
    div.classList.add('code-header')
    // 复制按钮
    const copyBtn = document.createElement('button')
    copyBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>'
    copyBtn.classList.add('code-copy-btn')
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent)
        toast.add({
          title: '复制成功',
          icon: 'i-heroicons-check-circle',
          color: 'green',
        })
      } catch (error) {
        toast.add({
          title: '复制失败',
          icon: 'i-heroicons-x-circle',
          color: 'red',
        })
      }
    })
    // 代码语言
    const languageSpan = document.createElement('span')
    languageSpan.textContent = language
    // css
    languageSpan.classList.add('code-language')
    div.appendChild(languageSpan)

    div.appendChild(copyBtn)
    pre.prepend(div)
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

// photoswiper
const initPhotoswiper = () => {
  // 寻找 data-w-e-type="photoswiper" 的元素
  const photoswiperList = htmlContent.value.querySelectorAll(
    '[data-w-e-type="photoswiper"]'
  )
  console.log(photoswiperList)
  const promiseArrary = []
  // 遍历 photoswiperList
  photoswiperList.forEach((photoswiper) => {
    // 获取data-id属性
    const id = photoswiper.getAttribute('data-id')
    if (id) {
      // 获取图片列表
      promiseArrary.push(getAttachmentList(id))
    }
  })
}

const albumList = ref([])
const getAttachmentList = async (id) => {
  const res = await getAttachmentListApiFetch({
    album: id,
  }).catch((err) => {
    console.log(err)
    return null
  })

  if (res) {
    albumList.value = albumList.value.concat({
      id,
      list: res.data,
    })
  }
}

const slideChangeTransitionStart = (e) => {
  console.log('slideChangeTransitionStart', e)
}
const slideChangeTransitionEnd = (e) => {
  console.log('slideChangeTransitionEnd', e)
  const hostEl = e.hostEl
  // 让hostEl下的所有video标签暂停
  const videoList = hostEl.querySelectorAll('video')
  videoList.forEach((video) => {
    video.pause()
    // 设为静音
    video.muted = true
  })
  // 找到hostEl下的swiper-slide-active的video标签
  const activeVideo = hostEl.querySelector('.swiper-slide-active video')
  if (activeVideo) {
    activeVideo.play()
  }
}

const initFlag = ref(false)

const init = () => {
  if (process.client && htmlContent.value) {
    nextTick(() => {
      initHljs()
      initImgs()
      initPhotoswiper()
      if (!initFlag.value) {
        initFlag.value = true
      }
    })
  }
}

watch(
  () => props.content,
  () => {
    init()
  }
)

const componentUUID = ref('')

onMounted(() => {
  init()
  componentUUID.value = `html-${uuid()}`
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
/* CSS动画3秒钟后才让不透明度从0变为1 */
@keyframes imgLoad {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
.html-content-swiper-body {
  width: 100%;
  height: 100%;
}
</style>
<style>
.html-content-body img {
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
.html-content-body h1,
.html-content-body h2,
.html-content-body h3,
.html-content-body h4,
.html-content-body h5,
.html-content-body h6 {
  font-weight: bold;
}
.html-content-body a {
  @apply text-primary-500;
  word-break: break-all;
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
  isolation: isolate;
  position: relative;
}
.html-content-body.is-loading pre {
  padding-left: 3.5em;
  padding-top: 2.5rem;
  padding-bottom: 0.6em;
  padding-right: 1em;
  color: #ffffff;
}
.html-content-body strong,
.html-content-body b {
  font-weight: 700;
}
.html-content-body pre code.hljs {
  position: relative;
  padding-left: 3.5em;
  padding-top: 2.5rem;
  padding-bottom: 0.6em;
  padding-right: 1em;
}
/* blockquote */
.html-content-body blockquote {
  @apply border-l-4 border-primary-200 p-2 mt-2 mb-2 text-primary-400 bg-primary-50 rounded-md;
}
.html-content-body pre code::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.html-content-body pre code::-webkit-scrollbar-thumb {
  height: 40px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0);
}
.html-content-body pre code:hover::-webkit-scrollbar-thumb {
  height: 40px;
  border-radius: 4px;
  background-color: #bbb;
}

.html-content-body pre code::-webkit-scrollbar-thumb:hover {
  background-color: #bbb;
}
.hljs:before {
  @apply text-primary-50;
  content: attr(data-lines);
  position: absolute;
  top: 2.5rem;
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
  border-right: 1px solid #ffffff;
}
.html-content-body table {
  @apply table-auto border-collapse;
}

.html-content-body td,
.html-content-body th {
  @apply border p-2;
}
.html-content-body span[data-w-e-type='eventspan'] {
  @apply text-primary-500 cursor-pointer;
}
.code-header {
  @apply text-white text-sm bg-gray-900;
  padding: 0.2em 0.5em;
  border-bottom: 1px solid #d1d5db;
  display: flex;
  /* 垂直居中 */
  align-items: center;
  justify-content: space-between;
  height: 2rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
}
.code-header svg {
  width: 16px;
  height: 16px;
  fill: #ffffff;
}
.code-copy-btn {
  margin-right: 0.25rem;
}
.code-language {
  margin-left: 0.25rem;
  font-size: 0.9rem;
}

.html-content-swiper-body .swiper {
  width: 100%;
  height: 100%;
}
.html-content-swiper-body .swiper .wikimoe-image {
  width: 100%;
  height: 100% !important;
}
.html-content-swiper-body .swiper video {
  width: 100%;
  height: 100%;
}
</style>
