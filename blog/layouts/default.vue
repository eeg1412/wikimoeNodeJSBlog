<template>
  <div
    :class="{
      'page-loading': pageLoading,
    }"
  >
    <Transition name="fade">
      <div class="loader-body" v-if="showLoading && pageLoading">
        <span class="loader"><span class="loader-inner"></span></span>
        <div class="loader-text">正在召唤神秘力量</div>
      </div>
    </Transition>
    <!-- 小于1024宽度时出现的顶部栏 -->
    <div class="blog-top-bar">
      <div class="blog-top-bar-body">
        <div class="blog-top-bar-left-body">
          <nuxt-link to="/">
            <img
              class="blog-top-bar-sitelogo"
              :src="options.siteLogo"
              :alt="options.siteTitle"
            />
          </nuxt-link>
        </div>
        <div class="blog-top-bar-right-body">
          <div
            class="blog-top-bar-right-body-item menu-btn"
            @click="toggleLeftMenu"
          >
            <UIcon name="i-heroicons-bars-3" />
          </div>
          <div
            class="blog-top-bar-right-body-item sidebar-btn"
            @click="toggleRightSidebar"
          >
            <UIcon name="i-heroicons-squares-2x2" />
          </div>
        </div>
      </div>
    </div>
    <!-- 整体layout -->
    <div class="blog-layout-body">
      <div
        class="blog-layout-left-body"
        :class="{
          active: leftMenuActive,
        }"
      >
        <!-- 关闭按钮 -->
        <div
          class="justify-between layout-close-btn-body type-l layout-mobile-navi-btn-body"
        >
          <div class="text-xl font-bold">导航</div>
          <div class="text-xl cursor-pointer" @click="toggleLeftMenu">
            <UIcon name="i-heroicons-x-mark" />
          </div>
        </div>
        <div class="blog-layout-sticky custom-scroll blog-layout-info-menu">
          <div class="blog-layout-left-top-info-body">
            <!-- logo -->
            <div>
              <nuxt-link to="/">
                <img
                  class="blog-layout-sitelogo"
                  :src="options.siteLogo"
                  :alt="options.siteTitle"
                />
              </nuxt-link>
            </div>
            <!-- siteDescription -->
            <div class="blog-layout-desc">
              <p>{{ options.siteDescription }}</p>
            </div>
          </div>
          <!-- 导航 -->
          <ul class="blog-layout-sidebar-body custom-scroll">
            <template v-for="(item, index) in naviList" :key="index">
              <NaviItem :item="item" :currentPath="currentPath" />
            </template>
          </ul>
          <!-- 图片 -->
          <div
            class="blog-layout-info-menu-bg blog-layout-info-menu-bt-img"
          ></div>
        </div>
      </div>
      <div class="blog-layout-content-body">
        <slot></slot>
      </div>
      <div
        class="blog-layout-right-body custom-scroll"
        :class="{
          active: rightSidebarActive,
          'blog-layout-right-body-full-height': layoutRightBoxHeight === 0,
        }"
      >
        <div class="blog-layout-right-top-body">
          <!-- 关闭按钮 -->
          <div class="justify-between mb-5 layout-close-btn-body type-r">
            <div class="text-xl font-bold">侧边栏</div>
            <div class="text-xl cursor-pointer" @click="toggleRightSidebar">
              <UIcon name="i-heroicons-x-mark" />
            </div>
          </div>
          <!-- 搜索 -->
          <div class="blog-search-body">
            <UInput
              v-model="keyword"
              placeholder="请输入关键词"
              size="lg"
              variant="none"
              @keydown.enter="goSearch"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing>
                <UButton
                  color="gray"
                  variant="link"
                  icon="i-heroicons-magnifying-glass-20-solid"
                  :padded="false"
                  @click="goSearch"
                />
              </template>
            </UInput>
          </div>
        </div>
        <div
          class="blog-layout-right-box"
          ref="layoutRightBox"
          :style="{
            top: -layoutRightBoxHeight + 'px',
          }"
        >
          <div
            v-for="(item, index) in sidebarListData"
            :key="item._id"
            class="blog-layout-right-sidebar-item"
          >
            <!-- title -->
            <div class="blog-layout-right-title-body">
              {{ item.title }}
            </div>
            <template v-if="item.type === 1">
              <HtmlContent :content="item.content" />
            </template>
            <template v-else-if="item.type === 3">
              <CommentLatest />
            </template>
            <template v-else-if="item.type === 8">
              <Sort />
            </template>
            <template v-else-if="item.type === 9">
              <Archive />
            </template>
            <template v-else-if="item.type === 10">
              <AdsbygoogleHave :ad="item.content" />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- footer Powered by wikimoeBlog -->
    <div class="blog-footer-body">
      <div class="blog-footer-content-body">
        <div>
          <!-- copyright -->
          <span
            ><span class="font-serif">©</span> {{ nowYear }}
            {{ options.siteTitle }}</span
          >
        </div>
        <div
          v-html="options.siteFooterInfo"
          v-if="options.siteFooterInfo"
          class="whitespace-pre-wrap"
        ></div>
        <div>
          <span>Powered by </span>
          <a href="https://www.wikimoe.com/" target="_blank">wikimoeBlog</a>
        </div>
      </div>
    </div>
    <GoTop />
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'
import { getNaviListApi } from '@/api/navi'
import { getSidebarListApi } from '@/api/sidebar'

const route = useRoute()
const router = useRouter()
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const runtimeConfig = useRuntimeConfig()
const showLoading = runtimeConfig.public.showLoading

// const toast = useToast()
// sidebar
// const naviList = ref([
//   {
//     title: '首页',
//     path: '/',
//   },
// ])
const [naviData, sidebarData] = await Promise.all([
  getNaviListApi(),
  getSidebarListApi(),
])

const { data: naviListData } = naviData
const { data: sidebarListData } = sidebarData
const naviList = computed(() => {
  const list = naviListData.value.data
  const newList = [
    {
      naviname: '首页',
      url: '/',
      isdefault: true,
    },
    ...list,
  ]
  // console.log(newList)
  return newList
})
// 当前路由的path
const currentPath = computed(() => {
  return route.path
})

const keyword = ref('')
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, '') // $& means the whole matched string
}
const goSearch = () => {
  const keywordValue = escapeRegExp(keyword.value.trim())
  if (keyword.value) {
    router.push({
      path: `/post/list/keyword/${keywordValue}/1`,
    })
    keyword.value = ''
  }
}

const layoutRightBox = ref(null)
let windowHeight = 0
let setWindowHeightTimer = null
const setWindowHeight = () => {
  if (windowHeight !== undefined) {
    windowHeight = window.innerHeight || 0
    sumLayoutRightBoxHeight()
  }
}
const setWindowHeightResize = () => {
  clearTimeout(setWindowHeightTimer)
  setWindowHeightTimer = setTimeout(() => {
    setWindowHeight()
  }, 100)
}
// 计算layoutRightBox高度和window高度的差
const layoutRightBoxHeight = ref(0)
const sumLayoutRightBoxHeight = () => {
  if (layoutRightBox.value) {
    let newTop = layoutRightBox.value.offsetHeight - windowHeight
    if (newTop < 0) {
      newTop = 0
    }
    layoutRightBoxHeight.value = newTop
    console.log(layoutRightBox.value.offsetHeight, windowHeight)
  } else {
    layoutRightBoxHeight.value = 0
  }
}
const pageLoading = ref(true)

// 左右菜单
const leftMenuActive = ref(false)
const rightSidebarActive = ref(false)
const toggleLeftMenu = () => {
  leftMenuActive.value = !leftMenuActive.value
}
const toggleRightSidebar = () => {
  rightSidebarActive.value = !rightSidebarActive.value
}

const nowYear = new Date().getFullYear()
// 检测到路由跳转时关闭左右菜单
watch(
  () => route.path,
  (newVal, oldVal) => {
    leftMenuActive.value = false
    rightSidebarActive.value = false
    setWindowHeight()
    setTimeout(() => {
      setWindowHeight()
    }, 2000)
  }
)

// let observer
onMounted(async () => {
  // observer = new ResizeObserver((entries) => {
  //   for (let entry of entries) {
  //     setWindowHeightResize()
  //   }
  // })
  // observer.observe(layoutRightBox.value)
  pageLoading.value = false
  setWindowHeight()
  setTimeout(() => {
    setWindowHeight()
  }, 1000)
  window.addEventListener('resize', setWindowHeightResize)
})
onUnmounted(() => {
  // if (observer) {
  //   observer.disconnect()
  // }
  window.removeEventListener('resize', setWindowHeightResize)
})
</script>
<style scoped>
/* flex布局 左边固定300px 右边固定300px margin10 */
.blog-layout-body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  margin: 10px;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  margin-bottom: 20px;
  margin-top: 15px;
  box-shadow: 0px 0px 10px 0px rgba(239, 144, 167, 0.08);
  border-radius: 20px;
}
.blog-layout-left-body {
  width: 300px;
  box-sizing: border-box;
  flex: 0 0 300px;
  border-right: 2px solid #fff7f9;
}
.blog-layout-content-body {
  background-color: #ffffff;
  /* 撑开剩余空间 */
  flex: 1;
  overflow: hidden;
}
.blog-layout-right-body {
  width: 300px;
  box-sizing: border-box;
  flex: 0 0 300px;
  border-left: 2px solid #fff7f9;
}
.blog-layout-right-body.blog-layout-right-body-full-height {
  background-color: #ffffff;
  /* 右上角 右下角圆角 */
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}
.blog-layout-info-menu {
  /* padding: 20px; */
  height: 100vh;
  height: 100dvh;
  overflow: auto;
  /* 左下角圆角 */
  /* border-bottom-left-radius: 20px; */
  display: flex;
  flex-direction: column;
}
.blog-layout-left-top-info-body,
.blog-layout-info-menu-bt-img {
  flex-shrink: 0;
}
.blog-layout-info-menu-bt-img {
  height: 250px;
  width: 100%;
  /* 左下角圆角 */
  border-bottom-left-radius: 20px;
}
.blog-layout-left-top-info-body {
  padding: 20px 20px 0 20px;
  box-sizing: border-box;
}
.blog-layout-info-menu-bg {
  background-image: url('/img/menuBg.png?v=2');
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 100%;
}
.blog-layout-info-menu-bg.no-bg {
  background-image: none;
}
.blog-layout-sticky {
  position: sticky;
  top: 0px;
  background-color: #fffdfd;
  /* 左上角,左下角20px 圆角 */
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
.blog-layout-sitelogo {
  width: 100%;
}
.blog-layout-desc {
  padding: 15px 0;
  border-bottom: 1px solid #e2e2e2;
}
.blog-layout-sidebar-body {
  flex: 1;
  /* min-height: 200px; */
  box-sizing: border-box;
  padding: 20px;
  overflow: auto;
}
.blog-footer-body {
  width: 100%;
  padding: 35px 0;
  background: #171717;
  text-align: center;
}
.blog-footer-content-body {
  max-width: 1300px;
  padding: 0 20px;
  margin: 0 auto;
  color: #ffffff;
  line-height: 24px;
  font-size: 15px;
}
.blog-top-bar {
  display: none;
}
.layout-close-btn-body {
  display: none;
}
.layout-mobile-navi-btn-body {
  padding: 20px;
  background: #fffdfd;
  position: sticky;
  top: 0px;
  z-index: 2;
}
.blog-layout-right-box {
  padding: 0 20px 20px 20px;
  position: sticky;
  top: 0px;
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
  padding: 20px;
  position: sticky;
  z-index: 2;
  top: 0px;
  background: #ffffff;
  /* 右上圆角 */
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
/* 最后一个不margin */
.blog-layout-right-sidebar-item:last-child {
  margin-bottom: 0px;
}

/* loader */
.loader-body {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 背景色 */
  @apply bg-primary-500;
  z-index: 99999;
  /* flex 居中 column */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;
}
.loader {
  display: inline-block;
  width: 30px;
  height: 30px;
  position: relative;
  @apply border-solid border-4 border-white;
  animation: loader 2s infinite ease;
}

.loader-inner {
  vertical-align: top;
  display: inline-block;
  width: 100%;
  @apply bg-white;
  animation: loader-inner 2s infinite ease-in;
}
.loader-text {
  @apply text-white;
  font-size: 16px;
  margin-top: 20px;
}
/* fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes loader {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(180deg);
  }

  50% {
    transform: rotate(180deg);
  }

  75% {
    transform: rotate(360deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes loader-inner {
  0% {
    height: 0%;
  }

  25% {
    height: 0%;
  }

  50% {
    height: 100%;
  }

  75% {
    height: 100%;
  }

  100% {
    height: 0%;
  }
}
/* 小于1024时隐藏左右侧边栏 */
@media (max-width: 1024px) {
  .blog-layout-body {
    margin-bottom: 0px;
    min-height: calc(100vh - 105px);
    min-height: calc(100vh - 105px);
    padding-top: 60px;
    margin-top: 0px;
  }
  .blog-top-bar-right-body-item.menu-btn {
    display: flex;
  }
  .layout-close-btn-body.type-l {
    display: flex;
  }
  .blog-layout-info-menu-bt-img {
    display: none;
  }
  .blog-layout-info-menu-bg,
  .blog-layout-sidebar-body {
    padding-top: 0px;
  }
  .blog-layout-info-menu {
    height: auto;
  }
  .blog-layout-left-body {
    transform: translateX(-100%);
    opacity: 0;
    transition: all 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 21;
    width: 100%;
    height: 100%;
    border-right: 0px solid #fff7f9;
    background-color: #fffdfd;
    display: block;
    overflow: auto;
  }
  .blog-layout-left-body.active {
    transform: translateX(0%);
    opacity: 1;
  }
  .blog-layout-sticky {
    background-image: none;
    /* 去掉圆角 */
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }
  .blog-layout-left-top-info-body {
    display: none;
  }
  .blog-layout-left-body.show {
    display: block;
  }
  /* .blog-layout-sticky {
    top: 60px;
  }
  .blog-layout-info-menu {
    height: calc(100vh - 60px);
    height: calc(100dvh - 60px);
  }
  .blog-layout-left-body {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  } */
  /* .blog-layout-right-body {
    display: none;
  } */
  .blog-layout-right-top-body {
    top: 60px;
  }
  /* 顶部导航栏 */
  .blog-top-bar {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    @apply bg-white;
  }
  .blog-top-bar-body {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 10px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* 底部阴影 */
    box-shadow: 0px 0px 10px 0px rgba(239, 144, 167, 0.08);
  }
  .blog-top-bar-left-body {
    display: flex;
    align-items: center;
  }
  .blog-top-bar-sitelogo {
    height: 40px;
  }
  .blog-top-bar-right-body {
    display: flex;
    align-items: center;
  }
  .blog-top-bar-right-body-item {
    font-size: 20px;
    margin-left: 10px;
    display: none;
    align-items: center;
    cursor: pointer;
  }
  .blog-layout-content-body {
    margin-left: 5px;
  }
}
/* 小于768时 */
@media (max-width: 768px) {
  .blog-layout-content-body {
    margin-left: 0px;
  }
  .blog-layout-body {
    margin-bottom: 0px;
  }
  .blog-layout-body {
    flex-direction: column;
  }
  .blog-layout-right-body {
    /* display: none; */
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
    /* 右上角 右下角 没有圆角 */
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
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
  .blog-top-bar-right-body-item.sidebar-btn {
    display: flex;
  }
}
/* 高度小于600时 blog-layout-info-menu-bg 的背景图片为none */
@media (max-height: 600px) {
  .blog-layout-info-menu-bg {
    background-image: none;
    display: none;
  }
}
/* .google-ad-bt {
  max-height: 20vh;
  background: #fff;
  max-width: 1300px;
  margin: 0 auto;
  margin-bottom: 20px;
  margin-top: 20px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0px 0px 10px 0px rgba(239, 144, 167, 0.08);
} */
</style>
