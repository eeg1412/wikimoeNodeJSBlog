<template>
  <div>
    <div
      class="mb-4 text-primary-500 font-bold text-base border-b border-dotted pb-3 border-gray-300"
    >
      发表评论：
    </div>
    <UForm>
      <div class="flex flex-col space-y-2">
        <UTextarea placeholder="说点什么吧..." />
        <div
          class="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0"
        >
          <div class="w-full sm:w-1/3">
            <UInput
              class="flex-grow"
              icon="i-heroicons-user-circle"
              size="sm"
              color="white"
              :trailing="false"
              placeholder="请输入昵称"
            />
          </div>
          <div class="w-full sm:w-1/3">
            <UInput
              class="flex-grow"
              icon="i-heroicons-at-symbol"
              size="sm"
              color="white"
              :trailing="false"
              placeholder="请输入邮箱"
            />
          </div>
          <div class="w-full sm:w-1/3">
            <UInput
              class="flex-grow"
              icon="i-heroicons-link"
              size="sm"
              color="white"
              :trailing="false"
              placeholder="请输入URL"
            />
          </div>

          <div class="w-full sm:w-20">
            <UButton :block="true">提交</UButton>
          </div>
        </div>
      </div>
    </UForm>
  </div>
</template>
<script setup>
const props = defineProps({
  postid: {
    type: String,
    required: true,
  },
  commentid: {
    type: String,
    default: '',
  },
})
</script>
<style scoped></style>
