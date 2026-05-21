<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200 dark:border-gray-700"
    >
      {{ title }}
    </div>
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { postLogCreateApi } from '@/api/log'

const { t } = useLang()

const route = useRoute()
const keyword = route.params.keyword || ''
const title = t('common.search.title', { keyword })
// 如果page不是正整数，报错去404页面
const page = route.params.page
if (!/^\d+$/.test(page)) {
  showError({
    statusCode: 404,
    message: t('common.error.notFound')
  })
  throw new Error(t('common.error.notFound'))
}
// 设置SEO
useSeoMeta({
  title: title,
  ogTitle: title,
  keywords: keyword,
  // twitter
  twitterTitle: title
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListKeyword',
    keyword: keyword
  })
})
</script>
