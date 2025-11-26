<template>
  <div class="my-3">
    <HtmlContent v-if="htmlMode" :content="content" />
    <div v-else v-html="content"></div>
  </div>
</template>
<script setup>
// props
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const { options } = useOptions()
const router = useRouter()

const type = computed(() => props.post.type)
const htmlMode = computed(() => {
  // 如果type为1，说明是博文看sitePostBlogCommonFooterContentIsRichMode，为2说明是推文，看sitePostTweetCommonFooterContentIsRichMode
  if (type.value === 1) {
    return options.value.sitePostBlogCommonFooterContentIsRichMode
  } else if (type.value === 2) {
    return options.value.sitePostTweetCommonFooterContentIsRichMode
  } else {
    return false
  }
})

const getLinkObj = () => {
  const item = props.post
  let linkObj = {}
  const type = item.type
  const detail = item
  switch (type) {
    case 2:
    case 1:
      linkObj = {
        name: 'postDetail',
        params: { id: detail.alias || detail._id }
      }
      break
    case 3:
      linkObj = {
        name: 'pageDetail',
        params: { id: detail.alias || detail._id }
      }

      break
    default:
      break
  }
  return linkObj
}

const content = computed(() => {
  let contentRaw = ''
  if (type.value === 1) {
    contentRaw = options.value.sitePostBlogCommonFooterContent
  } else if (type.value === 2) {
    contentRaw = options.value.sitePostTweetCommonFooterContent
  } else {
    return ''
  }
  // ${author}为博文作者
  // ${date}为博文日期
  // ${link}为博文链接
  // 开始替换
  contentRaw = contentRaw.replace(
    /\${author}/g,
    props.post.author?.nickname || ''
  )
  contentRaw = contentRaw.replace(/\${date}/g, formatDate(props.post.date))
  const urlPath = router.resolve(getLinkObj()).href
  const fullUrl = `${options.value.siteUrl}${urlPath}`

  contentRaw = contentRaw.replace(/\${link}/g, fullUrl)
  if (type.value === 1) {
    // ${title}为博文标题
    contentRaw = contentRaw.replace(/\${title}/g, props.post.title || '')
  }
  return contentRaw
})
</script>
<style scoped></style>
