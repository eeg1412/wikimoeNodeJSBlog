<template>
  <div class="dib" :style="imgStyle">
    <ClientOnly>
      <img class="blog-avatar" :src="src" :alt="alt" @error="imgError" />
    </ClientOnly>
  </div>
</template>
<script setup>
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
const imgStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
  }
})
const loadErrorFlag = ref(false)
const src = computed(() => {
  // 如果加载失败，返回默认头像
  if (!props.avatar || loadErrorFlag.value) {
    console.log('加载失败')
    const str = props.avatar || props.alt || ''
    // 如果存在str就以str为seed生成随机0-176的数字
    const seed = str.split('').reduce((sum, item) => {
      return sum + item.charCodeAt()
    }, 0)
    const num = seed % 176
    return `/img/avatar/${num}.webp`
  }
  // 判断avatar是否是md5,正则匹配
  const isMd5 = /^[a-f0-9]{32}$/.test(props.avatar)

  if (isMd5) {
    // 如果是md5，返回对应的URL
    return `https://gravatar.loli.net/avatar/${props.avatar}?d=404`
  } else {
    // 如果不是md5，认为是URL，返回URL
    return props.avatar
  }
})
const imgError = () => {
  loadErrorFlag.value = true
}
</script>
<style scoped>
.blog-avatar {
  border-radius: 5px;
  width: 100%;
  height: 100%;
}
</style>
