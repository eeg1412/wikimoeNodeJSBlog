<template>
  <div
    :class="{
      'page-loading': pageLoading
    }"
  >
    <Transition name="fade">
      <div class="loader-body" v-if="showLoading && pageLoading">
        <span class="loader"><span class="loader-inner"></span></span>
        <div class="loader-text">{{ siteShowLoadingText }}</div>
      </div>
    </Transition>
    <!-- 小于1024宽度时出现的顶部栏 -->
    <div class="blog-top-bar">
      <div class="blog-top-bar-body">
        <div class="blog-top-bar-left-body">
          <nuxt-link :to="homePath">
            <img
              v-if="options.siteLogo"
              class="blog-top-bar-sitelogo light"
              loading="lazy"
              :src="options.siteLogo"
              :alt="options.siteTitle"
            />
            <img
              v-if="options.siteDarkLogo"
              class="blog-top-bar-sitelogo dark"
              loading="lazy"
              :src="options.siteDarkLogo"
              :alt="options.siteTitle"
            />
          </nuxt-link>
        </div>
        <div class="blog-top-bar-right-body">
          <div
            class="blog-top-bar-right-body-item menu-btn"
            @click="toggleLeftMenu"
          >
            <WUIIcon name="i-heroicons-bars-3" />
          </div>
          <div
            class="blog-top-bar-right-body-item sidebar-btn"
            @click="toggleRightSidebar"
          >
            <WUIIcon name="i-heroicons-squares-2x2" />
          </div>
        </div>
      </div>
    </div>
    <!-- 整体layout -->
    <div class="blog-layout-body">
      <!-- 左侧菜单 -->
      <LayoutLeftMenu
        :active="leftMenuActive"
        :page-loading="pageLoading"
        @focusin="focusinLeftMenu"
        @close="toggleLeftMenu"
      />
      <!-- 右侧工具栏 -->
      <LayoutRightSidebar
        :active="rightSidebarActive"
        :page-loading="pageLoading"
        @focusin="focusinRightSidebar"
        @close="toggleRightSidebar"
      />
      <!-- 中间内容 -->
      <div
        class="blog-layout-content-body"
        ref="layoutContentBody"
        @focusin="focusinContentBody"
        :class="{
          'page-leave-active': pageTransition,
          'page-enter-active': !pageTransition
        }"
        :style="layoutContentBodyMinHeightStyle"
      >
        <slot></slot>
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
          ><template
            v-if="options.siteEnableSitemap && options.siteShowSitemapInFooter"
            ><span class="px-2">|</span
            ><a
              :href="seoResourceUrl(options.siteUrl, '/sitemap.xml')"
              target="_blank"
              >{{ t('common.footer.sitemap') }}</a
            ></template
          >
        </div>
        <div v-if="options.siteEnableRss && options.siteShowRssInFooter">
          <span>{{ t('common.footer.rssSubscribe') }}</span
          ><a :href="seoResourceUrl(options.siteUrl, '/rss')" target="_blank">{{
            t('common.footer.rssAll')
          }}</a
          ><span class="px-2">|</span
          ><a
            :href="seoResourceUrl(options.siteUrl, '/rss/blog')"
            target="_blank"
            >{{ t('common.footer.rssBlog') }}</a
          >
          <span class="px-2">|</span
          ><a
            :href="seoResourceUrl(options.siteUrl, '/rss/tweet')"
            target="_blank"
            >{{ t('common.footer.rssTweet') }}</a
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
          <span class="text-xs" v-if="siteShowBlogVersion">
            (v{{ version }})</span
          >
        </div>
      </div>
    </div>
    <div id="rightToolBarMenu"></div>
    <div class="right-tool-bar" id="rightToolBar">
      <GoTop />
      <ClientOnly v-if="options.siteAllowSwitchTheme">
        <ThemeChanger />
      </ClientOnly>
    </div>
  </div>
</template>
<script setup>
const route = useRoute()
const { localePath, seoResourceUrl, t } = useLang()

const homePath = computed(() => localePath('/'))
const layoutContentBody = ref(null)
const layoutContentBodyMinHeight = ref(null)
const layoutContentBodyMinHeightStyle = computed(() => {
  if (layoutContentBodyMinHeight.value) {
    return {
      minHeight: `${layoutContentBodyMinHeight.value}px`
    }
  }
  return {}
})
const pageTransition = ref(false)
let pageTransitionTimer = null
if (import.meta.client) {
  let pageStart = false
  const nuxtApp = useNuxtApp()
  nuxtApp.hook('page:start', () => {
    if (layoutContentBody.value) {
      layoutContentBodyMinHeight.value = layoutContentBody.value.offsetHeight
    }
    pageStart = true
    console.log('page:start')
  })
  nuxtApp.hook('page:finish', () => {
    if (pageStart) {
      pageTransition.value = true
    }
    console.log('page:finish')
  })
  // nuxtApp.hook('page:loading:start', () => {
  //   console.log('page:loading:start')
  // })
  nuxtApp.hook('page:loading:end', () => {
    layoutContentBodyMinHeight.value = null
    pageStart = false
    clearTimeout(pageTransitionTimer)
    pageTransitionTimer = setTimeout(() => {
      pageTransition.value = false
      pageTransitionTimer = null
    }, 200)
    console.log('page:loading:end')
  })
}

const { options } = useOptions()

const config = useRuntimeConfig()
const version = config.public.version

// RSS
const { siteShowLoading, siteShowLoadingText, siteShowBlogVersion } =
  options.value

const showLoading = siteShowLoading
const pageLoading = ref(true)

// 左右菜单
const leftMenuActive = ref(false)
const rightSidebarActive = ref(false)
let menuActiveTimer = null
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
    clearTimeout(menuActiveTimer)
    menuActiveTimer = setTimeout(() => {
      leftMenuActive.value = false
      rightSidebarActive.value = false
      menuActiveTimer = null
    }, 100)
  }
)

const focusinLeftMenu = () => {
  leftMenuActive.value = true
  rightSidebarActive.value = false
}

const focusinRightSidebar = () => {
  rightSidebarActive.value = true
  leftMenuActive.value = false
}

const focusinContentBody = () => {
  leftMenuActive.value = false
  rightSidebarActive.value = false
}

// let observer
onMounted(async () => {
  pageLoading.value = false
})
onUnmounted(() => {
  if (pageTransitionTimer) {
    clearTimeout(pageTransitionTimer)
  }
  if (menuActiveTimer) {
    clearTimeout(menuActiveTimer)
  }
})
</script>
<style scoped>
/* flex布局 左边固定300px 右边固定300px margin10 */
.blog-layout-body {
  @apply bg-white;
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
  box-shadow: 0px 0px 10px 0px rgb(var(--color-primary-600) / 0.08);
  border-radius: 20px;
}
.blog-layout-content-body {
  background-color: #ffffff;
  /* 撑开剩余空间 */
  flex: 1;
  min-width: 0px; /* 防止元素宽度过大 */
  overflow: hidden;
  order: 1;
}
.blog-footer-body {
  @apply dark:bg-black;
  width: 100%;
  padding: 35px 0;
  background: #171717;
  text-align: center;
}
.blog-footer-content-body {
  max-width: 1300px;
  padding: 0 18px;
  margin: 0 auto;
  color: #ffffff;
  line-height: 24px;
  font-size: 15px;
}
.blog-top-bar {
  display: none;
}

/* loader */
.loader-body {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 背景色 */
  @apply bg-primary-500 dark:bg-black dark:text-primary-400;
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
  @apply border-solid border-4 border-white dark:border-primary-400;
  animation: loader 2s infinite ease;
}

.loader-inner {
  vertical-align: top;
  display: inline-block;
  width: 100%;
  @apply bg-white dark:bg-primary-400;
  animation: loader-inner 2s infinite ease-in;
}
.loader-text {
  @apply text-white dark:text-primary-400;
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
    min-height: calc(100dvh - 105px);
    padding-top: 60px;
    margin-top: 0px;
  }
  .blog-top-bar-right-body-item.menu-btn {
    display: flex;
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
    box-shadow: 0px 0px 10px 0px rgb(var(--color-primary-600) / 0.08);
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
  /* .blog-layout-content-body {
    margin-left: 5px;
  } */
}
/* 大于等于769时 */
@media (min-width: 769px) {
  .blog-layout-content-body {
    align-self: flex-end;
    position: sticky;
    z-index: 1;
    bottom: 0px;
    min-height: 100vh;
    min-height: 100dvh;
  }
}
/* 小于768时 */
@media (max-width: 768px) {
  .blog-layout-body {
    margin-bottom: 0px;
  }
  .blog-layout-body {
    flex-direction: column;
  }
  .blog-footer-body {
    padding: 45px 0;
  }
  .blog-top-bar-right-body-item.sidebar-btn {
    display: flex;
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
.right-tool-bar {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 10;
}

.page-enter-active {
  transition: opacity 0.2s ease;
}
.page-leave-active {
  transition: opacity 0s ease;
}

.page-leave-active {
  opacity: 0;
}

.page-enter-active {
  opacity: 1;
}
</style>
