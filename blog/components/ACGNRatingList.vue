<template>
  <div class="rating-list-container">
    <!-- 分隔符样式的标题栏 -->
    <div
      class="flex items-center cursor-pointer my-2 text-gray-400"
      @click="toggleExpanded"
    >
      <!-- 左侧横线 -->
      <div class="flex-1 h-px bg-gray-200 dark:bg-gray-800/40"></div>

      <!-- 中间文字和图标 -->
      <div class="px-3 flex items-center space-x-1">
        <span class="text-sm">
          {{ isExpanded ? '收起评分内容' : '查看评分内容' }}
        </span>
        <UIcon
          :name="
            isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          class="w-4 h-4 transition-transform duration-200"
        />
      </div>

      <!-- 右侧横线 -->
      <div class="flex-1 h-px bg-gray-200 dark:bg-gray-800/40"></div>
    </div>

    <!-- 展开的评分列表内容 -->
    <div v-if="isExpanded" class="transition-all duration-300 ease-in-out">
      <div v-if="showForm" class="mb-6">
        <UForm :state="form" @submit="onSubmit">
          <div class="flex flex-col space-y-2">
            <div class="flex items-center">
              <div>
                <ClientOnly>
                  <Emoji
                    @emojiClick="emojiClick"
                    @emojiBtnClick="emojiBtnClick"
                  />
                </ClientOnly>
              </div>
              <div class="ml-2">
                <UPopover :popper="{ arrow: true }">
                  <!-- 设置按钮 -->
                  <UButton
                    size="xs"
                    :color="
                      ratingSetting.ratingSaveUserInfo ? 'primary' : 'white'
                    "
                    icon="i-heroicons-cog-6-tooth"
                    @click="emojiBtnClick"
                  />
                  <template #panel="{ close }">
                    <div class="p-3">
                      <div>
                        <!-- UCheckbox  提交后保存个人信息 -->
                        <UCheckbox
                          v-model="ratingSetting.ratingSaveUserInfo"
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

            <!-- 评分选择 -->
            <UFormGroup name="score" :error="error.score">
              <div class="flex items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400 pr-2"
                  >评分</span
                >
                <URange
                  v-model="form.score"
                  :min="0"
                  :max="100"
                  size="sm"
                  class="flex-1"
                />
                <span
                  class="text-base font-bold text-primary text-right min-w-[3.3rem]"
                  >{{ form.score }}分</span
                >
              </div>
            </UFormGroup>

            <UFormGroup name="content" :error="error.content">
              <UTextarea
                class="comment-form-textarea"
                ref="contentRef"
                placeholder="说说你的看法吧..."
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
                  :loading="isSubmitting"
                  ><template v-if="!isSubmitting">提交</template></UButton
                >
                <UButton :block="true" type="submit" :disabled="true" v-else
                  >提交</UButton
                >
              </div>
            </div>
          </div>
        </UForm>
      </div>

      <!-- 评分列表 -->
      <div v-if="ratingList.length > 0" class="space-y-3">
        <div
          v-for="rating in ratingList"
          :key="rating.id"
          class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-start space-x-3">
            <!-- 用户头像 -->
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-user"
                  class="w-5 h-5 text-gray-500 dark:text-gray-400"
                />
              </div>
            </div>

            <!-- 评分内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {{ rating.nickname || '匿名用户' }}
                  </span>
                  <!-- 评分显示 -->
                  <div class="flex items-center space-x-1">
                    <span class="text-sm font-medium text-primary">
                      {{ rating.score }}分
                    </span>
                  </div>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(rating.createTime) }}
                </span>
              </div>

              <!-- 评分内容 -->
              <p
                v-if="rating.content"
                class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
              >
                {{ rating.content }}
              </p>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div class="text-center pt-1 pb-2" v-if="hasMore">
          <UButton
            color="gray"
            variant="outline"
            :loading="loadingMore"
            @click="loadMoreRatings"
          >
            <template v-if="!loadingMore">加载更多</template>
          </UButton>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!showForm || ratingList.length === 0"
        class="text-center py-8"
      >
        <UIcon
          name="i-heroicons-chat-bubble-left-ellipsis"
          class="w-12 h-12 text-gray-400 mx-auto mb-2"
        />
        <span class="text-gray-500 dark:text-gray-400">暂无评分</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  showForm: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['refresh'])

// 响应式数据
const isExpanded = ref(false)
const loading = ref(false)
const ratingList = ref([])
const isSubmitting = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)

// 表单数据
const form = reactive({
  score: 85,
  content: '',
  nickname: '',
  email: '',
  url: ''
})

// 错误信息
const error = ref({})

// Toast通知
const toast = useToast()

// 表情和设置相关
const contentRef = ref(null)
const isInit = ref(false)

// 保存个人信息设置
const ratingSetting = reactive({
  ratingSaveUserInfo: true
})

// 切换展开/收起状态
const toggleExpanded = async () => {
  isExpanded.value = !isExpanded.value

  // 如果是展开且还没有加载数据，则加载数据
  if (isExpanded.value && ratingList.value.length === 0) {
    await loadRatingList()
  }
}

// 加载评分列表
const loadRatingList = async (page = 1) => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    // const response = await getRatingListApi({
    //   id: props.id,
    //   type: props.type,
    //   page: page,
    //   limit: 10
    // })
    // const newRatings = response.data
    // hasMore.value = response.hasMore

    // 模拟数据，实际使用时请替换为真实API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    const newRatings = [
      {
        id: '1',
        nickname: '测试用户1',
        score: 95,
        content: '非常不错的内容，强烈推荐！',
        createTime: new Date().toISOString()
      },
      {
        id: '2',
        nickname: '测试用户2',
        score: 78,
        content: '整体还可以，有一些小问题。',
        createTime: new Date().toISOString()
      },
      {
        id: '3',
        nickname: '用户3',
        score: 88,
        content: '很好的体验，值得推荐给大家。',
        createTime: new Date().toISOString()
      }
    ]

    if (page === 1) {
      ratingList.value = newRatings
    } else {
      ratingList.value.push(...newRatings)
    }

    currentPage.value = page
    hasMore.value = page < 3 // 模拟只有3页数据
  } catch (err) {
    console.error('加载评分列表失败:', err)
    toast.add({
      title: '加载评分列表失败',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多评分
const loadMoreRatings = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    await loadRatingList(nextPage)
  } catch (err) {
    console.error('加载更多评分失败:', err)
    toast.add({
      title: '加载更多评分失败',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    loadingMore.value = false
  }
}

// 提交评分
const onSubmit = async event => {
  if (isSubmitting.value) return

  // 清空错误
  error.value = {}

  // 验证必填字段
  if (!event.data.nickname) {
    error.value.nickname = true
    setTimeout(() => {
      toast.add({
        title: '昵称不能为空',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      })
    }, 0)
  }

  if (!event.data.content) {
    error.value.content = true
    setTimeout(() => {
      toast.add({
        title: '内容不能为空',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      })
    }, 0)
  }

  if (!event.data.score || event.data.score < 0 || event.data.score > 100) {
    error.value.score = true
    setTimeout(() => {
      toast.add({
        title: '请输入0-100之间的有效评分',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      })
    }, 0)
  }

  // 如果有url，校验url的格式
  if (event.data.url) {
    // 如果没有http或https开头，就加上
    if (
      !event.data.url.startsWith('http://') &&
      !event.data.url.startsWith('https://')
    ) {
      event.data.url = 'https://' + event.data.url
    }
  }

  // 验证邮箱格式
  if (event.data.email) {
    const emailReg =
      /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/
    if (!emailReg.test(event.data.email)) {
      error.value.email = true
      setTimeout(() => {
        toast.add({
          title: '邮箱格式不正确',
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

  if (ratingSetting.ratingSaveUserInfo) {
    // 将nickname, email, url保存到localStorage
    localStorage.setItem('commentNickname', event.data.nickname)
    localStorage.setItem('commentEmail', event.data.email)
    localStorage.setItem('commentUrl', event.data.url)
  }

  isSubmitting.value = true

  try {
    // 这里应该调用实际的API
    // await createRatingApi({
    //   id: props.id,
    //   type: props.type,
    //   score: event.data.score,
    //   content: event.data.content,
    //   nickname: event.data.nickname,
    //   email: event.data.email,
    //   url: event.data.url
    // })

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 清空表单
    form.content = ''
    form.score = 85

    const dataStatus = 1 // 假设直接审核通过
    if (dataStatus === 0) {
      toast.add({
        title: '评分成功，将在审核后公开',
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 10000
      })
    } else {
      toast.add({
        title: '评分成功',
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 10000
      })
    }

    // 重新加载列表
    await loadRatingList(1)
    emit('refresh')
  } catch (err) {
    console.error('提交评分失败:', err)
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
    } else {
      toast.add({
        title: '提交评分失败',
        icon: 'i-heroicons-x-circle',
        color: 'red'
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

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

const initRatingSaveUserInfo = () => {
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
  const ratingSettingStr = localStorage.getItem('ratingSetting')
  if (ratingSettingStr) {
    try {
      const ratingSettingObj = JSON.parse(ratingSettingStr)
      for (const key in ratingSettingObj) {
        if (ratingSetting.hasOwnProperty(key)) {
          if (ratingSettingObj[key] !== undefined) {
            ratingSetting[key] = ratingSettingObj[key]
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

// 深度watch ratingSetting
watch(
  () => ratingSetting,
  (newVal, oldVal) => {
    localStorage.setItem('ratingSetting', JSON.stringify(newVal))
  },
  {
    deep: true
  }
)

// 组件挂载时初始化用户信息
onMounted(() => {
  initRatingSaveUserInfo()
  isInit.value = true
})
</script>

<style scoped>
.rating-list-container {
  @apply w-full;
}
</style>
