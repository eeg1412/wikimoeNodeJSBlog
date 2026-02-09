<template>
  <div
    class="html-content-body"
    :class="{
      'is-loading': !initFlag
    }"
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
// props
const props = defineProps({
  // content
  content: {
    type: String,
    default: ''
  }
})

const componentNameLower = 'htmlcontent'

const route = useRoute()
const router = useRouter()
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

const getImgHref = e => {
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
const getImgWidAndHeight = e => {
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

// 点击事件
const onClick = async e => {
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
const clickOnSpan = e => {
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
      const imgE = {
        target: media
      }
      const imgWidAndHeight = getImgWidAndHeight(imgE)
      is360Panorama =
        media.getAttribute('data-type') === 'panorama360' ? true : false
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
      is360Panorama
    })
  })
  return imgList
}
const getImgListHash = (imgList = undefined) => {
  // console.time('getImgListHash')
  if (!imgList) {
    const mediaList = getMediaList()
    imgList = getImgList(mediaList)
  }

  const imgListHash = getImgListHashFromImgList(imgList)

  console.log('imgListHash:', imgListHash)
  // console.timeEnd('getImgListHash')
  return {
    imgListHash,
    imgList
  }
}
const clickOnImg = e => {
  const dataHref = getImgHref(e) || e.target?.src || ''
  const imageRegex = /\.(jpe?g|png|gif|bmp|svg|webp)$/i
  // 去掉dataHref的?后面的参数
  const dataHrefNoQuery = dataHref.split('?')[0]
  if (imageRegex.test(dataHrefNoQuery)) {
    // 获取htmlContent下的所有img和video标签，按照它们在htmlContent中的顺序
    const mediaList = getMediaList()
    // 获取当前点击的img标签在mediaList中的索引
    const index = getIndex(mediaList, e)

    const imgList = getImgList(mediaList)
    const { imgListHash } = getImgListHash(imgList)
    openPhotoSwipe(imgList, index, undefined, imgListHash, componentNameLower)
  } else {
    // 新窗口
    if (dataHref) {
      window.open(dataHref, '_blank')
    }
  }
}
// 中键点击事件
const onMidClick = e => {
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
// 记录所有动态添加的事件监听器
const codeCopyListeners = []
let hljs = null
const loadhljs = async () => {
  if (hljs) return // 如果 hljs 已经加载过了，就不再加载
  // 动态加载 highlight.js 及所需语言
  hljs = (await import('@/utils/highlight-bundle')).default
}
const initHljs = async () => {
  const preList = htmlContent.value.querySelectorAll('pre')
  if (preList.length === 0) return

  await loadhljs()

  preList.forEach(pre => {
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
    // 添加显示代码语言的功能
    const div = document.createElement('div')
    div.classList.add('code-header')
    // 复制按钮
    const copyBtn = document.createElement('button')
    copyBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>'
    copyBtn.classList.add('code-copy-btn')

    // 事件监听函数
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
    // 记录监听器和元素
    codeCopyListeners.push({ btn: copyBtn, handler: copyHandler })

    // 代码语言
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
    // 如果没有 data-href 属性，删除 href 属性
    if (!img.getAttribute('data-href')) {
      img.removeAttribute('data-href')
    }
  })
}

const initFlag = ref(false)

const init = () => {
  if (import.meta.client && htmlContent.value) {
    nextTick(async () => {
      await initHljs()
      initImgs()
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

// 清理所有事件监听和动态 DOM
const cleanup = () => {
  // 移除所有 code-copy-btn 的事件监听
  codeCopyListeners.forEach(({ btn, handler }) => {
    console.log('移除事件监听:', btn)
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
      // 如果index不是数字，或者超出范围，则设置为0
      let index = Number(pswpindex)
      if (isNaN(index) || index < 0 || index >= imgList.length) {
        index = 0
      }
      openPhotoSwipe(imgList, index, undefined, imgListHash, componentNameLower)
    }
  }
}

// watch route changes to check pswpopen
watch(
  () => route.query.pswpopen,
  (newVal, oldVal) => {
    // 如果是从非1变为1，则检查
    if (newVal === '1' && oldVal !== '1') {
      console.log('checkPswp', newVal, oldVal)
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

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
  if (hljs) {
    hljs = null // 清理 highlight.js 的引用
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
/* CSS动画3秒钟后才让不透明度从0变为1 */
@keyframes imgLoad {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
