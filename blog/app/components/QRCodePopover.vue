<template>
  <WUIPopover
    :popper="{ arrow: true }"
    class="share-popover"
    v-if="siteEnableFooterQRCodeButton"
  >
    <WUIButton
      icon="i-heroicons-qr-code"
      size="md"
      color="primary"
      variant="outline"
      :trailing="false"
    />
    <template #panel="{ close }">
      <div class="p-4 share-popover-panel" @click.stop>
        <div class="flex justify-between items-center mb-3">
          <div class="share-popover-title text-base font-bold">
            {{ t('common.qrcode.title') }}
          </div>
          <!-- 关闭 -->
          <div
            class="share-popover-close text-gray-400 cursor-pointer text-base"
            @click="close"
          >
            <WUIIcon name="i-heroicons-x-mark" />
          </div>
        </div>
        <div class="post-detail-qr-code-container">
          <!-- 二维码 -->
          <LazyQRCodeImg
            :text="getPostUrl"
            :size="512"
            :margin="0"
            class="post-detail-qr-code rounded dark:border-white dark:border-solid dark:border-2"
          />
        </div>
        <div class="mt-2">
          <WUIButtonGroup size="xs" orientation="horizontal" class="w-full">
            <WUIInput
              name="url"
              readonly
              :model-value="getPostUrl"
              class="w-full"
            />
            <WUIButton
              icon="i-heroicons-clipboard-document"
              color="gray"
              @click="copyText(getPostUrl, toast)"
            />
          </WUIButtonGroup>
        </div>
      </div>
    </template>
  </WUIPopover>
</template>
<script setup>
const { options } = useOptions()
const { t, localeUrl } = useLang()
const { copyText } = useLocalizedText()
const siteUrl = computed(() => options.value?.siteUrl)
const siteEnableFooterQRCodeButton = computed(
  () => options.value?.siteEnableFooterQRCodeButton
)

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})
const toast = useWToast()

// 生成文章链接（包含语言前缀）
const getPostUrl = computed(() => {
  const baseUrl = siteUrl.value || ''
  const identifier = props.post.alias || props.post._id
  let path = ''
  if (props.post.type === 3) {
    path = `/page/${identifier}`
  } else {
    path = `/post/${identifier}`
  }
  return localeUrl(baseUrl, path)
})
</script>
<style scoped>
.share-popover-close {
  margin: -0.6rem -0.2rem 0 0;
}
.share-popover-title {
  margin-top: -0.3rem;
}
:deep(.post-detail-qr-code),
.post-detail-qr-code-container {
  width: 200px;
  height: 200px;
}
</style>
