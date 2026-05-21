<template>
  <div>
    <div
      class="p-2 pb-2 pl-4 pr-4 block text-center border-solid border-b border-gray-200 dark:border-gray-700"
      v-if="title"
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
const page = route.params.page
// 如果page不是正整数，报错去404页面
if (!/^\d+$/.test(page)) {
  showError({
    statusCode: 404,
    message: t('common.error.notFound')
  })
  throw new Error(t('common.error.notFound'))
}
const year = route.params.year
const month = route.params.month
const title = t('common.post.listArchive', { year, month })
// 设置SEO
useSeoMeta({
  title: title,
  ogTitle: title,
  // twitter
  twitterTitle: title
})
onMounted(() => {
  postLogCreateApi({
    action: 'postListArchive',
    title: title
  })
})
</script>
