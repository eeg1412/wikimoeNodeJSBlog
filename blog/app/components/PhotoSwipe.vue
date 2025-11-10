<template>
  <Teleport :to="`#caption-${componentId}`" v-if="showUI && description">
    <div
      class="photo-swipe-photo-swipe-caption bg-primary bg-opacity-80 rounded px-2 py-1 text-white dark:text-gray-900 text-sm whitespace-pre-line"
      v-show="showDescription"
    >
      {{ description }}
    </div>
  </Teleport>
  <Teleport
    :to="`#photo-swipe-caption-${componentId}`"
    v-if="showUI && description"
  >
    <div
      class="photo-swipe-photo-swipe-btn"
      @click="showDescription = !showDescription"
    >
      <UIcon
        class="photo-swipe-caption-icon"
        :name="
          showDescription
            ? 'i-heroicons-chat-bubble-bottom-center-text-solid'
            : 'i-heroicons-chat-bubble-bottom-center-solid'
        "
      />
    </div>
  </Teleport>
  <Teleport
    :to="`#photo-swipe-${componentId}`"
    v-if="showUI && attachmentList.length > 1"
  >
    <UPopover :popper="{ arrow: true, offsetDistance: 0 }">
      <div class="photo-swipe-photo-swipe-btn" title="浏览所有媒体">
        <UIcon name="i-heroicons-photo-solid" />
      </div>
      <template #panel="{ close }">
        <div class="p-4">
          <!-- 关闭按钮 -->
          <div class="flex justify-end mb-2">
            <UButton
              size="2xs"
              type="primary"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="close"
            />
          </div>
          <div class="grid grid-cols-3 grid-rows-3 gap-4">
            <div
              class="w-24 h-24"
              v-for="(item, index) in currentGroup"
              :key="item._id"
            >
              <div
                class="w-full h-full bg-cover bg-center bg-no-repeat rounded bg-primary-200"
                :class="{
                  'border-2 border-solid border-primary-500':
                    currentAttachmentId === item._id,
                  'border-2 border-solid border-primary-100':
                    currentAttachmentId !== item._id
                }"
                :style="{
                  backgroundImage: `url(${item.thumfor || item.filepath})`
                }"
                @click="() => goTo(index + groupPage * 9, close)"
              >
                <!-- 如果is360Panorama为true加上360°的字样 -->
                <div
                  v-if="item.is360Panorama"
                  class="w-full h-full flex items-center justify-center text-white text-2xl font-bold opacity-80"
                >
                  360&deg;
                </div>
                <!-- 如果类型是视频加上播放按钮 -->
                <div
                  v-else-if="item.mimetype.indexOf('video') > -1"
                  class="w-full h-full flex items-center justify-center"
                >
                  <div class="text-white text-4xl opacity-80">
                    <UIcon name="i-heroicons-play-solid" size="2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 分页器 -->
          <div class="flex justify-center mt-4">
            <div class="flex items-center">
              <UButton
                :disabled="!hasPrevGroup"
                @click="prevGroup"
                size="2xs"
                type="primary"
                icon="i-heroicons-chevron-left"
              />
              <div class="mx-2 px-1">{{ groupPage + 1 }}/{{ groupCount }}</div>
              <UButton
                :disabled="!hasNextGroup"
                @click="nextGroup"
                size="2xs"
                type="primary"
                icon="i-heroicons-chevron-right"
              />
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </Teleport>

  <!-- 360全景截图按钮 -->
  <Teleport
    :to="`#photo-swipe-screenshot-${componentId}`"
    v-if="showUI && is360PanoramaActive"
  >
    <div class="photo-swipe-photo-swipe-btn" @click="takeScreenshot">
      <UIcon name="i-heroicons-camera-solid" />
    </div>
  </Teleport>

  <!-- 360全景鱼眼切换按钮 -->
  <Teleport
    :to="`#photo-swipe-fisheye-${componentId}`"
    v-if="showUI && is360PanoramaActive"
  >
    <div class="photo-swipe-photo-swipe-btn" @click="toggleFisheye">
      <div v-if="fisheyeMode" class="fisheye-icon fisheye-on">
        <svg
          width="23"
          height="23"
          viewBox="0 0 23 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- 外圈 -->
          <circle
            cx="11.5"
            cy="11.5"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <!-- 使用mask实现高光效果 -->
          <mask :id="`lensMask-${componentId}`">
            <rect width="23" height="23" fill="white" />
            <circle cx="14" cy="9.5" r="1.8" fill="black" />
          </mask>
          <!-- 实心圆形镜头（右上方单个高光） -->
          <circle
            cx="11.5"
            cy="11.5"
            r="7.5"
            fill="currentColor"
            :mask="`url(#lensMask-${componentId})`"
          />
        </svg>
      </div>
      <div v-else class="fisheye-icon fisheye-off">
        <svg
          width="23"
          height="23"
          viewBox="0 0 23 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2,8
              Q2,5 5,4
              Q11.5,2 18,4
              Q21,5 21,8
              L21,15
              Q21,18 18,19
              Q11.5,21 5,19
              Q2,18 2,15
              L2,8
              Z"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          ></path>
          <mask :id="`squareLensMask-${componentId}`">
            <rect width="23" height="23" fill="white"></rect>
            <circle cx="14" cy="9.5" r="1.8" fill="black"></circle>
          </mask>
          <path
            d="M5.0,8.0 
              Q5.0,6.5 7.0,6.0
              Q11.5,5.0 16.0,6.0
              Q18.0,6.5 18.0,8.0
              L18.0,15.0
              Q18.0,16.5 16.0,17.0
              Q11.5,18.0 7.0,17.0
              Q5.0,16.5 5.0,15.0
              L5.0,8.0
              Z"
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
            :mask="`url(#squareLensMask-${componentId})`"
          ></path>
        </svg>
      </div>
    </div>
  </Teleport>

  <!-- 陀螺仪按钮 -->
  <Teleport
    :to="`#photo-swipe-gyroscope-${componentId}`"
    v-if="showUI && is360PanoramaActive && gyroscopeIsSupported"
  >
    <div
      class="photo-swipe-photo-swipe-btn"
      title="动态体感视角"
      @click="toggleGyroscope"
    >
      <!-- 实心罗盘：根据 gyroscopeIsEnabled 切换样式 -->
      <template v-if="gyroscopeIsEnabled">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          width="23"
          height="23"
        >
          <path
            fill="currentColor"
            d="M480 0q-99 0-186.5-37.5t-153-103Q75-206 37.5-293.5T0-480h80q0 71 24 136t66.5 117Q213-175 272-138.5T401-87L296-192l56-56L588-12q-26 6-53.5 9T480 0Zm400-480q0-71-24-136t-66.5-117Q747-785 688-821.5T559-873l105 105-56 56-236-236q26-6 53.5-9t54.5-3q99 0 186.5 37.5t153 103q65.5 65.5 103 153T960-480h-80ZM496-182 182.03-496Q171-507 165.5-521q-5.5-14-5.5-29t5.74-29q5.74-14 16.26-25l173.62-174q11.03-11 25.08-16.5 14.05-5.5 29.11-5.5 15.05 0 29.1 5.5T464-778l313.97 313.97Q789-453 794.5-439q5.5 14 5.5 29t-5.74 29q-5.74 14-16.26 25L604.38-182q-11.03 11-25.08 16.5-14.05 5.5-29.11 5.5-15.05 0-29.1-5.5T496-182ZM373-556q13 0 21.5-9t8.5-21q0-13-8.5-21.5T373-616q-12 0-21 8.5t-9 21.5q0 12 9 21t21 9Z"
          />
        </svg>
      </template>
      <template v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          width="23"
          height="23"
        >
          <path
            fill="currentColor"
            d="M714-600q-14 0-24-10t-10-24v-132q0-14 10-24t24-10h6v-40q0-33 23.5-56.5T800-920q33 0 56.5 23.5T880-840v40h6q14 0 24 10t10 24v132q0 14-10 24t-24 10H714Zm46-200h80v-40q0-17-11.5-28.5T800-880q-17 0-28.5 11.5T760-840v40ZM480 0q-99 0-186.5-37.5t-153-103Q75-206 37.5-293.5T0-480h80q0 71 24 136t66.5 117Q213-175 272-138.5T401-87L296-192l56-56L588-12q-26 6-53.5 9T480 0ZM373-556q13 0 21.5-9t8.5-21q0-13-8.5-21.5T373-616q-12 0-21 8.5t-9 21.5q0 12 9 21t21 9Zm122.97 374L182.03-496Q171-507 165.5-521.5 160-536 160-550q0-15 5.5-29t16.54-25.06l173.61-173.88Q366.69-789 381.25-795q14.55-6 28.6-6 15.05 0 29.1 6t25.08 17.03l313.94 313.74Q789-453.2 795-439.17q6 14.03 6 29.07 0 14.03-6 28.57Q789-367 777.96-356L604.35-182q-11.04 11-25.09 16.5t-29.11 5.5q-14.05 0-28.6-5.5T495.97-182Z"
          />
        </svg>
      </template>
    </div>
  </Teleport>

  <!-- VR全景按钮 -->
  <Teleport
    :to="`#photo-swipe-vr-${componentId}`"
    v-if="showUI && is360PanoramaActive && isVRSupported"
  >
    <div class="photo-swipe-photo-swipe-btn" title="VR模式" @click="enterVR">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        viewBox="0 0 640 640"
        v-show="!VRLoading"
      >
        <path
          fill="currentColor"
          d="M544 160L96 160C60.7 160 32 188.7 32 224L32 416C32 451.3 60.7 480 96 480L213.5 480C230.5 480 246.8 473.3 258.8 461.3L292.7 427.4C299.9 420.2 309.8 416.1 320 416.1C330.2 416.1 340.1 420.2 347.3 427.4L381.2 461.3C393.2 473.3 409.5 480 426.5 480L544 480C579.3 480 608 451.3 608 416L608 224C608 188.7 579.3 160 544 160zM112 304C112 268.7 140.7 240 176 240C211.3 240 240 268.7 240 304C240 339.3 211.3 368 176 368C140.7 368 112 339.3 112 304zM464 240C499.3 240 528 268.7 528 304C528 339.3 499.3 368 464 368C428.7 368 400 339.3 400 304C400 268.7 428.7 240 464 240z"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="23"
        viewBox="0 0 640 640"
        v-show="VRLoading"
        class="animate-spin"
      >
        <path
          fill="currentColor"
          d="M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM272 528C272 501.5 293.5 480 320 480C346.5 480 368 501.5 368 528C368 554.5 346.5 576 320 576C293.5 576 272 554.5 272 528zM112 272C138.5 272 160 293.5 160 320C160 346.5 138.5 368 112 368C85.5 368 64 346.5 64 320C64 293.5 85.5 272 112 272zM480 320C480 293.5 501.5 272 528 272C554.5 272 576 293.5 576 320C576 346.5 554.5 368 528 368C501.5 368 480 346.5 480 320zM139 433.1C157.8 414.3 188.1 414.3 206.9 433.1C225.7 451.9 225.7 482.2 206.9 501C188.1 519.8 157.8 519.8 139 501C120.2 482.2 120.2 451.9 139 433.1zM139 139C157.8 120.2 188.1 120.2 206.9 139C225.7 157.8 225.7 188.1 206.9 206.9C188.1 225.7 157.8 225.7 139 206.9C120.2 188.1 120.2 157.8 139 139zM501 433.1C519.8 451.9 519.8 482.2 501 501C482.2 519.8 451.9 519.8 433.1 501C414.3 482.2 414.3 451.9 433.1 433.1C451.9 414.3 482.2 414.3 501 433.1z"
        />
      </svg>
      <!-- <UIcon
        class="animate-spin"
        name="i-heroicons-arrow-path"
        v-show="VRLoading"
      /> -->
    </div>
  </Teleport>

  <!-- <Teleport :to="`#photo-swipe-loading-${componentId}`" v-if="showUI">
      <div>
        <DivLoading class="photo-swipe-load-body" :loading="loading" />
      </div>
    </Teleport> -->
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import '@photo-sphere-viewer/core/index.css'
import { usePswpIsOpenStore } from '@/store/pswpIsOpen'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()

const pswpIsOpenStore = usePswpIsOpenStore()
const { pswpIsOpen } = storeToRefs(pswpIsOpenStore)

let Viewer = null
let gyroscopePlugin = null
const gyroscopeIsSupported = ref(false)
const gyroscopeIsEnabled = ref(false)
const toggleGyroscope = async () => {
  if (gyroscopeIsSupported.value) {
    const currIndex = lightbox.pswp.currIndex
    panoramaListMap[currIndex].plugins.gyroscope.toggle()
  }
}
const loadViewer = async () => {
  if (!Viewer) {
    const module = await import('@photo-sphere-viewer/core')
    Viewer = module.Viewer
  }
  if (!gyroscopePlugin) {
    const module = await import('@photo-sphere-viewer/gyroscope-plugin')
    gyroscopePlugin = module.GyroscopePlugin
  }
  return { Viewer, gyroscopePlugin }
}

let VRViewer = null
let VREquirectangularViewerModule = null
const VRLoading = ref(false)
const loadVREquirectangularViewer = async () => {
  if (!VREquirectangularViewerModule) {
    const module = await import('vr-equirectangular-viewer')
    VREquirectangularViewerModule = module.default || module
  }
  return VREquirectangularViewerModule
}

const enterVR = async () => {
  if (VRLoading.value) {
    return
  }
  VRLoading.value = true
  const currIndex = lightbox.pswp.currIndex
  try {
    if (VRViewer) {
      await VRViewer.exitVR()
    }

    const VREquirectangularViewerModule = await loadVREquirectangularViewer()

    VRViewer = new VREquirectangularViewerModule({
      imageUrl: attachmentList.value[currIndex].filepath,

      onError: error => {
        toast.add({
          title: '进入VR模式失败，请检查权限或设备支持情况',
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
        console.error('VR错误:', error)
      },

      onVRStart: () => {
        console.log('VR模式已激活')
      },

      onVREnd: () => {
        console.log('✅ 已退出VR，资源已自动释放')
        VRViewer = null
      }
    })

    await VRViewer.enterVR()
    VRLoading.value = false
  } catch (error) {
    VRLoading.value = false
    toast.add({
      title: '初始化VR模式失败，请检查权限或设备支持情况',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
    console.error('VR错误:', error)
    return
  }
}

const isVRSupported = ref(false)
const isVRSupportedCheck = async () => {
  const btnVRModeEl = document.querySelector(
    `.pswp__button--photo-swipe-vr-button-${componentId}`
  )
  if (!navigator.xr) {
    isVRSupported.value = false
    if (btnVRModeEl) {
      btnVRModeEl.style.display = 'none'
    }
  }

  try {
    const isSupported = await navigator.xr.isSessionSupported('immersive-vr')
    isVRSupported.value = isSupported
    if (!isSupported) {
      if (btnVRModeEl) {
        btnVRModeEl.style.display = 'none'
      }
    } else {
      if (btnVRModeEl) {
        btnVRModeEl.style.display = 'block'
      }
    }
  } catch (e) {
    console.error('Error checking VR support:', e)
    isVRSupported.value = false
    if (btnVRModeEl) {
      btnVRModeEl.style.display = 'none'
    }
  }
}

const panoramaListMap = {}
const clearPanoramaListMap = () => {
  for (const key in panoramaListMap) {
    if (panoramaListMap[key]) {
      panoramaListMap[key].destroy()
      delete panoramaListMap[key]
      console.log('destroy', key, panoramaListMap)
    }
  }
}
const clearPanoramaListMapByKey = key => {
  if (panoramaListMap[key]) {
    panoramaListMap[key].destroy()
    delete panoramaListMap[key]
    console.log('destroy', key, panoramaListMap)
  } else {
    console.warn('not found', key, panoramaListMap)
  }
}
const panoramaLang = {
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
  webglError: '您的浏览器似乎不支持WebGL',
  gyroscope: '动态体感视角'
}

const is360PanoramaActive = ref(false)
// watch is360PanoramaActive
watch(is360PanoramaActive, () => {
  check360Btn()
})
const check360Btn = () => {
  const btnFishEyeEl = document.querySelector(
    `.pswp__button--photo-swipe-fisheye-button-${componentId}`
  )
  const btnScreenshotEl = document.querySelector(
    `.pswp__button--photo-swipe-screenshot-button-${componentId}`
  )
  const btnGyroscopeEl = document.querySelector(
    `.pswp__button--photo-swipe-gyroscope-button-${componentId}`
  )
  const btnVRModeEl = document.querySelector(
    `.pswp__button--photo-swipe-vr-button-${componentId}`
  )
  if (is360PanoramaActive.value) {
    if (btnFishEyeEl) {
      btnFishEyeEl.style.display = 'block'
    }
    if (btnScreenshotEl) {
      btnScreenshotEl.style.display = 'block'
    }
    // if (btnVRModeEl) {
    //   btnVRModeEl.style.display = 'block'
    // }
    isVRSupportedCheck()
  } else {
    if (btnFishEyeEl) {
      btnFishEyeEl.style.display = 'none'
    }
    if (btnScreenshotEl) {
      btnScreenshotEl.style.display = 'none'
    }
    if (btnGyroscopeEl) {
      btnGyroscopeEl.style.display = 'none'
    }
    if (btnVRModeEl) {
      btnVRModeEl.style.display = 'none'
    }
  }
}
const fisheyeMode = ref(false)

// 截图功能
const takeScreenshot = () => {
  const currIndex = lightbox.pswp.currIndex
  const viewer = panoramaListMap[currIndex]

  if (viewer) {
    try {
      viewer.addEventListener(
        'render',
        () => {
          const link = document.createElement('a')
          const now = new Date()
          const yyyymmddhhmmss = formatDate(now, 'yyyyMMddhhmmss')
          link.download = `screenshot-${yyyymmddhhmmss}.png`
          link.href = viewer.renderer.renderer.domElement.toDataURL()
          link.click()
        },
        { once: true }
      )
      viewer.needsUpdate()
    } catch (error) {
      console.error('截图失败:', error)
    }
  }
}

// 切换鱼眼模式
const toggleFisheye = () => {
  const currIndex = lightbox.pswp.currIndex
  const viewer = panoramaListMap[currIndex]

  if (viewer) {
    console.log(viewer.getZoomLevel())
    fisheyeMode.value = !fisheyeMode.value
    viewer.setOptions({
      fisheye: fisheyeMode.value ? 2 : 0,
      maxFov: fisheyeMode.value ? 130 : 100
    })
    // 如果fisheyeMode为false，且视角大于100，重置视角为100
    if (!fisheyeMode.value) {
      const currentFov = viewer.getZoomLevel()
      if (currentFov <= 0) {
        viewer.zoom(10)
      }
    }
  }
}

let isAllPreventDefault = false

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const emits = defineEmits()

const toast = useToast()
const showUI = ref(false)

const componentId = generateRandomString(8)

const attachmentList = ref([])
const loading = ref(false)
let loadingTimer = null
const loadImageDimensions = async list => {
  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }
  loadingTimer = setTimeout(() => {
    loading.value = true
  }, 500)
  for (let item of list) {
    if (!item._id) {
      item._id = generateRandomString(8)
    }
    const mimetype = item.mimetype || ''
    let width = item.width
    let height = item.height
    if (item.src) {
      item.filepath = item.src
    }
    const src = item.filepath
    item.mimetype = mimetype

    // 如果width或者height不存在需要重新计算
    if (!width || !height) {
      // 如果是视频，默认宽高，1280x720
      if (mimetype.indexOf('video') > -1) {
        width = 1280
        height = 720
      }
      // else {
      //   // 如果是图片，需要计算宽高
      //   const img = new Image()
      //   img.src = src
      //   try {
      //     await new Promise((resolve, reject) => {
      //       img.onload = function () {
      //         item.width = img.width
      //         item.height = img.height
      //         resolve()
      //       }
      //       img.onerror = function () {
      //         reject('图片加载失败')
      //       }
      //     })
      //   } catch (error) {
      //     console.error(error)
      //     item.width = 0
      //     item.height = 0
      //   }
      // }
    }
  }
  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }
  loading.value = false
  attachmentList.value = list
}
let closeCallback = null
let loadingImageIndexList = []
let refreshSlideContentChange = false
const loadNoSizeImage = (src, index) => {
  if (loadingImageIndexList.includes(index)) {
    return
  }
  loadingImageIndexList.push(index)
  loading.value = true
  const promise = new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = async () => {
      resolve(img)
    }
    img.onerror = async () => {
      reject(new Error('Image loading failed'))
    }
  })
  promise
    .then(img => {
      attachmentList.value[index].width = img.width
      attachmentList.value[index].height = img.height
    })
    .catch(err => {
      console.error(err)
      attachmentList.value[index].loadFailed = true
    })
    .finally(async () => {
      loading.value = false
      if (photoswipeInitialLayoutPromise) {
        await photoswipeInitialLayoutPromise
        refreshSlideContentChange = true
        lightbox.pswp.refreshSlideContent(index)
      }
      // 移除加载中的index
      loadingImageIndexList = loadingImageIndexList.filter(item => {
        return item !== index
      })
    })
}

const open = async (
  list = [],
  showIndex = 0,
  closeCallback_,
  hashId,
  componentName
) => {
  if (pswpIsOpen.value) {
    return
  }

  pswpIsOpenStore.setPswpIsOpen(true)
  if (!lightbox) {
    await initLightbox()
  }
  closeCallback = closeCallback_ || null
  await loadImageDimensions(list)
  photoswipeInitialLayoutPromise = new Promise(resolve => {
    photoswipeInitialLayoutPromiseResolve = resolve
  })
  itemIndex.value = showIndex
  firstFlag = true
  if (attachmentList.value.length <= 0) {
    toast.add({
      title: '暂无相关内容',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
    return
  }
  lightbox.addFilter('numItems', numItems => {
    return attachmentList.value.length
  })

  const shouldPreventDefault = target => {
    return (
      isAllPreventDefault ||
      target.tagName === 'VIDEO' ||
      target.tagName === 'CANVAS'
    )
  }
  lightbox.on('pointerDown', e => {
    // console.log(e)
    const target = e.originalEvent.target
    // 如果是video元素或者canvas元素，阻止事件冒泡
    if (shouldPreventDefault(target)) {
      e.preventDefault()
    }
  })

  lightbox.addFilter('contentErrorElement', (contentErrorElement, content) => {
    const el = document.createElement('div')
    el.className = 'pswp__error-msg'
    el.innerHTML = `读取失败`
    return el
  })
  lightbox.addFilter('itemData', (itemData, index) => {
    const mimetype = attachmentList.value[index].mimetype
    let width = attachmentList.value[index].width
    let height = attachmentList.value[index].height
    let src = attachmentList.value[index].filepath
    const is360Panorama = attachmentList.value[index].is360Panorama
    // thumfor 在这里不需要，上面的相册需要

    // 通过正则判断是否携带协议和域名
    // if (!/^https?:\/\//.test(src)) {
    //   src = options.value.siteUrl + src
    // }
    // 如果width或者height不存在需要重新计算
    if (!width || !height) {
      // 如果是视频，默认宽高，1280x720
      if (mimetype.indexOf('video') > -1) {
        width = 1280
        height = 720
      } else if (!is360Panorama) {
        const loadFailed = attachmentList.value[index].loadFailed
        return {
          html: `<div class="previewer-img-loading-content" id="loading-content-${componentId}-${index}">${
            loadFailed ? '图片加载失败' : '图片加载中...'
          }</div>`,
          shouldLoadImageItem: true,
          imageSrc: src,
          loadFailed: loadFailed
        }
      }
    }

    if (mimetype.indexOf('video') > -1) {
      return {
        html: `<div class="previewer-video-body">
                  <video
                    id="lightbox-video-${index}"
                    controls="controls"
                    playsinline="true"
                    preload="auto"
                    muted="muted"
                    autoplay="autoplay"
                    loop="loop"
                    width="${width}"
                    height="${height}">
                    <source
                      src="${src}"
                      type="video/mp4"
                    />
                    </video>
                  </div>`
      }
    }
    if (is360Panorama && mimetype.indexOf('image') > -1) {
      const maxWidth = Math.round(width * 0.6)
      const maxHeight = Math.round(height * 0.6)
      return {
        html: `<div class="content-360panorama-body"><div class="content-360panorama-content" style="max-width:${maxWidth}px;max-height:${maxHeight}px;" id="lightbox-360panorama-${index}">加载中...</div></div>`,
        is360Panorama: true,
        imageSrc: src
      }
    }
    return {
      src: src,
      width: attachmentList.value[index].width,
      height: attachmentList.value[index].height
    }
  })
  const path = route.path
  router.push({
    path,
    query: {
      ...route.query,
      pswpopen: '1',
      pswphash: hashId || undefined,
      pswpcomponent: componentName || undefined,
      pswpindex: showIndex || undefined
    }
  })

  lightbox.loadAndOpen(showIndex)
  // if (window.location.hash) {
  //   const urlWithoutHash = window.location.href.split('#')[0]
  //   window.history.replaceState(
  //     window.history.state,
  //     '',
  //     urlWithoutHash + '#wmpsvoid'
  //   )
  // }
  // window.history.pushState(window.history.state, '', '#photo-swipelightboxopen')
}

setPhotoSwipe(open)

const itemIndex = ref(0)
const showDescription = ref(true)
const description = computed(() => {
  const description = attachmentList.value[itemIndex.value]?.description
  const btnEl = document.querySelector(
    `.pswp__button--photo-swipe-caption-button-${componentId}`
  )
  if (btnEl) {
    // 显示元素
    btnEl.style.display = description ? 'block' : 'none'
  }
  return description
})

let lightbox = null
let videoTimer = null
let firstFlag = true
let photoswipeInitialLayoutPromiseResolve = null
let photoswipeInitialLayoutPromise = null
const initLightbox = async () => {
  const module = await import('photoswipe/lightbox')
  const PhotoSwipeLightbox = module.default
  lightbox = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
    preload: [1, 2],
    mainClass: 'photo-swipe-photo-swipe',
    padding: { top: 65, bottom: 30, left: 0, right: 0 },
    secondaryZoomLevel: 1,
    returnFocus: false,
    closeTitle: '关闭', // TODO strings from text properties
    zoomTitle: '缩放',
    arrowPrevTitle: '上一张',
    arrowNextTitle: '下一张'
  })
  lightbox.init()
  // window.lightbox = lightbox
  lightbox.on('close', () => {
    // if (VRViewer) {
    //   VRViewer.exitVR()
    //   VRViewer = null
    // }
    clearPanoramaListMap()
    photoswipeInitialLayoutPromiseResolve = null
    photoswipeInitialLayoutPromise = null
    loadingImageIndexList = []
    gyroscopeIsSupported.value = false
    console.log('close')
    if (closeCallback) {
      closeCallback()
      closeCallback = null
    }
    if (videoTimer) {
      console.log('clearTimeout')
      clearTimeout(videoTimer)
      videoTimer = null
    }
    // if (window.location.hash === '#photo-swipelightboxopen') {
    //   window.history.back()
    // }
    showUI.value = false
    attachmentList.value = []
    if (route.query.pswpopen === '1') {
      if (window.history.state && window.history.state.back) {
        router.back()
      } else {
        const path = route.path
        // 没有上一页历史，导航到首页
        router.replace({
          path,
          query: {
            ...route.query,
            pswpopen: undefined,
            pswphash: undefined,
            pswpcomponent: undefined,
            pswpindex: undefined
          }
        })
      }
    }
    nextTick(() => {
      pswpIsOpenStore.setPswpIsOpen(false)
    })
  })
  lightbox.on('change', async () => {
    console.log('change')
    if (lightbox && lightbox.pswp) {
      const pswpElement = lightbox.pswp.element

      if (!pswpElement.classList.contains('pswp--ui-visible')) {
        pswpElement.classList.add('pswp--ui-visible')
      }
    }
    isAllPreventDefault = false
    if (refreshSlideContentChange) {
      refreshSlideContentChange = false
      console.log('refreshSlideContentChange')
      return
    }
    console.log(lightbox.pswp)
    showDescription.value = true
    const currIndex = lightbox.pswp.currIndex
    itemIndex.value = currIndex
    const currSlide = lightbox.pswp.currSlide
    const data = currSlide?.data

    const nowIndex = route.query.pswpindex || 0
    const pswpopen = route.query.pswpopen || '0'
    if (pswpopen === '1' && Number(nowIndex) !== currIndex) {
      const path = route.path
      router.replace({
        path,
        query: {
          ...route.query,
          pswpindex: currIndex || undefined
        }
      })
    }

    if (data?.shouldLoadImageItem && data?.loadFailed !== true) {
      const imageSrc = data?.imageSrc
      loadNoSizeImage(imageSrc, currIndex)
    }
    console.log('data', data)
    // 360全景图
    // 遍历panoramaListMap，销毁所有的viewer实例
    clearPanoramaListMap()

    // 重置鱼眼模式
    fisheyeMode.value = false

    let image360PanoramaTimer = null
    const is360Panorama = data?.is360Panorama
    is360PanoramaActive.value = false
    if (is360Panorama === true) {
      if (!Viewer) {
        await loadViewer()
      }
      // isAllPreventDefault = true
      if (image360PanoramaTimer) {
        clearTimeout(image360PanoramaTimer)
        image360PanoramaTimer = null
      }
      image360PanoramaTimer = setTimeout(
        async () => {
          const container = document.querySelector(
            `#lightbox-360panorama-${currIndex}`
          )
          if (!container) {
            return
          }
          // 清空container
          container.innerHTML = ''
          const viewer = new Viewer({
            container: container,
            panorama: data?.imageSrc,
            navbar: false,
            defaultZoomLvl: 10,
            maxFov: 100,
            lang: panoramaLang,
            moveSpeed: 1.5,
            // 设置鱼眼默认为0
            fisheye: 0,
            plugins: [gyroscopePlugin],
            moveMode: 'fast'
          })
          panoramaListMap[currIndex] = viewer

          viewer.plugins.gyroscope.isSupported().then(supported => {
            gyroscopeIsSupported.value = supported
            // 设置按钮显示状态
            const btnGyroscopeEl = document.querySelector(
              `.pswp__button--photo-swipe-gyroscope-button-${componentId}`
            )
            if (btnGyroscopeEl) {
              if (supported) {
                btnGyroscopeEl.style.display = 'block'
              } else {
                btnGyroscopeEl.style.display = 'none'
              }
            }
          })

          viewer.plugins.gyroscope.addEventListener(
            'gyroscope-updated',
            event => {
              const enabled = event.gyroscopeEnabled // boolean
              gyroscopeIsEnabled.value = enabled
              console.log('Gyroscope enabled:', enabled)
            }
          )

          // 更新是否为360全景的状态
          viewer.addEventListener(
            'ready',
            () => {
              const currIndexNow = lightbox?.pswp?.currIndex
              if (currIndexNow === currIndex) {
                is360PanoramaActive.value = true
              } else {
                console.log('currIndexNow not both', currIndexNow, currIndex)
                clearPanoramaListMapByKey(currIndex)
              }
            },
            { once: true }
          )
        },
        firstFlag ? 800 : 100
      )
    }
    // 计算当前Index对应的groupPage页数
    groupPage.value = Math.floor(currIndex / 9)

    if (videoTimer) {
      clearTimeout(videoTimer)
      videoTimer = null
    }
    videoTimer = setTimeout(
      () => {
        const videoList = document.querySelectorAll(
          '.previewer-video-body video'
        )
        videoList.forEach(video => {
          video.pause()
        })
        // 当前video播放
        const video = document.querySelector(`#lightbox-video-${currIndex}`)
        video && video.play()
        videoTimer = null
      },
      firstFlag ? 800 : 100
    )
    firstFlag = false
  })
  lightbox.on('initialLayout', () => {
    console.log('initialLayout')
    // photoswipe measures size of various elements
    // if you need to read getBoundingClientRect of something - do it here
    showUI.value = true
    check360Btn()
    photoswipeInitialLayoutPromiseResolve()
    console.log(lightbox.pswp.on)
  })
  // 注册UI
  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: `<div id="caption-${componentId}"></div>`,
      onInit: (el, pswp) => {
        console.log(el)
      }
    })
    // 注册VR按钮
    lightbox.pswp.ui.registerElement({
      name: `photo-swipe-vr-button-${componentId}`,
      title: 'VR模式',
      order: 9,
      isButton: true,
      html: `<div id="photo-swipe-vr-${componentId}"></div>`
    })
    // 注册陀螺仪按钮
    lightbox.pswp.ui.registerElement({
      name: `photo-swipe-gyroscope-button-${componentId}`,
      title: '动态体感视角',
      order: 9,
      isButton: true,
      html: `<div id="photo-swipe-gyroscope-${componentId}"></div>`
    })
    // 注册360度全景截图按钮
    lightbox.pswp.ui.registerElement({
      name: `photo-swipe-screenshot-button-${componentId}`,
      title: '截图',
      order: 9,
      isButton: true,
      html: `<div id="photo-swipe-screenshot-${componentId}"></div>`
    })

    // 注册360度全景鱼眼切换按钮
    lightbox.pswp.ui.registerElement({
      name: `photo-swipe-fisheye-button-${componentId}`,
      title: '切换镜头模式',
      order: 9,
      isButton: true,
      html: `<div id="photo-swipe-fisheye-${componentId}"></div>`
    })

    // 注册描述开关按钮
    lightbox.pswp.ui.registerElement({
      name: `photo-swipe-caption-button-${componentId}`,
      title: '描述开关',
      order: 9,
      isButton: true,
      html: `<div id="photo-swipe-caption-${componentId}"></div>`
    })
    if (attachmentList.value.length > 1) {
      lightbox.pswp.ui.registerElement({
        name: 'photo-swipe-button',
        order: 9,
        isButton: true,
        html: `<div id="photo-swipe-${componentId}"></div>`
      })
    }
  })
}

// 将附件按照9个一组分组
const attachmentGroup = computed(() => {
  const group = []
  const len = attachmentList.value.length
  for (let i = 0; i < len; i += 9) {
    group.push(attachmentList.value.slice(i, i + 9))
  }
  return group
})
// 一共有多少组
const groupCount = computed(() => {
  return attachmentGroup.value.length
})
// 分组的页
const groupPage = ref(0)
// 当前分组
const currentGroup = computed(() => {
  return attachmentGroup.value[groupPage.value]
})
// 上一页
const prevGroup = () => {
  groupPage.value = groupPage.value - 1
}
// 下一页
const nextGroup = () => {
  groupPage.value = groupPage.value + 1
}
// 是否有上一页
const hasPrevGroup = computed(() => {
  return groupPage.value > 0
})
// 是否有下一页
const hasNextGroup = computed(() => {
  return groupPage.value < groupCount.value - 1
})
// 当前选中的附件ID
const currentAttachmentId = computed(() => {
  return attachmentList.value[itemIndex.value]?._id
})
const goTo = (index, close) => {
  lightbox.pswp.goTo(index)
  close()
}

watch(
  () => route.query.pswpopen,
  (newVal, oldVal) => {
    console.log('watch pswpopen', newVal, oldVal)
    if (newVal !== '1') {
      lightbox && lightbox.pswp && lightbox.pswp.close()
    }
  }
)

onMounted(() => {})
onUnmounted(() => {
  lightbox.destroy()
  lightbox = null
})
</script>
<style scoped>
.photo-swipe-photo-swipe-btn {
  width: 100%;
  height: 60px;
  color: #ffffff;
  font-size: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0px 0px 2px #000);
}
.photo-swipe-photo-swipe-caption {
  max-width: 1280px;
}
.photo-swipe-load-body {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
}
.photo-swipe-caption-icon {
  /* 下移1像素 */
  transform: translateY(1px);
  font-size: 22px;
}
</style>
