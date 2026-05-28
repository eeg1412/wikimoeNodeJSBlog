<template>
  <div class="blog-body">
    <NuxtLoadingIndicator color="#ef90a7" />
    <div>
      <NuxtLayout>
        <NuxtPage></NuxtPage>
      </NuxtLayout>
    </div>

    <WUINotifications />
    <ClientOnly>
      <PhotoSwipe />
    </ClientOnly>
  </div>
</template>
<script setup>
import { postLogCreateApi, putLogUpdatePerformanceApi } from '@/api/log'
import { normalizeLanguageCode } from '@/lang'
import { getRouteCode } from '~/composables/useLang'
import { isChunkAssetError, trackChunkAssetError } from '@/utils/chunk-error'

const nuxtApp = useNuxtApp()
const route = useRoute()
const router = useRouter()

/**
 * @description 介绍：读取路由中的标准语言码，用于判断 options 是否需要重新加载。
 * @param {object} targetRoute 输入：Nuxt 路由对象。
 * @returns {string} 输出：标准语言码；无语言码或非法语言码时返回空字符串。
 */
function getOptionsRouteLanguageCode(targetRoute) {
  const languageCode = normalizeLanguageCode(getRouteCode(targetRoute))
  if (languageCode) {
    return languageCode
  }

  return ''
}

if (import.meta.client) {
  nuxtApp.hook('app:chunkError', ({ error }) => {
    trackChunkAssetError(error)
  })
}

const { options, getOptions, prepareOptions, commitPreparedOptions } =
  useOptions()
const {
  layoutLanguageSwitchState,
  ensureLayoutLanguageSnapshot,
  beginLayoutLanguageSwitch,
  isCurrentLayoutLanguageSwitch,
  finishLayoutLanguageSwitch,
  prepareLayoutLanguageSnapshot,
  commitLayoutLanguageSnapshot,
  getLayoutLanguageCode
} = useLayoutLanguageSnapshot()
const { lockLanguageDisplay, unlockLanguageDisplay } = useLanguageDisplayState()
const { t } = useLang()
const toast = useWToast()
const { refreshSiteLanguageAvailability } = useSiteLanguageAvailability()
await getOptions()
/**
 * 多语言站语言启用状态是页脚增强信息，进入页面时在 options 就绪后静默融合。
 */
await refreshSiteLanguageAvailability(options.value)
await ensureLayoutLanguageSnapshot(route, options.value)
const currentOptionsLanguageCode = ref(getOptionsRouteLanguageCode(route))
let pendingLanguageSwitchCommit = null

function createLanguageSwitchOptionsParams(toLanguageCode) {
  const optionsParams = {
    force: true
  }

  if (toLanguageCode) {
    optionsParams.languageCode = toLanguageCode
  }

  return optionsParams
}

function getRouteIsLocalized(targetRoute) {
  return Boolean(getRouteCode(targetRoute))
}

function lockCurrentLanguageDisplay() {
  lockLanguageDisplay({
    languageCode: getLayoutLanguageCode(route, options.value),
    isLocalizedRoute: getRouteIsLocalized(route)
  })
}

function clearPendingLanguageSwitch(switchSequence = null) {
  if (switchSequence && !isCurrentLayoutLanguageSwitch(switchSequence)) {
    return
  }

  pendingLanguageSwitchCommit = null
  unlockLanguageDisplay()
}

function commitPendingLanguageSwitch() {
  if (!pendingLanguageSwitchCommit) {
    return
  }

  const pendingCommit = pendingLanguageSwitchCommit
  if (!isCurrentLayoutLanguageSwitch(pendingCommit.switchSequence)) {
    pendingLanguageSwitchCommit = null
    return
  }

  commitPreparedOptions(pendingCommit.preparedOptions)
  /**
   * 语言切换提交新 options 后强制重新读取启用表，确保它和刚获取的 options 同步。
   */
  refreshSiteLanguageAvailability(options.value, { force: true })
  commitLayoutLanguageSnapshot(pendingCommit.layoutLanguageSnapshot)
  currentOptionsLanguageCode.value = pendingCommit.toLanguageCode
  clearPendingLanguageSwitch(pendingCommit.switchSequence)
  finishLayoutLanguageSwitch(pendingCommit.switchSequence)
}

function showLanguageSwitchFailedToast() {
  toast.add({
    title: t('common.error.languageSwitchFailed'),
    icon: 'i-heroicons-x-circle',
    color: 'red'
  })
}

// 路由跳转前
if (import.meta.client) {
  nuxtApp.hook('page:finish', commitPendingLanguageSwitch)
  nuxtApp.hook('page:loading:end', commitPendingLanguageSwitch)

  router.beforeEach(async to => {
    const toLanguageCode = getOptionsRouteLanguageCode(to)

    if (toLanguageCode === currentOptionsLanguageCode.value) {
      if (layoutLanguageSwitchState.value.isSwitching) {
        const switchSequence = beginLayoutLanguageSwitch(toLanguageCode)
        clearPendingLanguageSwitch(switchSequence)
        finishLayoutLanguageSwitch(switchSequence)
      }

      return true
    }

    const switchSequence = beginLayoutLanguageSwitch(toLanguageCode)
    let shouldFinishSwitchInGuard = true
    lockCurrentLanguageDisplay()
    try {
      const preparedOptions = await prepareOptions(
        createLanguageSwitchOptionsParams(toLanguageCode)
      )
      const layoutLanguageSnapshot = await prepareLayoutLanguageSnapshot(
        to,
        preparedOptions.data
      )

      if (!isCurrentLayoutLanguageSwitch(switchSequence)) {
        return false
      }

      pendingLanguageSwitchCommit = {
        switchSequence,
        toLanguageCode,
        preparedOptions,
        layoutLanguageSnapshot
      }
      shouldFinishSwitchInGuard = false
    } catch (error) {
      console.error('准备语言切换数据失败:', error)
      if (isCurrentLayoutLanguageSwitch(switchSequence)) {
        showLanguageSwitchFailedToast()
      }
      return false
    } finally {
      if (shouldFinishSwitchInGuard) {
        if (isCurrentLayoutLanguageSwitch(switchSequence)) {
          clearPendingLanguageSwitch(switchSequence)
          finishLayoutLanguageSwitch(switchSequence)
        }
      }
    }

    return true
  })
}

onErrorCaptured(error => {
  if (!import.meta.client) {
    return
  }

  if (!nuxtApp.isHydrating) {
    return
  }

  if (!isChunkAssetError(error)) {
    return
  }

  return false
})

const { setCommentRetractAuthDecode } = useCommentRetractAuthDecode()
const { setCommentRetractCountData } = useCommentRetractCountData()
const script = []
// console.log(options)
if (options.value.googleAdEnabled) {
  script.push({
    src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${options.value.googleAdId}`,
    async: true,
    crossorigin: 'anonymous'
  })
}

// 主题模式
const siteThemeModeList = ['system', 'light', 'dark']
const siteThemeMode = options.value.siteThemeMode
if (siteThemeModeList && siteThemeModeList.includes(siteThemeMode)) {
  // 给script添加主题模式 先读取 nuxt-color-mode 有没有值，如果没有写入siteThemeMode
  script.push({
    innerHTML: `
      (function() {
        const colorMode = localStorage.getItem('nuxt-color-mode');
        if (!colorMode) {
          localStorage.setItem('nuxt-color-mode', '${siteThemeMode}');
        }
      })();
    `,
    type: 'text/javascript'
  })
}
useHead(() => {
  return {
    script: script
  }
})
const getPerformanceNavigationTiming = () => {
  let dataContentObj = null
  try {
    const navTiming = performance.getEntriesByType('navigation')[0]
    dataContentObj = {
      connectDuration:
        typeof navTiming.connectEnd === 'number' &&
        typeof navTiming.connectStart === 'number'
          ? Math.floor(navTiming.connectEnd) -
            Math.floor(navTiming.connectStart)
          : null,
      domComplete:
        typeof navTiming.domComplete === 'number'
          ? Math.floor(navTiming.domComplete)
          : null,
      domInteractive:
        typeof navTiming.domInteractive === 'number'
          ? Math.floor(navTiming.domInteractive)
          : null,
      domainLookupDuration:
        typeof navTiming.domainLookupEnd === 'number' &&
        typeof navTiming.domainLookupStart === 'number'
          ? Math.floor(navTiming.domainLookupEnd) -
            Math.floor(navTiming.domainLookupStart)
          : null,
      duration:
        typeof navTiming.duration === 'number'
          ? Math.floor(navTiming.duration)
          : null,
      loadEventDuration:
        typeof navTiming.loadEventEnd === 'number' &&
        typeof navTiming.loadEventStart === 'number'
          ? Math.floor(navTiming.loadEventEnd) -
            Math.floor(navTiming.loadEventStart)
          : null,
      redirectCount:
        typeof navTiming.redirectCount === 'number'
          ? navTiming.redirectCount
          : null,
      entryType: navTiming.entryType || null,
      name: navTiming.name || null,
      type: navTiming.type || null
    }
  } catch (e) {
    dataContentObj = null
  }
  return dataContentObj
}
let openLogId = null
const postLogCreate = () => {
  const referrer = document.referrer
  let dataContentObj = getPerformanceNavigationTiming()

  let performanceNavigationTiming = null
  const duration = dataContentObj?.duration || 0
  if (dataContentObj && duration > 0) {
    performanceNavigationTiming = dataContentObj
  }
  postLogCreateApi({
    referrer: referrer,
    action: 'open',
    timeZone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone,
    language: navigator?.language,
    performanceNavigationTiming: performanceNavigationTiming
  }).then(res => {
    openLogId = res.id
    // 如果 performanceNavigationTiming的duration为0，则250毫秒后再次获取
    if (dataContentObj && duration === 0) {
      setTimeout(() => {
        updatePerformance()
      }, 100)
    }
  })
}

let tryCount = 0
const updatePerformance = () => {
  const performanceNavigationTiming = getPerformanceNavigationTiming()
  if (performanceNavigationTiming && performanceNavigationTiming.duration > 0) {
    putLogUpdatePerformanceApi({
      id: openLogId,
      action: 'open',
      performanceNavigationTiming: performanceNavigationTiming
    })
  } else if (tryCount < 60) {
    setTimeout(() => {
      updatePerformance()
    }, 1000)
    tryCount++
  }
}

// watch 路由变化 重新设置 og:url
watch(
  () => route.path,
  () => {
    const { getCurrentUrl } = usePostSeo()
    useSeoMeta({
      ogUrl: getCurrentUrl()
    })
  },
  { immediate: true }
)

const setStyle = () => {
  // 如果存在 options.siteExtraCss
  if (options.value.siteExtraCss) {
    useHead({
      style: [options.value.siteExtraCss]
    })
  }
}
setStyle()

const setJs = () => {
  // 如果存在 options.siteExtraJs
  if (options.value.siteExtraJs) {
    useHead({
      script: [
        {
          innerHTML: options.value.siteExtraJs,
          type: 'text/javascript'
        }
      ]
    })
  }
}
setJs()

// 全屏状态
const { setFullscreen } = useIsFullscreen()

// 全屏状态变化时的回调函数
const onFullscreenChange = () => {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  ) {
    console.log('进入全屏')
    // 进入全屏后的逻辑
    setFullscreen(true)
  } else {
    console.log('退出全屏')
    // 退出全屏后的逻辑
    setFullscreen(false)
  }
}

// 添加全屏事件监听器
const addFullscreenChangeListener = () => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  document.addEventListener('mozfullscreenchange', onFullscreenChange)
}

// 移除全屏事件监听器
const removeFullscreenChangeListener = () => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  document.removeEventListener('mozfullscreenchange', onFullscreenChange)
}

onMounted(() => {
  // 检查uuid
  checkUuid()
  // 获取referrer
  postLogCreate()
  addFullscreenChangeListener()
  setCommentRetractAuthDecode()
  setCommentRetractCountData()
})
onUnmounted(() => {
  removeFullscreenChangeListener()
})
</script>
<style scoped>
.blog-body {
  font-size: 14px;
}
</style>
<!-- <style>
.page-enter-active {
  transition: all 0.4s;
  transition-delay: 0.2s;
}
.page-enter-from {
  opacity: 0;
}
</style> -->
