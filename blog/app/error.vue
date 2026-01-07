<template>
  <div class="error-body">
    <div class="error-code">{{ error.statusCode }}</div>
    <div class="error-msg">{{ errorMessage }}</div>
    <!-- 尝试回到首页 -->
    <div class="error-btn pointer" @click="reflushHome">{{ btnText }}</div>
  </div>
</template>
<script setup>
const error = useError()
const reflushHome = () => {
  window.location.href = '/'
}
// 判断是否是首页
const isHome = computed(() => {
  return useRoute().path === '/'
})
// 按钮文案
const btnText = computed(() => {
  return isHome.value ? '尝试刷新' : '返回首页'
})

const errorMessage = computed(() => {
  switch (error.value.statusCode) {
    case 404:
      return '您访问的页面不存在。'
    case 403:
      return '您当前没有权限访问此页面。'
    case 503:
      return '服务器正在更新维护中，请稍后再试。'
    default:
      return (
        error.value?.message ||
        error.value?.statusMessage ||
        '服务器正在维护中，请稍后再试。'
      )
  }
})
</script>
<style scoped>
/* 报错页面式样，画面居中显示，code粉色 */
.error-body {
  width: 100%;
  height: 100%;
  display: flex;
  /* 换行显示 colums*/
  flex-direction: column;

  justify-content: center;
  align-items: center;
  background: #ffffff;
  height: 100dvh;
  padding: 10px;
}
.error-code {
  font-size: 100px;
  @apply text-primary-500;
}
.error-msg {
  font-size: 20px;
  color: #999;
}
.error-btn {
  @apply text-white bg-primary-500;
  padding: 10px 20px;
  border-radius: 20px;
  display: block;
  margin-top: 20px;
}
</style>
