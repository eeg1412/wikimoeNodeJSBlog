<template>
  <div v-if="options.siteEnableComment && allowRemark">
    <div
      class="mb-3 text-gray-600 dark:text-gray-200 font-bold text-base border-b border-dotted pb-2 border-gray-300 dark:border-gray-700"
      v-if="!commentid"
    >
      发表评论：
    </div>
    <UForm :state="form" @submit="onSubmit">
      <div class="flex flex-col space-y-2">
        <div class="flex items-center">
          <div>
            <ClientOnly>
              <Emoji @emojiClick="emojiClick" @emojiBtnClick="emojiBtnClick" />
            </ClientOnly>
          </div>
          <div class="ml-2">
            <UPopover :popper="{ arrow: true }">
              <!-- 设置按钮 -->
              <UButton
                size="xs"
                :color="
                  commentSetting.commentSaveUserInfo ? 'primary' : 'white'
                "
                icon="i-heroicons-cog-6-tooth"
                @click="emojiBtnClick"
              />
              <template #panel="{ close }">
                <div class="p-3">
                  <div>
                    <!-- UCheckbox  提交后保存个人信息 -->
                    <UCheckbox
                      v-model="commentSetting.commentSaveUserInfo"
                      :label="`提交后保存此个人信息`"
                      :ui="{ inner: 'ms-1 flex flex-col' }"
                    />
                  </div>
                  <div class="mt-2 flex justify-center items-center">
                    <!-- 立即清除个人信息 按钮 -->
                    <UButton
                      size="xs"
                      color="primary"
                      icon="i-heroicons-trash"
                      @click="removeUserInfo"
                    >
                      立即清除个人信息
                    </UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </div>
        </div>
        <UFormGroup name="content" :error="error.content">
          <UTextarea
            class="comment-form-textarea"
            ref="contentRef"
            placeholder="说点什么吧..."
            v-model="form.content"
          />
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
                placeholder="昵称"
              />
            </UFormGroup>
          </div>
          <div class="w-full sm:w-1/3">
            <UFormGroup name="email" :error="error.email">
              <UInput
                class="flex-grow"
                icon="i-heroicons-at-symbol"
                size="sm"
                color="white"
                :trailing="false"
                v-model="form.email"
                @blur="
                  () => {
                    form.email = form.email.toLowerCase()
                  }
                "
                placeholder="邮箱（选填）"
            /></UFormGroup>
          </div>
          <div class="w-full sm:w-1/3">
            <UFormGroup name="url" :error="error.url">
              <UInput
                class="flex-grow"
                icon="i-heroicons-link"
                size="sm"
                color="white"
                :trailing="false"
                name="url"
                v-model="form.url"
                placeholder="网址（选填）"
            /></UFormGroup>
          </div>

          <div class="w-full sm:w-20">
            <UButton
              :block="true"
              type="submit"
              v-if="isInit"
              :loading="commentIsSending"
              ><template v-if="!commentIsSending">提交</template></UButton
            >
            <UButton :block="true" type="submit" :disabled="true" v-else
              >提交</UButton
            >
          </div>
        </div>
      </div>
    </UForm>
  </div>
  <div class="text-center" v-else>
    <span class="text-gray-500">评论已关闭</span>
  </div>
</template>
<script setup>
import { getCommentCreateApi } from '@/api/comment'

const toast = useToast()
const { options } = useOptions()
const { setCommentRetractAuthDecode } = useCommentRetractAuthDecode()

const props = defineProps({
  postid: {
    type: String,
    required: true
  },
  commentid: {
    type: String,
    default: ''
  },
  parentNickname: {
    type: String,
    default: null
  },
  allowRemark: {
    type: Boolean,
    default: false
  }
})
const form = reactive({
  nickname: '',
  email: '',
  url: '',
  content: props.parentNickname ? `@${props.parentNickname}：` : ''
})
const emits = defineEmits()

const error = ref({})
const commentIsSending = ref(false)
let validatorModule = null
const loadValidatorModule = async () => {
  if (!validatorModule) {
    const isEmail = await import('validator/es/lib/isEmail')
    const isURL = await import('validator/es/lib/isURL')
    validatorModule = {
      isEmail: isEmail.default,
      isURL: isURL.default
    }
  }
}
const onSubmit = async event => {
  if (commentIsSending.value) {
    return
  }
  commentIsSending.value = true
  try {
    await loadValidatorModule()
  } catch (error) {
    commentIsSending.value = false
    toast.add({
      title: '加载验证模块失败, 请稍后再试',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
    throw error
  } finally {
    commentIsSending.value = false
  }
  // 清空error
  error.value = {}
  // 检查nickname和content是否为空
  if (!event.data.nickname) {
    error.value.nickname = true
    // 提示
    setTimeout(() => {
      toast.add({
        title: '昵称不能为空',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      })
    }, 0)
  } else if (event.data.nickname.length > 20) {
    error.value.nickname = true
    // 提示
    setTimeout(() => {
      toast.add({
        title: '昵称不能超过20个字符',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      })
    }, 0)
  }
  if (!event.data.content) {
    error.value.content = true
    // 提示
    setTimeout(() => {
      toast.add({
        title: '评论内容不能为空',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      })
    }, 0)
  } else {
    const siteMinCommentLength = options.value.siteMinCommentLength || 1
    if (event.data.content.length < siteMinCommentLength) {
      error.value.content = true
      // 提示
      setTimeout(() => {
        toast.add({
          title: `评论内容不能少于 ${siteMinCommentLength} 个字`,
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }, 0)
    } else if (event.data.content.length > 500) {
      error.value.content = true
      // 提示
      setTimeout(() => {
        toast.add({
          title: '评论内容不能超过500个字符',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }, 0)
    }
  }

  // 如果有url，校验url的格式
  if (event.data.url) {
    if (event.data.url.length > 200) {
      error.value.url = true
      // 提示
      setTimeout(() => {
        toast.add({
          title: 'url不能超过200个字符',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }, 0)
    }
    // 如果没有http或https开头，就加上
    if (
      !event.data.url.startsWith('http://') &&
      !event.data.url.startsWith('https://')
    ) {
      event.data.url = 'https://' + event.data.url
    }

    const isURL = validatorModule.isURL
    if (
      !isURL(event.data.url, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_host: true,
        require_valid_protocol: true,
        require_tld: true,
        require_port: false,
        allow_protocol_relative_urls: false,
        validate_length: false
      })
    ) {
      error.value.url = true
      // 提示
      setTimeout(() => {
        toast.add({
          title: '网址格式不正确',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }, 0)
    }
  }
  // 校验邮箱地址
  if (event.data.email) {
    if (event.data.email.length > 100) {
      error.value.email = true
      // 提示
      setTimeout(() => {
        toast.add({
          title: '邮箱地址不能超过100个字符',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }, 0)
    }
    const isEmail = validatorModule.isEmail
    if (!isEmail(event.data.email)) {
      error.value.email = true
      // 提示
      setTimeout(() => {
        toast.add({
          title: '邮箱地址格式不正确',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }, 0)
    }
  }
  // 如果有错误，就不提交
  if (Object.keys(error.value).length > 0) {
    return
  }
  if (commentSetting.commentSaveUserInfo) {
    // 将nickname, email, url保存到localStorage
    localStorage.setItem('commentNickname', event.data.nickname)
    localStorage.setItem('commentEmail', event.data.email)
    localStorage.setItem('commentUrl', event.data.url)
  }
  // 提交
  console.log(event.data)
  commentIsSending.value = true
  getCommentCreateApi({
    post: props.postid,
    parent: props.commentid,
    nickname: event.data.nickname,
    email: event.data.email,
    url: event.data.url,
    content: event.data.content
  })
    .then(res => {
      console.log(res)
      // 清空表单
      // form.nickname = ''
      // form.email = ''
      // form.url = ''
      form.content = ''
      const dataStatus = res.status
      // 0是审核中，1是审核通过
      if (dataStatus === 0) {
        toast.add({
          title: '评论成功，将在审核后公开',
          icon: 'i-heroicons-check-circle',
          color: 'green',
          timeout: 10000
        })
      } else {
        toast.add({
          title: '评论成功',
          icon: 'i-heroicons-check-circle',
          color: 'green',
          timeout: 10000
        })
      }
      const commentRetractJWT = res.commentRetractJWT
      if (commentRetractJWT) {
        localStorage.setItem('commentRetractJWT', commentRetractJWT)
        setCommentRetractAuthDecode()
      }
      // 刷新评论列表
      emits('refresh')
    })
    .catch(err => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach(item => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
            timeout: 10000
          })
        })
      }
    })
    .finally(() => {
      commentIsSending.value = false
    })
}
const contentRef = ref(null)
const emojiClick = item => {
  const startPos = contentRef.value.textarea.selectionStart
  const endPos = contentRef.value.textarea.selectionEnd
  const emojiLength = item.length
  form.content =
    form.content.substring(0, startPos) +
    item +
    form.content.substring(endPos, form.content.length)
  // 使用 nextTick 来确保 DOM 已经更新
  nextTick(() => {
    contentRef.value.textarea.focus()
    contentRef.value.textarea.selectionStart = startPos + emojiLength
    contentRef.value.textarea.selectionEnd = startPos + emojiLength
  })
}

const emojiBtnClick = () => {
  // 取消聚焦
  contentRef.value.textarea.blur()
}

// 保存个人信息
const commentSetting = reactive({
  commentSaveUserInfo: true
})
const initCommentSaveUserInfo = () => {
  const commentNickname = localStorage.getItem('commentNickname')
  const commentEmail = localStorage.getItem('commentEmail')
  const commentUrl = localStorage.getItem('commentUrl')
  if (commentNickname) {
    form.nickname = commentNickname
  }
  if (commentEmail) {
    form.email = commentEmail
  }
  if (commentUrl) {
    form.url = commentUrl
  }
  const commentSettingStr = localStorage.getItem('commentSetting')
  if (commentSettingStr) {
    try {
      const commentSettingObj = JSON.parse(commentSettingStr)
      for (const key in commentSettingObj) {
        if (commentSetting.hasOwnProperty(key)) {
          if (commentSettingObj[key] !== undefined) {
            commentSetting[key] = commentSettingObj[key]
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
const removeUserInfo = () => {
  localStorage.removeItem('commentNickname')
  localStorage.removeItem('commentEmail')
  localStorage.removeItem('commentUrl')

  form.nickname = ''
  form.email = ''
  form.url = ''
  // 提示
  toast.add({
    title: '已清除个人信息',
    icon: 'i-heroicons-check-circle',
    color: 'green'
  })
}
// 深度watch commentSetting
watch(
  () => commentSetting,
  (newVal, oldVal) => {
    localStorage.setItem('commentSetting', JSON.stringify(newVal))
  },
  {
    deep: true
  }
)

const isInit = ref(false)

onMounted(() => {
  initCommentSaveUserInfo()
  isInit.value = true
})
</script>
<style scoped></style>
