<template>
  <div
    class="blog-tweet-img-list-wrap"
    ref="blogTweetImgListWrapRef"
    :class="`cover-count-${coverImages.length}`"
    v-if="coverImages.length > 0"
  >
    <div
      class="blog-tweet-img-list-body cover-count-1-1"
      :class="{
        'is-height': isHeight,
        'no-swiper-mode': !swiperMode,
      }"
      :style="{
        aspectRatio: `${coverImages[0].thumWidth || coverImages[0].width} / ${
          coverImages[0].thumHeight || coverImages[0].height
        }`,
        ...checkHeightWidth(coverImages),
      }"
      v-if="coverImages.length === 1"
    >
      <!-- 1张图时 -->
      <div class="blog-tweet-1img-list-body">
        <template v-if="coverImages[0].mimetype.includes('video')">
          <video
            :controls="isFullscreen || videoPlayId === coverImages[0]._id"
            :id="`${componentUUID}-${coverImages[0]._id}`"
            :poster="coverImages[0].thumfor || coverImages[0].filepath"
            :data-id="coverImages[0]._id"
            muted
            loop
            playsinline
            preload="none"
            class="blog-tweet-1img-list-body-video bg-black"
            @click.stop
            @play="checkVideoPlay(coverImages[0]._id)"
            @pause="videoPause"
            autoplay
            v-if="videoPlayedIdList.includes(coverImages[0]._id)"
          >
            <source
              :src="`${options.siteUrl}${coverImages[0].filepath}`"
              type="video/mp4"
            />
          </video>
          <!-- 如果是视频加上播放按钮 -->
          <div
            class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
            v-show="videoPlayId !== coverImages[0]._id"
            @click.stop="videoPlay(coverImages[0]._id)"
          >
            <UIcon
              class="blog-tweet-img-list-body-item-video-mask-icon text-white"
              name="i-heroicons-play-circle"
            />
            <UIcon
              class="blog-tweet-img-list-body-item-video-mask-zoom-icon text-white"
              name="i-heroicons-magnifying-glass-plus"
              @click.stop="tryOpenHref(0)"
            />
          </div>
        </template>
        <WikimoeImage
          :src="coverImages[0].thumfor || coverImages[0].filepath"
          :alt="coverImages[0].description || coverImages[0].filename"
          :width="coverImages[0].thumWidth || coverImages[0].width"
          :height="coverImages[0].thumHeight || coverImages[0].height"
          :data-href="coverImages[0].filepath"
          :dataHrefList="dataHrefList"
          :dataHrefIndex="0"
          :clickStop="true"
          :updatedAt="coverImages[0].updatedAt"
          loading="lazy"
          :mimetype="coverImages[0].mimetype"
          v-if="
            videoPlayId !== coverImages[0]._id &&
            !videoPlayedIdList.includes(coverImages[0]._id)
          "
        />

        <div
          class="absolute tweet-img-list-body-item-description flex"
          v-if="coverImages[0].description || coverImages[0].is360Panorama"
          v-show="videoPlayId !== coverImages[0]._id"
        >
          <div
            class="rounded px-1 py-0.5 bg-primary-500 text-white dark:text-gray-900 bg-opacity-80 text-xs flex align-middle justify-center pointer mr-1"
            @click.stop="tryOpenHref(0)"
            :title="coverImages[0].description"
            v-if="coverImages[0].description"
          >
            描述
          </div>
          <div
            class="rounded px-1 py-0.5 bg-primary-500 text-white dark:text-gray-900 bg-opacity-80 text-xs flex align-middle justify-center pointer mr-1"
            @click.stop="tryOpenHref(0)"
            v-if="coverImages[0].is360Panorama"
          >
            360°全景
          </div>
        </div>
      </div>
    </div>
    <template v-else>
      <div
        class="blog-tweet-img-swiper-body"
        :class="{
          'video-playing': videoPlayId !== null,
        }"
        v-if="swiperMode"
      >
        <Swiper
          :modules="[SwiperPagination, SwiperMousewheel]"
          :slides-per-view="1"
          :loop="false"
          :mousewheel="{
            releaseOnEdges: true,
          }"
          :pagination="{
            type: 'fraction',
          }"
          @slideChangeTransitionStart="slideChangeTransitionStart"
          @slideChangeTransitionEnd="slideChangeTransitionEnd"
        >
          <SwiperSlide v-for="(item, index) in imageGroup" :key="item._id">
            <!-- 幻灯片模式 -->
            <div
              class="blog-tweet-img-list-body"
              :class="`cover-count-${item.length}`"
              v-if="item.length > 0"
            >
              <template v-for="(img, indexChild) in item" :key="index">
                <template v-if="img.mimetype.includes('video')">
                  <video
                    :controls="isFullscreen || videoPlayId === img._id"
                    :poster="img.thumfor || img.filepath"
                    :id="`${componentUUID}-${img._id}`"
                    :data-id="img._id"
                    preload="none"
                    muted
                    loop
                    playsinline
                    class="blog-tweet-1img-list-body-video bg-black self-stretch"
                    autoplay
                    @click.stop
                    @play="checkVideoPlay(img._id)"
                    @pause="videoPause"
                    v-if="videoPlayedIdList.includes(img._id)"
                  >
                    <source
                      :src="`${options.siteUrl}${img.filepath}`"
                      type="video/mp4"
                    />
                  </video>
                  <div
                    class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
                    @click.stop="videoPlay(img._id)"
                    v-show="videoPlayId !== img._id"
                  >
                    <UIcon
                      class="blog-tweet-img-list-body-item-video-mask-icon text-white"
                      name="i-heroicons-play-circle"
                    />
                    <UIcon
                      class="blog-tweet-img-list-body-item-video-mask-zoom-icon text-white"
                      name="i-heroicons-magnifying-glass-plus"
                      @click.stop="tryOpenHref(img.dataHrefIndex)"
                    />
                  </div>
                </template>
                <WikimoeImage
                  class="blog-tweet-img-list-body-item"
                  :src="img.thumfor || img.filepath"
                  :alt="img.description || img.filename"
                  :width="img.thumWidth || img.width"
                  :height="img.thumHeight || img.height"
                  loading="lazy"
                  fit="cover"
                  :dataHrefList="dataHrefList"
                  :dataHrefIndex="img.dataHrefIndex"
                  :clickStop="true"
                  :updatedAt="img.updatedAt"
                  :mimetype="img.mimetype"
                  v-if="
                    videoPlayId !== img._id &&
                    !videoPlayedIdList.includes(img._id)
                  "
                />

                <div
                  :class="`absolute tweet-img-list-body-item-description flex index-${indexChild}`"
                  v-if="img.description || img.is360Panorama"
                  v-show="videoPlayId !== img._id"
                >
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white dark:text-gray-900 bg-opacity-80 text-xs flex align-middle justify-center pointer mr-1"
                    @click.stop="tryOpenHref(img.dataHrefIndex)"
                    :title="img.description"
                    v-if="img.description"
                  >
                    描述
                  </div>
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white dark:text-gray-900 bg-opacity-80 text-xs flex align-middle justify-center pointer mr-1"
                    @click.stop="tryOpenHref(img.dataHrefIndex)"
                    v-if="img.is360Panorama"
                  >
                    360°全景
                  </div>
                </div>
              </template>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div class="blog-tweet-img-swiper-body type-no-swiper" v-else>
        <template v-for="(item, index) in imageGroup" :key="item._id">
          <!-- 非幻灯片模式 -->
          <div class="blog-tweet-img-list-no-swiper-body">
            <div
              class="blog-tweet-img-list-body blog-tweet-img-list-body-no-swiper"
              :class="`cover-count-${item.length}`"
              v-if="item.length > 0"
            >
              <template v-for="(img, indexChild) in item" :key="index">
                <template v-if="img.mimetype.includes('video')">
                  <video
                    :controls="isFullscreen || videoPlayId === img._id"
                    :poster="img.thumfor || img.filepath"
                    :id="`${componentUUID}-${img._id}`"
                    :data-id="img._id"
                    preload="none"
                    muted
                    loop
                    playsinline
                    class="blog-tweet-1img-list-body-video bg-black self-stretch"
                    autoplay
                    @click.stop
                    @play="checkVideoPlay(img._id)"
                    @pause="videoPause"
                    v-if="videoPlayedIdList.includes(img._id)"
                  >
                    <source
                      :src="`${options.siteUrl}${img.filepath}`"
                      type="video/mp4"
                    />
                  </video>
                  <div
                    class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
                    @click.stop="videoPlay(img._id)"
                    v-show="videoPlayId !== img._id"
                  >
                    <UIcon
                      class="blog-tweet-img-list-body-item-video-mask-icon text-white"
                      name="i-heroicons-play-circle"
                    />
                    <UIcon
                      class="blog-tweet-img-list-body-item-video-mask-zoom-icon text-white"
                      name="i-heroicons-magnifying-glass-plus"
                      @click.stop="tryOpenHref(img.dataHrefIndex)"
                    />
                  </div>
                </template>
                <WikimoeImage
                  class="blog-tweet-img-list-body-item"
                  :src="img.thumfor || img.filepath"
                  :alt="img.description || img.filename"
                  :width="img.thumWidth || img.width"
                  :height="img.thumHeight || img.height"
                  loading="lazy"
                  fit="cover"
                  :dataHrefList="dataHrefList"
                  :dataHrefIndex="img.dataHrefIndex"
                  :clickStop="true"
                  :updatedAt="img.updatedAt"
                  :mimetype="img.mimetype"
                  v-if="
                    videoPlayId !== img._id &&
                    !videoPlayedIdList.includes(img._id)
                  "
                />

                <div
                  :class="`absolute tweet-img-list-body-item-description flex index-${indexChild}`"
                  v-if="img.description || img.is360Panorama"
                  v-show="videoPlayId !== img._id"
                >
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white dark:text-gray-900 bg-opacity-80 text-xs flex align-middle justify-center pointer mr-1"
                    @click.stop="tryOpenHref(img.dataHrefIndex)"
                    :title="img.description"
                    v-if="img.description"
                  >
                    描述
                  </div>
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white dark:text-gray-900 bg-opacity-80 text-xs flex align-middle justify-center pointer mr-1"
                    @click.stop="tryOpenHref(img.dataHrefIndex)"
                    v-if="img.is360Panorama"
                  >
                    360°全景
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useOptionStore } from '@/store/options'
import { useIsFullscreenStore } from '@/store/isFullscreen'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const isFullscreenStore = useIsFullscreenStore()
const { isFullscreen: isFullscreenMode } = storeToRefs(isFullscreenStore)

const isFullscreen = computed(() => {
  if (isFullscreenMode.value) {
    const fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement
    if (fullscreenElement) {
      // 查看是否是video标签
      if (fullscreenElement.tagName === 'VIDEO') {
        console.log('VIDEO全屏模式')
        return true
      }
    }
  }
  return false
})

// props
const props = defineProps({
  coverImages: {
    type: Array,
    required: true,
  },
  swiperMode: {
    type: Boolean,
    default: true,
  },
})

const imageGroup = computed(() => {
  // 如果图片大于4张，就每4张分一组
  const group = []
  let temp = []
  let newGroupIndex = 0
  props.coverImages.forEach((item, index) => {
    item['dataHrefIndex'] = index
    const mimetype = item.mimetype
    if (mimetype.includes('video')) {
      if (temp.length > 0) {
        group.push(temp)
        temp = []
      }
      group.push([item])
      newGroupIndex = index + 1
      return
    }
    temp.push(item)
    if ((index - newGroupIndex) % 4 === 3) {
      group.push(temp)
      temp = []
    }
  })
  // 如果最后一组有元素，将其添加到group中
  if (temp.length > 0) {
    group.push(temp)
  }
  return group
})
const dataHrefList = computed(() => {
  // src width height
  return props.coverImages.map((item) => {
    return {
      filepath: item.filepath,
      thumfor: item.thumfor,
      width: item.width,
      height: item.height,
      mimetype: item.mimetype,
      description: item.description,
      is360Panorama: item.is360Panorama ? true : false,
    }
  })
})
const slideChangeTransitionStart = (swiper) => {
  swiper.params.mousewheel.releaseOnEdges = false
}
const slideChangeTransitionEnd = (swiper) => {
  swiper.params.mousewheel.releaseOnEdges = true
  // videoPlayId 的视频暂停
  if (videoPlayId.value) {
    document
      .getElementById(`${componentUUID.value}-${videoPlayId.value}`)
      ?.pause()
  }
  videoPlayId.value = null
}

const videoPlayId = ref(null)
const videoPlayedIdList = ref([])
const videoPlay = async (id) => {
  let pasusePromise = null
  // videoPlayId 的视频暂停
  if (videoPlayId.value) {
    const video = document.getElementById(
      `${componentUUID.value}-${videoPlayId.value}`
    )
    if (video) {
      pasusePromise = new Promise((resolve) => {
        // 定义一个处理函数，便于之后移除监听器
        const onPause = () => {
          video.removeEventListener('pause', onPause) // 暂停后移除监听器
          resolve() // 解决Promise
        }
        video.addEventListener('pause', onPause)
        video.pause() // 尝试暂停视频
      })
    }
  }
  if (pasusePromise) {
    await pasusePromise
  }
  // 如果videoPlayedIdList没有这个id，就添加进去
  if (!videoPlayedIdList.value.includes(id)) {
    videoPlayedIdList.value.push(id)
  }
  videoPlayId.value = id
  nextTick(() => {
    const video = document.getElementById(`${componentUUID.value}-${id}`)
    if (video && video.paused) {
      console.log('play')
      video.play()
    }
  })
}
const checkVideoPlay = async (id) => {
  if (videoPlayId.value === id) {
    return
  }
  console.log('和当前播放的不一样，尝试播放')
  videoPlay(id)
}
const videoPause = async (e) => {
  const target = e.target
  if (target.seeking) {
    return
  }
  videoPlayId.value = null
}
const componentUUID = ref(null)
const blogTweetImgListWrapRef = ref(null)

const tryOpenHref = async (index) => {
  if (props.clickStop) {
    e.stopPropagation()
  }
  const list = dataHrefList.value
  const dataSource = list.map((item) => {
    let width = item.width || null
    let height = item.height || null
    return {
      filepath: item.filepath,
      thumfor: item.thumfor,
      width: width,
      height: height,
      mimetype: item.mimetype,
      description: item.description,
      is360Panorama: item.is360Panorama ? true : false,
    }
  })
  openPhotoSwipe(dataSource, index)
}

// 如果coverImages只有一张，判断是不是高度大于宽度
const isHeight = computed(() => {
  if (props.coverImages.length === 1) {
    return (
      (props.coverImages[0].thumHeight || props.coverImages[0].height) >
      (props.coverImages[0].thumWidth || props.coverImages[0].width)
    )
  }
  return false
})
const checkHeightWidth = (item) => {
  let h = item[0].thumHeight || item[0].height
  let w = item[0].thumWidth || item[0].width
  if (h > w) {
    if (w < 150) {
      // 计算w和h的比例
      const ratio = w / h
      w = 150
      h = w / ratio
    }
    return {
      height: `${h}px`,
    }
  } else {
    if (h < 150) {
      // 计算w和h的比例
      const ratio = h / w
      h = 150
      w = h / ratio
    }
    return {
      width: `${w}px`,
    }
  }
}

onMounted(() => {
  componentUUID.value = `tw-${uuid()}`
})
onUnmounted(() => {})
</script>
<style scoped>
.blog-tweet-img-list-no-swiper-body {
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: 2px;
}
.blog-tweet-img-list-no-swiper-body:last-child {
  margin-bottom: 0;
}
.blog-tweet-1img-list-body {
  max-width: 100%;
  position: relative;
}
.blog-tweet-img-list-body {
  /* grid */
  display: grid;
  /* 2像素间距 */
  grid-gap: 2px;
  /* border-radius: 20px; */
  overflow: hidden;
  position: relative;
}
.tweet-img-list-body-item-description {
  z-index: 11;
  left: 13px;
  top: 10px;
}
.blog-tweet-img-list-body.cover-count-1-1 {
  /* 宽高跟着内容走 */
  display: inline-block;
  border-radius: 0.75rem;
  max-width: 100%;
  min-height: 150px;
  isolation: isolate;
}
.blog-tweet-img-list-body.cover-count-1-1.is-height {
  max-height: 380px;
}
.blog-tweet-img-list-body.cover-count-1 {
  grid-template-columns: 1fr;
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-1 video {
  width: 100%;
  object-fit: contain;
  /* 16 / 9 */
  aspect-ratio: 16 / 9;
}
.blog-tweet-img-list-body.cover-count-2 {
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-2
  .tweet-img-list-body-item-description.index-1 {
  left: calc(50% + 12px);
}
.blog-tweet-img-list-body.cover-count-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(2, 1fr);
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-3
  .tweet-img-list-body-item-description.index-1 {
  left: calc(50% + 12px);
}
.blog-tweet-img-list-body.cover-count-3
  .tweet-img-list-body-item-description.index-2 {
  left: calc(50% + 12px);
  top: calc(50% + 10px);
}
.blog-tweet-img-list-body-no-swiper {
  margin-top: 2px;
}
/* 第一个每天top */
.blog-tweet-img-list-body-no-swiper:nth-child(1) {
  margin-top: 0px;
}

.blog-tweet-img-list-body.cover-count-3
  .blog-tweet-img-list-body-item:nth-child(1) {
  grid-row: span 2;
}
.blog-tweet-img-list-body-item {
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-4
  .tweet-img-list-body-item-description.index-1 {
  left: calc(50% + 12px);
}
.blog-tweet-img-list-body.cover-count-4
  .tweet-img-list-body-item-description.index-2 {
  left: 12px;
  top: calc(50% + 10px);
}
.blog-tweet-img-list-body.cover-count-4
  .tweet-img-list-body-item-description.index-3 {
  left: calc(50% + 12px);
  top: calc(50% + 10px);
}
.blog-tweet-img-swiper-body {
  border-radius: 0.75rem;
  /* border: 1px solid #e2e2e2; */
  overflow: hidden;
  isolation: isolate;
}
.blog-tweet-img-swiper-body.type-no-swiper {
  border-radius: 0.75rem;
}
.blog-tweet-img-list-body.cover-count-1-1.no-swiper-mode {
  border-radius: 0.75rem;
}
.blog-tweet-img-swiper-item {
  width: 100%;
  position: relative;
  z-index: 1;
}
.blog-tweet-img-swiper-item-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
}
.blog-tweet-img-list-body-item-video-mask {
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
.blog-tweet-img-list-body-item-video-mask-icon {
  font-size: 6rem;
}
.blog-tweet-img-list-body-item-video-mask-zoom-icon {
  position: absolute;
  bottom: 10px;
  right: 13px;
  font-size: 1.25rem;
  cursor: pointer;
}
/* 手机 */
@media (max-width: 767px) {
  .blog-tweet-img-list-body.cover-count-1-1.is-height {
    max-height: 320px;
  }
}
</style>
<style>
.blog-tweet-img-list-wrap .swiper-slide {
  aspect-ratio: 16 / 9;
}
.blog-tweet-img-swiper-body .swiper-pagination-fraction {
  top: 8px !important;
  right: 13px !important;
  bottom: unset !important;
  left: unset !important;
  color: #ffffff !important;
  width: auto !important;
  background: rgba(0, 0, 0, 0.5) !important;
  padding: 2px 10px !important;
  border-radius: 22px !important;
  font-size: 12px !important;
}
.blog-tweet-img-list-body .blog-tweet-1img-list-body {
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-1-1 video,
.blog-tweet-img-list-body.cover-count-1-1 .wikimoe-image {
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-1-1 .wikimoe-image {
  object-fit: cover;
}
.blog-tweet-img-list-body.cover-count-1-1 video {
  object-fit: contain;
}
/* .blog-tweet-img-list-body.cover-count-1-1 .wikimoe-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 50vh;
} */
</style>
