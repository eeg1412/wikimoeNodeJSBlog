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
      }"
      :style="{
        aspectRatio: `${coverImages[0].thumWidth || coverImages[0].width} / ${
          coverImages[0].thumHeight || coverImages[0].height
        }`,
        ...(isHeight
          ? {
              height: `${coverImages[0].thumHeight || coverImages[0].height}px`,
            }
          : { width: `${coverImages[0].thumWidth || coverImages[0].width}px` }),
      }"
      v-if="coverImages.length === 1"
    >
      <!-- 1张图时 -->
      <div class="blog-tweet-1img-list-body">
        <template v-if="coverImages[0].mimetype.includes('video')">
          <video
            :controls="videoPlayId === coverImages[0]._id"
            :id="`${componentUUID}-${coverImages[0]._id}`"
            :poster="coverImages[0].thumfor || coverImages[0].filepath"
            muted
            loop
            playsinline
            preload="none"
            class="blog-tweet-1img-list-body-video bg-black"
            @click.stop
            @pause="videoPlayId = null"
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
          class="absolute tweet-img-list-body-item-description"
          v-if="coverImages[0].description"
          v-show="videoPlayId !== coverImages[0]._id"
        >
          <div
            class="rounded px-1 py-0.5 bg-primary-500 text-white bg-opacity-80 text-xs flex align-middle justify-center pointer"
            @click.stop="tryOpenHref(0)"
            :title="coverImages[0].description"
          >
            描述
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
                    :controls="videoPlayId === img._id"
                    :poster="img.thumfor || img.filepath"
                    :id="`${componentUUID}-${img._id}`"
                    preload="none"
                    muted
                    loop
                    playsinline
                    class="blog-tweet-1img-list-body-video bg-black self-stretch"
                    @click.stop
                    @pause="videoPlayId = null"
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
                      size="30"
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
                  class="absolute tweet-img-list-body-item-description"
                  v-if="img.description"
                  v-show="videoPlayId !== img._id"
                >
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white bg-opacity-80 text-xs flex align-middle justify-center pointer"
                    @click.stop="tryOpenHref(img.dataHrefIndex)"
                    :title="img.description"
                  >
                    描述
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
                    :controls="videoPlayId === img._id"
                    :poster="img.thumfor || img.filepath"
                    :id="`${componentUUID}-${img._id}`"
                    preload="none"
                    muted
                    loop
                    playsinline
                    class="blog-tweet-1img-list-body-video bg-black self-stretch"
                    @click.stop
                    @pause="videoPlayId = null"
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
                      size="30"
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
                  class="absolute tweet-img-list-body-item-description"
                  v-if="img.description"
                  v-show="videoPlayId !== img._id"
                >
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white bg-opacity-80 text-xs flex align-middle justify-center pointer"
                    @click.stop="tryOpenHref(img.dataHrefIndex)"
                    :title="img.description"
                  >
                    描述
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

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

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
    video.play()
  })
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

onMounted(() => {
  componentUUID.value = uuid()
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
  border-radius: 20px;
  max-width: 100%;
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
  .tweet-img-list-body-item-description:nth-of-type(2) {
  left: calc(50% + 12px);
}
.blog-tweet-img-list-body.cover-count-3 {
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: auto;
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-3
  .tweet-img-list-body-item-description:nth-of-type(2) {
  left: calc(50% + 12px);
}
.blog-tweet-img-list-body.cover-count-3
  .tweet-img-list-body-item-description:nth-of-type(3) {
  left: calc(50% + 12px);
  top: calc(50% + 6px);
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
  grid-auto-rows: auto;
  width: 100%;
  height: 100%;
}
.blog-tweet-img-list-body.cover-count-4
  .tweet-img-list-body-item-description:nth-of-type(2) {
  left: calc(50% + 12px);
}
.blog-tweet-img-list-body.cover-count-4
  .tweet-img-list-body-item-description:nth-of-type(3) {
  left: 12px;
  top: calc(50% + 6px);
}
.blog-tweet-img-list-body.cover-count-4
  .tweet-img-list-body-item-description:nth-of-type(4) {
  left: calc(50% + 12px);
  top: calc(50% + 6px);
}
.blog-tweet-img-swiper-body {
  border-radius: 20px;
  /* border: 1px solid #e2e2e2; */
  overflow: hidden;
  isolation: isolate;
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
  border-radius: 20px;
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
  border-radius: 20px !important;
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
