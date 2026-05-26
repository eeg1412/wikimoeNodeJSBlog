<template>
  <div
    class="blog-layout-right-body custom-scroll blog-layout-right-body-full-height"
    @focusin="emit('focusin')"
    :class="{
      active: active,
      'page-loading': pageLoading
    }"
  >
    <div class="blog-layout-right-top-body">
      <div class="justify-between mb-5 layout-close-btn-body type-r">
        <div class="text-xl font-bold">
          {{ t('common.navigation.sidebar') }}
        </div>
        <div class="text-xl cursor-pointer" @click="emit('close')">
          <WUIIcon name="i-heroicons-x-mark" />
        </div>
      </div>
      <div class="blog-search-body">
        <WUIInput
          v-model.trim="keyword"
          :placeholder="t('common.search.placeholder')"
          size="lg"
          variant="none"
          @keydown.enter="goSearch"
          maxlength="20"
        >
          <template #trailing>
            <WUIButton
              color="gray"
              variant="link"
              icon="i-heroicons-magnifying-glass-20-solid"
              :padded="false"
              @click="goSearch"
            />
          </template>
        </WUIInput>
      </div>
    </div>
    <div class="blog-layout-right-box">
      <div
        v-for="item in sidebarListData"
        :key="item._id"
        class="blog-layout-right-sidebar-item"
      >
        <div class="blog-layout-right-title-body">
          {{ getSidebarTitle(item) }}
        </div>
        <component
          v-if="getSidebarBlockComponent(item)"
          :is="getSidebarBlockComponent(item)"
          v-bind="getSidebarBlockProps(item)"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineAsyncComponent, markRaw } from 'vue'
import { getLanguageText } from '@/lang'
import {
  createSidebarBlockProps,
  getSidebarBlockComponentLoader,
  getSidebarBlockComponentName
} from '@/utils/sidebar-block'

defineProps({
  active: {
    type: Boolean,
    default: false
  },
  pageLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'focusin'])
const router = useRouter()
const { languageCode, localePath, supportedLanguageCodes, t } = useLang()
const { layoutLanguageSnapshot } = useLayoutLanguageSnapshot()

const sidebarListData = computed(() => {
  return layoutLanguageSnapshot.value.sidebarList
})

const sidebarData = computed(() => {
  return layoutLanguageSnapshot.value.sidebarData
})
const sidebarBlockComponentCache = new Map()

const getSidebarBlockComponent = item => {
  const componentName = getSidebarBlockComponentName(item)
  if (!componentName) {
    return null
  }

  if (sidebarBlockComponentCache.has(componentName)) {
    return sidebarBlockComponentCache.get(componentName)
  }

  const componentLoader = getSidebarBlockComponentLoader(item)
  if (!componentLoader) {
    return null
  }

  const component = markRaw(defineAsyncComponent(componentLoader))
  sidebarBlockComponentCache.set(componentName, component)
  return component
}

const getSidebarBlockProps = item => {
  return createSidebarBlockProps(item, sidebarData.value)
}

const getSidebarBuiltinTitle = (type, targetLanguageCode) => {
  const titlePath = `common.sidebarBuiltinTitles.${type}`
  const title = getLanguageText(targetLanguageCode, titlePath)
  if (title === titlePath) {
    return ''
  }

  return title
}

const getSidebarBuiltinTitleList = type => {
  return supportedLanguageCodes
    .map(targetLanguageCode => {
      return getSidebarBuiltinTitle(type, targetLanguageCode)
    })
    .filter(title => {
      return Boolean(title)
    })
}

const getSidebarTitle = item => {
  const title = String(item?.title || '').trim()
  const localizedTitle = getSidebarBuiltinTitle(item?.type, languageCode.value)

  if (!localizedTitle) {
    return title
  }

  if (!title) {
    return localizedTitle
  }

  if (getSidebarBuiltinTitleList(item?.type).includes(title)) {
    return localizedTitle
  }

  return title
}

const keyword = ref('')
const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, '')
}
const goSearch = () => {
  const keywordValue = escapeRegExp(keyword.value.trim())
  if (keyword.value) {
    router.push({
      path: localePath(`/post/list/keyword/${keywordValue}/1`)
    })
    keyword.value = ''
    try {
      document.activeElement.blur()
    } catch (error) {
      console.log(error)
    }
  }
}
</script>
<style scoped>
.blog-layout-right-body {
  @apply border-l-2 border-primary-100/30 border-solid;
  width: 298px;
  box-sizing: border-box;
  flex: 0 0 298px;
  align-self: flex-end;
  position: sticky;
  bottom: 0px;
  min-height: 100vh;
  min-height: 100dvh;
  order: 2;
}
.blog-layout-right-body.blog-layout-right-body-full-height {
  background-color: #ffffff;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}
.layout-close-btn-body {
  display: none;
}
.blog-layout-right-box {
  padding: 0 18px 18px 18px;
  z-index: 1;
  background: #ffffff;
  border-bottom-right-radius: 20px;
}
.page-loading .blog-layout-right-box {
  position: relative;
}
.blog-search-body {
  border-radius: 10px;
  background: #f5f5f5;
}
.blog-layout-right-top-body {
  padding: 18px;
  position: sticky;
  z-index: 2;
  top: 0px;
  background: #ffffff;
  border-top-right-radius: 20px;
}
.blog-layout-right-title-body {
  font-size: 20px;
  font-weight: 400;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e2e2;
}
.blog-layout-right-sidebar-item {
  margin-bottom: 20px;
}
.blog-layout-right-sidebar-item:last-child {
  margin-bottom: 0px;
}

@media (max-width: 1024px) {
  .blog-layout-right-top-body {
    top: 60px;
  }
  .blog-layout-right-body {
    border-top-right-radius: 0px !important;
    border-bottom-right-radius: 0px !important;
  }
}

@media (max-width: 768px) {
  .blog-layout-right-body {
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 21;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background-color: #ffffff;
    border-left: 0px solid #fff7f9;
  }
  .layout-close-btn-body.type-r {
    display: flex;
  }
  .blog-layout-right-body.active {
    transform: translateX(0%);
    opacity: 1;
  }
  .blog-layout-right-top-body {
    top: 0px;
  }
  .blog-layout-right-box {
    position: relative;
    height: auto;
    overflow: hidden;
    top: 0 !important;
  }
}
</style>
