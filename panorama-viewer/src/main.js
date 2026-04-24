import '@photo-sphere-viewer/core/index.css'

import { Viewer } from '@photo-sphere-viewer/core'
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin'

import './style.css'

const toolbarElement = document.querySelector('#toolbar')
const statusElement = document.querySelector('#status')
const statusTitleElement = document.querySelector('#status-title')
const statusTextElement = document.querySelector('#status-text')
const errorElement = document.querySelector('#error')
const errorTitleElement = document.querySelector('#error-title')
const errorTextElement = document.querySelector('#error-text')
const errorHomeButtonElement = document.querySelector('#error-home-button')
const viewerElement = document.querySelector('#viewer')
const homeButtonElement = document.querySelector('#home-button')
const fisheyeButtonElement = document.querySelector('#fisheye-button')
const gyroscopeButtonElement = document.querySelector('#gyroscope-button')
const vrButtonElement = document.querySelector('#vr-button')

const searchParams = new URLSearchParams(window.location.search)

const localeMessages = {
  'zh-CN': {
    documentTitle: '全景照片查看器',
    statusTitle: '全景照片查看器',
    statusInitializing: '初始化中...',
    statusLoading: '正在加载全景照片...',
    errorTitle: '无法显示全景照片',
    errorMissingSrc:
      '缺少全景照片地址。请通过 query 参数传入 src，例如 ?src=/upload/panorama.jpg',
    errorLoad: '全景图无法加载，请检查 query 参数中的图片地址是否正确。',
    errorVrEnter: '进入 VR 模式失败，请检查权限或设备支持情况。',
    errorVrInit: '初始化 VR 模式失败，请检查权限或设备支持情况。',
    buttons: {
      home: '返回首页',
      fisheye: '切换镜头模式',
      gyroscope: '动态体感视角',
      vr: 'VR模式'
    },
    viewerLang: {
      zoom: '缩放',
      zoomOut: '缩小',
      zoomIn: '放大',
      moveUp: '向上移动',
      moveDown: '向下移动',
      moveLeft: '向左移动',
      moveRight: '向右移动',
      description: '描述',
      download: '下载',
      fullscreen: '全屏',
      loading: '加载中...',
      menu: '菜单',
      close: '关闭',
      twoFingers: '使用双指导航',
      ctrlZoom: '使用Ctrl+滚轮缩放图片',
      loadError: '全景图无法加载',
      webglError: '您的浏览器似乎不支持 WebGL',
      gyroscope: '动态体感视角'
    }
  },
  'zh-TW': {
    documentTitle: '全景照片檢視器',
    statusTitle: '全景照片檢視器',
    statusInitializing: '初始化中...',
    statusLoading: '正在載入全景照片...',
    errorTitle: '無法顯示全景照片',
    errorMissingSrc:
      '缺少全景照片地址。請透過 query 參數傳入 src，例如 ?src=/upload/panorama.jpg',
    errorLoad: '全景圖無法載入，請檢查 query 參數中的圖片地址是否正確。',
    errorVrEnter: '進入 VR 模式失敗，請檢查權限或裝置支援情況。',
    errorVrInit: '初始化 VR 模式失敗，請檢查權限或裝置支援情況。',
    buttons: {
      home: '返回首頁',
      fisheye: '切換鏡頭模式',
      gyroscope: '動態體感視角',
      vr: 'VR模式'
    },
    viewerLang: {
      zoom: '縮放',
      zoomOut: '縮小',
      zoomIn: '放大',
      moveUp: '向上移動',
      moveDown: '向下移動',
      moveLeft: '向左移動',
      moveRight: '向右移動',
      description: '描述',
      download: '下載',
      fullscreen: '全螢幕',
      loading: '載入中...',
      menu: '選單',
      close: '關閉',
      twoFingers: '請使用雙指操作',
      ctrlZoom: '請使用 Ctrl + 滾輪縮放圖片',
      loadError: '全景圖無法載入',
      webglError: '您的瀏覽器似乎不支援 WebGL',
      gyroscope: '動態體感視角'
    }
  },
  en: {
    documentTitle: 'Panorama Viewer',
    statusTitle: 'Panorama Viewer',
    statusInitializing: 'Initializing...',
    statusLoading: 'Loading panorama...',
    errorTitle: 'Unable to Display Panorama',
    errorMissingSrc:
      'Missing panorama image URL. Pass it via the src query parameter, for example ?src=/upload/panorama.jpg',
    errorLoad:
      'The panorama image could not be loaded. Check whether the image URL in the query parameter is correct.',
    errorVrEnter:
      'Failed to enter VR mode. Check permissions or device support.',
    errorVrInit:
      'Failed to initialize VR mode. Check permissions or device support.',
    buttons: {
      home: 'Go Home',
      fisheye: 'Toggle Lens Mode',
      gyroscope: 'Motion View',
      vr: 'VR Mode'
    },
    viewerLang: {
      zoom: 'Zoom',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      moveUp: 'Move up',
      moveDown: 'Move down',
      moveLeft: 'Move left',
      moveRight: 'Move right',
      description: 'Description',
      download: 'Download',
      fullscreen: 'Fullscreen',
      loading: 'Loading...',
      menu: 'Menu',
      close: 'Close',
      twoFingers: 'Use two fingers to navigate',
      ctrlZoom: 'Use Ctrl + wheel to zoom the image',
      loadError: 'The panorama image could not be loaded',
      webglError: 'Your browser does not seem to support WebGL',
      gyroscope: 'Motion View'
    }
  },
  ja: {
    documentTitle: 'パノラマビューア',
    statusTitle: 'パノラマビューア',
    statusInitializing: '初期化中...',
    statusLoading: 'パノラマ画像を読み込み中...',
    errorTitle: 'パノラマ画像を表示できません',
    errorMissingSrc:
      'パノラマ画像の URL がありません。query パラメーターの src で指定してください。例: ?src=/upload/panorama.jpg',
    errorLoad:
      'パノラマ画像を読み込めませんでした。query パラメーターの画像 URL が正しいか確認してください。',
    errorVrEnter:
      'VR モードに入れませんでした。権限またはデバイスの対応状況を確認してください。',
    errorVrInit:
      'VR モードの初期化に失敗しました。権限またはデバイスの対応状況を確認してください。',
    buttons: {
      home: 'ホームへ戻る',
      fisheye: 'レンズモードを切り替え',
      gyroscope: 'モーションビュー',
      vr: 'VRモード'
    },
    viewerLang: {
      zoom: 'ズーム',
      zoomOut: 'ズームアウト',
      zoomIn: 'ズームイン',
      moveUp: '上へ移動',
      moveDown: '下へ移動',
      moveLeft: '左へ移動',
      moveRight: '右へ移動',
      description: '説明',
      download: 'ダウンロード',
      fullscreen: '全画面',
      loading: '読み込み中...',
      menu: 'メニュー',
      close: '閉じる',
      twoFingers: '2 本指で操作してください',
      ctrlZoom: 'Ctrl + ホイールで画像を拡大縮小します',
      loadError: 'パノラマ画像を読み込めません',
      webglError:
        'お使いのブラウザーは WebGL をサポートしていない可能性があります',
      gyroscope: 'モーションビュー'
    }
  }
}

const normalizeLocale = locale => {
  const localeText = String(locale || '')
    .trim()
    .toLowerCase()

  if (!localeText) {
    return 'en'
  }

  if (
    localeText === 'zh-tw' ||
    localeText === 'zh-hk' ||
    localeText === 'zh-mo' ||
    localeText === 'zh-hant' ||
    localeText.startsWith('zh-tw') ||
    localeText.startsWith('zh-hk') ||
    localeText.startsWith('zh-mo') ||
    localeText.startsWith('zh-hant')
  ) {
    return 'zh-TW'
  }

  if (
    localeText === 'zh' ||
    localeText === 'zh-cn' ||
    localeText === 'zh-sg' ||
    localeText === 'zh-hans' ||
    localeText.startsWith('zh-cn') ||
    localeText.startsWith('zh-sg') ||
    localeText.startsWith('zh-hans') ||
    localeText.startsWith('zh')
  ) {
    return 'zh-CN'
  }

  if (localeText === 'ja' || localeText.startsWith('ja-')) {
    return 'ja'
  }

  if (localeText === 'en' || localeText.startsWith('en-')) {
    return 'en'
  }

  return 'en'
}

const resolveLocale = () => {
  const queryLocale = searchParams.get('lang')

  if (queryLocale) {
    return normalizeLocale(queryLocale)
  }

  return 'en'
}

const currentLocale = resolveLocale()
const currentMessages = localeMessages[currentLocale]

let viewer = null
let gyroscopePlugin = null
let gyroscopeIsEnabled = false
let fisheyeMode = false
let vrViewer = null
let vrViewerModule = null
let vrLoading = false

const iconMap = {
  fisheyeOn: `
    <svg viewBox="0 0 23 23" aria-hidden="true" focusable="false">
      <circle cx="11.5" cy="11.5" r="10" stroke="currentColor" stroke-width="2" fill="none"></circle>
      <mask id="fisheye-on-mask">
        <rect width="23" height="23" fill="white"></rect>
        <circle cx="14" cy="9.5" r="1.8" fill="black"></circle>
      </mask>
      <circle cx="11.5" cy="11.5" r="7.5" fill="currentColor" mask="url(#fisheye-on-mask)"></circle>
    </svg>
  `,
  fisheyeOff: `
    <svg viewBox="0 0 23 23" aria-hidden="true" focusable="false">
      <path
        d="M2 8Q2 5 5 4Q11.5 2 18 4Q21 5 21 8L21 15Q21 18 18 19Q11.5 21 5 19Q2 18 2 15L2 8Z"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      ></path>
      <mask id="fisheye-off-mask">
        <rect width="23" height="23" fill="white"></rect>
        <circle cx="14" cy="9.5" r="1.8" fill="black"></circle>
      </mask>
      <path
        d="M5 8Q5 6.5 7 6Q11.5 5 16 6Q18 6.5 18 8L18 15Q18 16.5 16 17Q11.5 18 7 17Q5 16.5 5 15L5 8Z"
        fill="currentColor"
        mask="url(#fisheye-off-mask)"
      ></path>
    </svg>
  `,
  gyroscopeOff: `
    <svg viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M714-600q-14 0-24-10t-10-24v-132q0-14 10-24t24-10h6v-40q0-33 23.5-56.5T800-920q33 0 56.5 23.5T880-840v40h6q14 0 24 10t10 24v132q0 14-10 24t-24 10H714Zm46-200h80v-40q0-17-11.5-28.5T800-880q-17 0-28.5 11.5T760-840v40ZM480 0q-99 0-186.5-37.5t-153-103Q75-206 37.5-293.5T0-480h80q0 71 24 136t66.5 117Q213-175 272-138.5T401-87L296-192l56-56L588-12q-26 6-53.5 9T480 0ZM373-556q13 0 21.5-9t8.5-21q0-13-8.5-21.5T373-616q-12 0-21 8.5t-9 21.5q0 12 9 21t21 9Zm122.97 374L182.03-496Q171-507 165.5-521.5 160-536 160-550q0-15 5.5-29t16.54-25.06l173.61-173.88Q366.69-789 381.25-795q14.55-6 28.6-6 15.05 0 29.1 6t25.08 17.03l313.94 313.74Q789-453.2 795-439.17q6 14.03 6 29.07 0 14.03-6 28.57Q789-367 777.96-356L604.35-182q-11.04 11-25.09 16.5t-29.11 5.5q-14.05 0-28.6-5.5T495.97-182Z"
      ></path>
    </svg>
  `,
  gyroscopeOn: `
    <svg viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M480 0q-99 0-186.5-37.5t-153-103Q75-206 37.5-293.5T0-480h80q0 71 24 136t66.5 117Q213-175 272-138.5T401-87L296-192l56-56L588-12q-26 6-53.5 9T480 0Zm400-480q0-71-24-136t-66.5-117Q747-785 688-821.5T559-873l105 105-56 56-236-236q26-6 53.5-9t54.5-3q99 0 186.5 37.5t153 103q65.5 65.5 103 153T960-480h-80ZM496-182 182.03-496Q171-507 165.5-521q-5.5-14-5.5-29t5.74-29q5.74-14 16.26-25l173.62-174q11.03-11 25.08-16.5 14.05-5.5 29.11-5.5 15.05 0 29.1 5.5T464-778l313.97 313.97Q789-453 794.5-439q5.5 14 5.5 29t-5.74 29q-5.74 14-16.26 25L604.38-182q-11.03 11-25.08 16.5-14.05 5.5-29.11 5.5-15.05 0-29.1-5.5T496-182ZM373-556q13 0 21.5-9t8.5-21q0-13-8.5-21.5T373-616q-12 0-21 8.5t-9 21.5q0 12 9 21t21 9Z"
      ></path>
    </svg>
  `,
  vr: `
    <svg viewBox="0 0 640 640" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M544 160L96 160C60.7 160 32 188.7 32 224L32 416C32 451.3 60.7 480 96 480L213.5 480C230.5 480 246.8 473.3 258.8 461.3L292.7 427.4C299.9 420.2 309.8 416.1 320 416.1C330.2 416.1 340.1 420.2 347.3 427.4L381.2 461.3C393.2 473.3 409.5 480 426.5 480L544 480C579.3 480 608 451.3 608 416L608 224C608 188.7 579.3 160 544 160zM112 304C112 268.7 140.7 240 176 240C211.3 240 240 268.7 240 304C240 339.3 211.3 368 176 368C140.7 368 112 339.3 112 304zM464 240C499.3 240 528 268.7 528 304C528 339.3 499.3 368 464 368C428.7 368 400 339.3 400 304C400 268.7 428.7 240 464 240z"
      ></path>
    </svg>
  `,
  vrLoading: `
    <svg viewBox="0 0 640 640" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM272 528C272 501.5 293.5 480 320 480C346.5 480 368 501.5 368 528C368 554.5 346.5 576 320 576C293.5 576 272 554.5 272 528zM112 272C138.5 272 160 293.5 160 320C160 346.5 138.5 368 112 368C85.5 368 64 346.5 64 320C64 293.5 85.5 272 112 272zM480 320C480 293.5 501.5 272 528 272C554.5 272 576 293.5 576 320C576 346.5 554.5 368 528 368C501.5 368 480 346.5 480 320zM139 433.1C157.8 414.3 188.1 414.3 206.9 433.1C225.7 451.9 225.7 482.2 206.9 501C188.1 519.8 157.8 519.8 139 501C120.2 482.2 120.2 451.9 139 433.1zM139 139C157.8 120.2 188.1 120.2 206.9 139C225.7 157.8 225.7 188.1 206.9 206.9C188.1 225.7 157.8 225.7 139 206.9C120.2 188.1 120.2 157.8 139 139zM501 433.1C519.8 451.9 519.8 482.2 501 501C482.2 519.8 451.9 519.8 433.1 501C414.3 482.2 414.3 451.9 433.1 433.1C451.9 414.3 482.2 414.3 501 433.1z"
      ></path>
    </svg>
  `,
  home: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"/></svg>
  `
}

const applyStaticTexts = () => {
  document.documentElement.lang = currentLocale
  document.title = currentMessages.documentTitle
  statusTitleElement.textContent = currentMessages.statusTitle
  statusTextElement.textContent = currentMessages.statusInitializing
  errorTitleElement.textContent = currentMessages.errorTitle
  homeButtonElement.title = currentMessages.buttons.home
  homeButtonElement.setAttribute('aria-label', currentMessages.buttons.home)
  fisheyeButtonElement.title = currentMessages.buttons.fisheye
  fisheyeButtonElement.setAttribute(
    'aria-label',
    currentMessages.buttons.fisheye
  )
  gyroscopeButtonElement.title = currentMessages.buttons.gyroscope
  gyroscopeButtonElement.setAttribute(
    'aria-label',
    currentMessages.buttons.gyroscope
  )
  vrButtonElement.title = currentMessages.buttons.vr
  vrButtonElement.setAttribute('aria-label', currentMessages.buttons.vr)
  errorHomeButtonElement.textContent = currentMessages.buttons.home
  errorHomeButtonElement.setAttribute(
    'aria-label',
    currentMessages.buttons.home
  )
}

const setStatus = text => {
  statusTextElement.textContent = text
  statusElement.classList.remove('hidden')
}

const hideStatus = () => {
  statusElement.classList.add('hidden')
}

const hideViewerErrorOverlay = () => {
  try {
    viewer?.hideError?.()
  } catch (error) {
    console.warn('隐藏 Photo Sphere Viewer 错误层失败:', error)
  }
}

const showError = text => {
  hideStatus()
  hideViewerErrorOverlay()
  errorTextElement.textContent = text
  errorElement.classList.remove('hidden')
  updateToolbarVisibility()
}

const hideError = () => {
  errorElement.classList.add('hidden')
}

const resolvePanoramaSrc = () => {
  const source =
    searchParams.get('src') ||
    searchParams.get('panorama') ||
    searchParams.get('imageUrl') ||
    searchParams.get('url')

  if (!source) {
    return ''
  }

  try {
    return new URL(source, window.location.href).toString()
  } catch {
    return source
  }
}

const setButtonVisibility = (button, isVisible) => {
  button.classList.toggle('hidden', !isVisible)
}

const updateToolbarVisibility = () => {
  const hasVisibleButton = [...toolbarElement.querySelectorAll('button')].some(
    button => !button.classList.contains('hidden')
  )

  toolbarElement.classList.toggle('hidden', !hasVisibleButton)
}

const renderFisheyeButton = () => {
  fisheyeButtonElement.innerHTML = fisheyeMode
    ? iconMap.fisheyeOn
    : iconMap.fisheyeOff
}

const renderGyroscopeButton = () => {
  gyroscopeButtonElement.innerHTML = gyroscopeIsEnabled
    ? iconMap.gyroscopeOn
    : iconMap.gyroscopeOff
}

const renderVrButton = () => {
  vrButtonElement.innerHTML = vrLoading ? iconMap.vrLoading : iconMap.vr
  vrButtonElement.classList.toggle('is-loading', vrLoading)
}

const renderHomeButton = () => {
  homeButtonElement.innerHTML = iconMap.home
}

const goHome = () => {
  window.location.assign('/')
}

const loadVrViewerModule = async () => {
  if (!vrViewerModule) {
    const module = await import('vr-equirectangular-viewer')
    vrViewerModule = module.default || module
  }

  return vrViewerModule
}

const toggleFisheye = () => {
  if (!viewer) {
    return
  }

  fisheyeMode = !fisheyeMode
  viewer.setOptions({
    fisheye: fisheyeMode ? 2 : 0,
    maxFov: fisheyeMode ? 130 : 100
  })

  if (!fisheyeMode) {
    const currentZoomLevel =
      typeof viewer.getZoomLevel === 'function' ? viewer.getZoomLevel() : null

    if (typeof currentZoomLevel === 'number' && currentZoomLevel <= 0) {
      viewer.zoom(10)
    }
  }

  renderFisheyeButton()
}

const toggleGyroscope = async () => {
  if (!gyroscopePlugin) {
    return
  }

  try {
    await gyroscopePlugin.toggle()
  } catch (error) {
    console.error('切换陀螺仪模式失败:', error)
  }
}

const checkVrSupport = async () => {
  if (!navigator.xr) {
    setButtonVisibility(vrButtonElement, false)
    updateToolbarVisibility()
    return
  }

  try {
    const isSupported = await navigator.xr.isSessionSupported('immersive-vr')
    setButtonVisibility(vrButtonElement, isSupported)
  } catch (error) {
    console.error('检查 VR 支持失败:', error)
    setButtonVisibility(vrButtonElement, false)
  }

  updateToolbarVisibility()
}

const enterVr = async panoramaSource => {
  if (vrLoading) {
    return
  }

  vrLoading = true
  renderVrButton()

  try {
    if (vrViewer) {
      await vrViewer.exitVR()
    }

    const VREquirectangularViewer = await loadVrViewerModule()
    vrViewer = new VREquirectangularViewer({
      imageUrl: panoramaSource,
      onError: error => {
        console.error('VR 错误:', error)
        showError(currentMessages.errorVrEnter)
      },
      onVREnd: () => {
        vrViewer = null
        vrLoading = false
        renderVrButton()
      }
    })

    hideError()
    await vrViewer.enterVR()
  } catch (error) {
    console.error('初始化 VR 模式失败:', error)
    showError(currentMessages.errorVrInit)
  } finally {
    vrLoading = false
    renderVrButton()
  }
}

const bindViewerEvents = () => {
  if (!viewer) {
    return
  }

  const plugin = viewer.getPlugin?.(GyroscopePlugin)
  gyroscopePlugin = plugin || null

  if (gyroscopePlugin) {
    gyroscopePlugin
      .isSupported()
      .then(isSupported => {
        setButtonVisibility(gyroscopeButtonElement, isSupported)
        renderGyroscopeButton()
        updateToolbarVisibility()
      })
      .catch(error => {
        console.error('检查陀螺仪支持失败:', error)
        setButtonVisibility(gyroscopeButtonElement, false)
        updateToolbarVisibility()
      })

    gyroscopePlugin.addEventListener('gyroscope-updated', event => {
      gyroscopeIsEnabled = Boolean(event.gyroscopeEnabled)
      renderGyroscopeButton()
    })
  }

  viewer.addEventListener('ready', () => {
    hideError()
    hideStatus()
    setButtonVisibility(fisheyeButtonElement, true)
    renderFisheyeButton()
    renderGyroscopeButton()
    renderVrButton()
    updateToolbarVisibility()
    checkVrSupport()
  })

  viewer.addEventListener('panorama-error', () => {
    showError(currentMessages.errorLoad)
  })
}

const initViewer = panoramaSource => {
  viewer = new Viewer({
    container: viewerElement,
    panorama: panoramaSource,
    navbar: false,
    defaultZoomLvl: 10,
    maxFov: 100,
    moveSpeed: 1.5,
    fisheye: 0,
    mousewheelCtrlKey: false,
    touchmoveTwoFingers: false,
    lang: currentMessages.viewerLang,
    plugins: [GyroscopePlugin]
  })

  bindViewerEvents()
}

const handleResize = () => {
  viewer?.autoSize?.()
  viewer?.needsUpdate?.()
}

const init = () => {
  const panoramaSource = resolvePanoramaSrc()

  applyStaticTexts()
  renderHomeButton()
  fisheyeButtonElement.innerHTML = iconMap.fisheyeOff
  gyroscopeButtonElement.innerHTML = iconMap.gyroscopeOff
  vrButtonElement.innerHTML = iconMap.vr
  homeButtonElement.addEventListener('click', goHome)
  errorHomeButtonElement.addEventListener('click', goHome)

  if (!panoramaSource) {
    hideStatus()
    updateToolbarVisibility()
    showError(currentMessages.errorMissingSrc)
    return
  }

  setStatus(currentMessages.statusLoading)
  initViewer(panoramaSource)

  fisheyeButtonElement.addEventListener('click', toggleFisheye)
  gyroscopeButtonElement.addEventListener('click', toggleGyroscope)
  vrButtonElement.addEventListener('click', () => enterVr(panoramaSource))
  window.addEventListener('resize', handleResize)
  window.addEventListener('beforeunload', () => {
    vrViewer?.exitVR?.()
    viewer?.destroy?.()
  })
}

init()
