<template>
  <UPopover
    :popper="{ arrow: true }"
    v-model:open="open"
    class="share-popover"
    v-if="siteEnableShareButton"
  >
    <slot></slot>
    <template #panel="{ close }">
      <div class="p-4 share-popover-panel cursor-default" @click.stop>
        <div class="flex justify-between items-center mb-3">
          <div class="share-popover-title text-base font-bold">分享至</div>
          <!-- 关闭 -->
          <div
            class="share-popover-close text-gray-400 cursor-pointer text-base"
            @click="close"
          >
            <UIcon name="i-heroicons-x-mark" />
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <!-- 按钮组，由 icons 数组渲染，便于统一管理背景色 -->
          <template v-for="icon in icons" :key="icon.key">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center cursor-pointer',
                icon.bg
              ]"
              :title="icon.alt"
              @click="handleShare(icon.key)"
              v-if="siteSharePlatforms.includes(icon.key)"
            >
              <img
                v-if="icon.src"
                class="w-7 h-7"
                :src="icon.src"
                :alt="icon.alt"
              />
              <UIcon
                v-else-if="icon.icon"
                :name="icon.icon"
                class="w-5 h-5 text-white"
              />
            </div>
          </template>
        </div>
      </div>
    </template>
  </UPopover>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { putShareCountApi } from '@/api/post'
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
const siteUrl = computed(() => options.value?.siteUrl)
const siteTitle = computed(() => options.value?.siteTitle)
const siteEnableShareButton = computed(
  () => options.value?.siteEnableShareButton
)
const siteSharePlatforms = computed(() => options.value?.siteSharePlatforms)
const siteShareDescription = computed(() => options.value?.siteShareDescription)

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  open: {
    type: Boolean,
    default: false
  }
})
const toast = useToast()
const emit = defineEmits(['update:open', 'shareadd'])

const open = computed({
  get() {
    return props.open
  },
  set(value) {
    emit('update:open', value)
  }
})

const copyText = text => {
  copyToClipboard(text, toast)
}

// 生成文章链接
const getPostUrl = () => {
  const baseUrl = siteUrl.value || ''
  const identifier = props.post.alias || props.post._id

  if (props.post.type === 3) {
    return `${baseUrl}/page/${identifier}`
  } else {
    return `${baseUrl}/post/${identifier}`
  }
}

// 生成分享文案
const getShareText = () => {
  const postTypeMap = {
    1: '博文',
    2: '推文',
    3: '页面'
  }
  const postType = postTypeMap[props.post.type] || '文章'
  let text = siteShareDescription.value
  // ${siteTitle}为站点名称
  // ${title}为文章标题
  // ${postType}为文章类型
  text = text.replace('${siteTitle}', siteTitle.value || '')
  text = text.replace(
    '${title}',
    props.post.title || getTitleFromText(props.post.excerpt)
  )
  text = text.replace('${postType}', postType)
  return text
}

// 获取分享图片
const getShareImage = () => {
  if (props.post.coverImages && props.post.coverImages.length > 0) {
    const baseUrl = siteUrl.value || ''
    return `${baseUrl}${
      props.post.coverImages[0].thumfor || props.post.coverImages[0].filepath
    }`
  }
  return ''
}

// 处理分享点击
const handleShare = platform => {
  const postUrl = getPostUrl()
  const shareText = getShareText()
  const shareImage = getShareImage()
  const postTitle = props.post.title || getTitleFromText(props.post.excerpt)
  const postExcerpt = props.post.excerpt || postTitle

  let shareUrl = ''

  switch (platform) {
    case 'weibo':
      shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(
        postUrl
      )}&title=${encodeURIComponent(shareText)}&pic=${encodeURIComponent(
        shareImage
      )}`
      break
    case 'qq-zone':
      shareUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(
        postUrl
      )}&title=${encodeURIComponent(postTitle)}&summary=${encodeURIComponent(
        postExcerpt
      )}&desc=${encodeURIComponent(postExcerpt)}&pics=${encodeURIComponent(
        shareImage
      )}&site=${encodeURIComponent(siteTitle.value || '')}&showcount=1`
      break
    case 'x':
      shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(shareText)}`
      break
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`
      break
    case 'reddit':
      shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(
        postUrl
      )}&title=${encodeURIComponent(postTitle)}`
      break
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(shareText)}`
      break
    case 'line':
      shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(shareText)}`
      break
    case 'whatsapp':
      const whatsappText = `${shareText} ${postUrl}`
      shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
      break
    case 'copy-link':
      // 复制链接到剪贴板
      copyText(`${shareText} ${postUrl}`)
      break
    default:
      console.warn(`未知的分享方式: ${platform}`)
      return
  }

  // 在新窗口打开分享链接
  if (shareUrl) {
    window.open(
      shareUrl,
      '_blank',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    )
  }

  putShareCountApi({
    id: props.post._id,
    sharePlatform: platform
  }).then(res => {
    if (res.add) {
      emit('shareadd')
    }
  })
}

// 分享图标配置：每项包含图片路径、alt 文本和背景色（Tailwind 类）
const icons = [
  {
    key: 'weibo',
    src: '/img/icon/sina-weibo.svg',
    alt: '分享到新浪微博',
    bg: 'bg-red-500'
  },
  {
    key: 'qq-zone',
    src: '/img/icon/qq-zone.svg',
    alt: '分享到QQ空间',
    bg: 'bg-yellow-400'
  },
  { key: 'x', src: '/img/icon/x-icon.svg', alt: '分享到X', bg: 'bg-slate-700' },
  {
    key: 'facebook',
    src: '/img/icon/facebook.svg',
    alt: '分享到Facebook',
    bg: 'bg-blue-600'
  },
  {
    key: 'reddit',
    src: '/img/icon/reddit.svg',
    alt: '分享到Reddit',
    bg: 'bg-orange-400'
  },
  {
    key: 'telegram',
    src: '/img/icon/telegram.svg',
    alt: '分享到Telegram',
    bg: 'bg-cyan-500'
  },
  {
    key: 'line',
    src: '/img/icon/line.svg',
    alt: '分享到LINE',
    bg: 'bg-green-500'
  },
  {
    key: 'whatsapp',
    src: '/img/icon/whatsapp.svg',
    alt: '分享到WhatsApp',
    bg: 'bg-green-600'
  },
  {
    key: 'copy-link',
    icon: 'i-heroicons-link',
    alt: '复制链接',
    bg: 'bg-gray-500'
  }
]
</script>
<style scoped>
.share-popover-panel {
  max-width: calc(100vw - 2rem);
}
.share-popover-close {
  margin: -0.6rem -0.2rem 0 0;
}
.share-popover-title {
  margin-top: -0.3rem;
}
</style>
