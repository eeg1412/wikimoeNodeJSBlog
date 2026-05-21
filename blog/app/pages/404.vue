<template>
  <div class="error-body">
    <div class="error-code">404</div>
    <div class="error-msg">{{ t('common.error.notFound') }}</div>
    <!-- 尝试回到首页 -->
    <div class="error-btn pointer" @click="reflushHome">
      {{ t('common.error.backHome') }}
    </div>
  </div>
</template>
<script setup>
import { buildLanguagePath } from '@/composables/useLang'
import {
  DEFAULT_LANGUAGE_CODE,
  getLanguageText,
  normalizeLanguageCode
} from '@/lang'

const route = useRoute()
const currentLanguageCode = computed(() => {
  const routeCode = Array.isArray(route.params.code)
    ? route.params.code[0]
    : route.params.code
  return normalizeLanguageCode(routeCode) || DEFAULT_LANGUAGE_CODE
})
const t = path => getLanguageText(currentLanguageCode.value, path)

const reflushHome = () => {
  window.location.href = buildLanguagePath(currentLanguageCode.value, '/')
}
// google ad
const runtimeConfig = useRuntimeConfig()
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
  padding: 10px 20px;
  border-radius: 20px;
  @apply text-white bg-primary-500;
  display: block;
  margin-top: 20px;
}
</style>
