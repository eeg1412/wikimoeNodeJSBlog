<template>
  <div>
    <div
      class="mb-4 text-primary-500 font-bold text-base border-b border-dotted pb-3 border-gray-300"
      v-if="!commentid"
    >
      发表评论：
    </div>
    <UForm :state="form" @submit="onSubmit">
      <div class="flex flex-col space-y-2">
        <UFormGroup name="content" :error="error.content">
          <UTextarea placeholder="说点什么吧..." v-model="form.content" />
        </UFormGroup>

        <div
          class="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0"
        >
          <div class="w-full sm:w-1/3">
            <UFormGroup name="nickname" :error="error.nickname">
              <UInput
                class="flex-grow"
                icon="i-heroicons-user-circle"
                size="sm"
                color="white"
                :trailing="false"
                v-model="form.nickname"
                placeholder="请输入昵称"
              />
            </UFormGroup>
          </div>
          <div class="w-full sm:w-1/3">
            <UFormGroup name="email">
              <UInput
                class="flex-grow"
                icon="i-heroicons-at-symbol"
                size="sm"
                color="white"
                :trailing="false"
                v-model="form.email"
                placeholder="请输入邮箱"
            /></UFormGroup>
          </div>
          <div class="w-full sm:w-1/3">
            <UFormGroup name="url">
              <UInput
                class="flex-grow"
                icon="i-heroicons-link"
                size="sm"
                color="white"
                :trailing="false"
                name="url"
                v-model="form.url"
                placeholder="请输入URL"
            /></UFormGroup>
          </div>

          <div class="w-full sm:w-20">
            <UButton :block="true" type="submit">提交</UButton>
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
const form = reactive({
  nickname: '',
  email: '',
  url: '',
  content: '',
})

const error = ref({})
const onSubmit = (event) => {
  // 清空error
  error.value = {}
  // 检查nickname和content是否为空
  if (!event.data.nickname) {
    error.value.nickname = true
  }
  if (!event.data.content) {
    error.value.content = true
  }
  // 如果有错误，就不提交
  if (Object.keys(error.value).length > 0) {
    return
  }
  // 提交
  console.log(event.data)
}
</script>
<style scoped></style>
