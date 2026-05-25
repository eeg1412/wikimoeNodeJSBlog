<template>
  <div class="error-body">
    <div class="error-code">{{ error.statusCode }}</div>
    <div class="error-msg">{{ errorMessage }}</div>
    <!-- 尝试回到首页 -->
    <div class="error-btn pointer" @click="reflushHome">{{ btnText }}</div>
  </div>
</template>
<script setup>
import { getLanguageText, normalizeLanguageCode } from '@/lang'
import { useDefaultLanguageCode } from '@/utils/default-language'

const error = useError()
const route = useRoute()
const defaultLanguageCode = useDefaultLanguageCode()
const BLOG_LANGUAGE_DISABLED_REASON = 'BLOG_LANGUAGE_DISABLED'
const LANGUAGE_NOT_FOUND_REASON = 'LANGUAGE_NOT_FOUND'
const currentLanguageCode = computed(() => {
  let routeCode = route.params.code
  if (Array.isArray(routeCode)) {
    routeCode = routeCode[0]
  }

  const routeLanguageCode = normalizeLanguageCode(routeCode)
  if (routeLanguageCode) {
    return routeLanguageCode
  }

  return defaultLanguageCode.value
})
const t = path => getLanguageText(currentLanguageCode.value, path)
const isBlogLanguageDisabledError = computed(() => {
  return (
    error.value?.data?.reason === BLOG_LANGUAGE_DISABLED_REASON ||
    error.value?.data?.reason === LANGUAGE_NOT_FOUND_REASON
  )
})
const homePath = computed(() => {
  return '/'
  // 由于难以区分语言不存在和其他错误，暂时先不区分这两种情况，直接回到首页
  // if (isBlogLanguageDisabledError.value) {
  //   return '/'
  // }

  // return buildLanguagePath(currentLanguageCode.value, '/')
})

const reflushHome = () => {
  window.location.href = homePath.value
}
// 判断是否是首页
const isHome = computed(() => {
  return route.path === homePath.value
})
// 按钮文案
const btnText = computed(() => {
  return isHome.value ? t('common.error.refresh') : t('common.error.backHome')
})

const errorMessage = computed(() => {
  switch (error.value.statusCode) {
    case 404:
      return t('common.error.notFound')
    case 403:
      return t('common.error.forbidden')
    case 503:
      return t('common.error.maintenanceUpdating')
    default:
      return (
        error.value?.message ||
        error.value?.statusMessage ||
        t('common.error.maintenance')
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
