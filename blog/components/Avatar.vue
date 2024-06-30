<template>
  <div
    class="dib blog-avatar-body"
    :class="{ 'blog-avatar-loaded': imageLoaded }"
    :style="imgStyle"
  >
    <ClientOnly>
      <img
        class="blog-avatar"
        :src="src"
        :alt="alt"
        @load="imgLoad"
        @error="imgError"
      />
    </ClientOnly>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'
const props = defineProps({
  avatar: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 50,
  },
})
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
const siteGravatarSource = options.value.siteGravatarSource
const imgStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
  }
})
const loadErrorFlag = ref(false)
const src = computed(() => {
  // 判断avatar是否是md5,正则匹配
  const isMd5 = /^[a-f0-9]{32}$/.test(props.avatar)
  // 如果加载失败，返回默认头像
  if (!props.avatar || loadErrorFlag.value || (!siteGravatarSource && isMd5)) {
    console.log('头像加载失败或者没有头像或者没有gravatar地址')
    const str = props.avatar || props.alt || ''
    // 如果存在str就以str为seed生成随机0-176的数字
    const seed = str.split('').reduce((sum, item) => {
      return sum + item.charCodeAt()
    }, 0)
    const num = seed % 176
    return `/img/avatar/${num}.webp`
  }

  if (isMd5) {
    // 如果是md5，返回对应的URL
    return `${siteGravatarSource}/${props.avatar}?d=404`
  } else {
    // 如果不是md5，认为是URL，返回URL
    return props.avatar
  }
})

const imageLoaded = ref(false)
const imgError = () => {
  loadErrorFlag.value = true
  imageLoaded.value = true
}
const imgLoad = () => {
  imageLoaded.value = true
  console.log('头像加载成功')
}
</script>
<style scoped>
.blog-avatar-body {
  @apply bg-gray-100;
  border-radius: 5px;
}
.blog-avatar-loaded.blog-avatar-body {
  background-color: transparent;
}
.blog-avatar {
  border-radius: 5px;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s;
}
.blog-avatar-loaded .blog-avatar {
  opacity: 1;
}
</style>
