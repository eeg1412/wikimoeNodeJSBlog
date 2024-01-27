<template>
  <div
    class="blog-tweet-img-list-wrap"
    ref="blogTweetImgListWrapRef"
    :class="`cover-count-${coverImages.length}`"
    v-if="coverImages.length > 0"
  >
    <div
      class="blog-tweet-img-list-body cover-count-1-1"
      :style="`width: ${oneItemWidth}px; height: ${oneItemHeight}px;`"
      v-if="coverImages.length === 1"
    >
      <!-- 1张图时 -->
      <div class="blog-tweet-1img-list-body">
        <WikimoeImage
          :src="coverImages[0].thumfor || coverImages[0].filepath"
          :alt="coverImages[0].filename"
          :width="oneItemWidth"
          :height="oneItemHeight"
          :data-href="coverImages[0].filepath"
          :dataHrefList="dataHrefList"
          :dataHrefIndex="0"
          :clickStop="true"
          :updatedAt="coverImages[0].updatedAt"
          loading="lazy"
          :mimetype="coverImages[0].mimetype"
          v-if="videoPlayId !== coverImages[0]._id"
        />
        <video
          controls
          :style="`width: ${oneItemWidth}px; height: ${oneItemHeight}px;`"
          :id="`${componentUUID}-${coverImages[0]._id}`"
          muted
          loop
          playsinline
          class="blog-tweet-1img-list-body-video w-full h-auto object-contain"
          @click.stop
          v-else
        >
          <source :src="videoPlayUrl" type="video/mp4" />
        </video>
        <!-- 如果是视频加上播放按钮 -->
        <div
          class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
          v-if="
            coverImages[0].mimetype.includes('video') &&
            videoPlayId !== coverImages[0]._id
          "
          @click.stop="
            videoPlay(
              coverImages[0]._id,
              `${options.siteUrl}${coverImages[0].filepath}`
            )
          "
        >
          <UIcon
            class="blog-tweet-img-list-body-item-video-mask-icon text-white"
            :class="{ 'animate-spin': videoIsLoading }"
            :name="
              videoIsLoading
                ? 'i-heroicons-arrow-path'
                : 'i-heroicons-play-circle'
            "
            size="30"
          />
        </div>
      </div>
    </div>
    <template v-else>
      <div class="blog-tweet-img-swiper-body" v-if="swiperMode">
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
            <!-- 四张图以内 -->
            <div
              class="blog-tweet-img-list-body"
              :class="`cover-count-${item.length}`"
              v-if="item.length > 0"
            >
              <template v-for="(img, indexChild) in item" :key="index">
                <WikimoeImage
                  class="blog-tweet-img-list-body-item"
                  :src="img.thumfor || img.filepath"
                  :alt="img.filename"
                  :width="img.thumWidth || img.width"
                  :height="img.thumHeight || img.height"
                  loading="lazy"
                  fit="cover"
                  :dataHrefList="dataHrefList"
                  :dataHrefIndex="index * 4 + indexChild"
                  :square="true"
                  :clickStop="true"
                  :updatedAt="img.updatedAt"
                  :mimetype="img.mimetype"
                  v-if="videoPlayId !== img._id"
                />
                <video
                  controls
                  :id="`${componentUUID}-${img._id}`"
                  muted
                  loop
                  playsinline
                  class="blog-tweet-1img-list-body-video w-full h-full object-contain bg-black self-stretch"
                  @click.stop
                  v-else
                >
                  <source :src="videoPlayUrl" type="video/mp4" />
                </video>
                <div
                  class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
                  @click.stop="
                    videoPlay(img._id, `${options.siteUrl}${img.filepath}`)
                  "
                  v-if="
                    img.mimetype.includes('video') && videoPlayId !== img._id
                  "
                >
                  <UIcon
                    class="blog-tweet-img-list-body-item-video-mask-icon text-white"
                    name="i-heroicons-play-circle"
                    size="30"
                  />
                </div>
              </template>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div class="blog-tweet-img-swiper-body type-no-swiper" v-else>
        <template v-for="(item, index) in imageGroup" :key="item._id">
          <!-- 四张图以内 -->
          <div
            class="blog-tweet-img-list-body blog-tweet-img-list-body-no-swiper"
            :class="`cover-count-${item.length}`"
            v-if="item.length > 0"
          >
            <template v-for="(img, indexChild) in item" :key="index">
              <WikimoeImage
                class="blog-tweet-img-list-body-item"
                :src="img.thumfor || img.filepath"
                :alt="img.filename"
                :width="img.thumWidth || img.width"
                :height="img.thumHeight || img.height"
                loading="lazy"
                fit="cover"
                :dataHrefList="dataHrefList"
                :dataHrefIndex="index * 4 + indexChild"
                :square="true"
                :clickStop="true"
                :updatedAt="img.updatedAt"
                :mimetype="img.mimetype"
                v-if="videoPlayId !== img._id"
              />
              <video
                controls
                :id="`${componentUUID}-${img._id}`"
                muted
                loop
                playsinline
                class="blog-tweet-1img-list-body-video w-full h-full object-contain bg-black self-stretch"
                @click.stop
                v-else
              >
                <source :src="videoPlayUrl" type="video/mp4" />
              </video>
              <div
                class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
                @click.stop="
                  videoPlay(img._id, `${options.siteUrl}${img.filepath}`)
                "
                v-if="img.mimetype.includes('video') && videoPlayId !== img._id"
              >
                <UIcon
                  class="blog-tweet-img-list-body-item-video-mask-icon text-white"
                  name="i-heroicons-play-circle"
                  size="30"
                />
              </div>
            </template>
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
      src: item.filepath,
      width: item.width,
      height: item.height,
      mimetype: item.mimetype,
    }
  })
})
const slideChangeTransitionStart = (swiper) => {
  swiper.params.mousewheel.releaseOnEdges = false
}
const slideChangeTransitionEnd = (swiper) => {
  swiper.params.mousewheel.releaseOnEdges = true
  videoPlayId.value = null
}

const videoPlayId = ref(null)
const videoPlayUrl = ref(null)
const videoIsLoading = ref(false)
const videoPlay = (id, url) => {
  videoIsLoading.value = true
  if (videoPlayUrl.value) {
    revokeVideoObjectURL(videoPlayUrl.value)
  }
  videoUrlToBlob(url)
    .then((blobUrl) => {
      videoPlayUrl.value = blobUrl
      // 获取id的images
      videoPlayId.value = id
      nextTick(() => {
        const video = document.getElementById(`${componentUUID.value}-${id}`)
        video.play()
      })
    })
    .finally(() => {
      videoIsLoading.value = false
    })
}
const componentUUID = ref(null)
const blogTweetImgListWrapRef = ref(null)
const oneItemWidth = ref(null)
const oneItemHeight = ref(null)
let resizeTimer = null
const sumSize = () => {
  const width = blogTweetImgListWrapRef.value.offsetWidth
  const height = window.innerHeight
  const coverImages = props.coverImages
  const oneItem = coverImages[0]
  let oneItemWidth_ = oneItem.thumWidth || oneItem.width
  let oneItemHeight_ = oneItem.thumHeight || oneItem.height
  // 如果宽大于父级,就缩小
  if (oneItemWidth_ > width) {
    const scale = width / oneItemWidth_
    oneItemWidth_ = width
    oneItemHeight_ = oneItemHeight_ * scale
  }
  // 如果高度大于半个屏幕，就缩小
  if (oneItemHeight_ > height / 2) {
    let resizeHeight = height / 2
    if (resizeHeight < 350) {
      resizeHeight = 350
    }
    const scale = resizeHeight / oneItemHeight_
    oneItemWidth_ = oneItemWidth_ * scale
    oneItemHeight_ = resizeHeight
  }
  oneItemWidth.value =
    oneItemWidth_ % 2 === 0
      ? Math.floor(oneItemWidth_)
      : Math.floor(oneItemWidth_) - 1
  oneItemHeight.value =
    oneItemHeight_ % 2 === 0
      ? Math.floor(oneItemHeight_)
      : Math.floor(oneItemHeight_) - 1
}
const sumSizeThrottle = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
  resizeTimer = setTimeout(() => {
    sumSize()
  }, 100)
}
onMounted(() => {
  componentUUID.value = uuid()
  const coverImages = props.coverImages
  if (coverImages.length === 1) {
    sumSize()
    // 监听窗口变化
    window.addEventListener('resize', sumSizeThrottle)
  }
})
onUnmounted(() => {
  const coverImages = props.coverImages
  if (coverImages.length === 1) {
    window.removeEventListener('resize', sumSizeThrottle)
  }
  if (videoPlayUrl.value) {
    revokeVideoObjectURL(videoPlayUrl.value)
  }
})
</script>
<style scoped>
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
.blog-tweet-img-list-body.cover-count-1-1 {
  /* 宽高跟着内容走 */
  display: inline-block;
  border-radius: 20px;
  max-width: 100%;
  isolation: isolate;
}
.blog-tweet-img-list-body.cover-count-1 {
  grid-template-columns: 1fr;
  height: 350px;
}
.blog-tweet-img-list-body.cover-count-1 video {
  height: 350px;
}
.blog-tweet-img-list-body.cover-count-2 {
  grid-template-columns: repeat(2, 1fr);
  height: 350px;
}
.blog-tweet-img-list-body.cover-count-3 {
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: auto;
  height: 350px;
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
  height: 350px;
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
/* 手机减少 .blog-tweet-img-list-body.cover-count-1 到 4 的高度 */
@media screen and (max-width: 768px) {
  .blog-tweet-img-list-body.cover-count-1 {
    height: 200px;
  }
  .blog-tweet-img-list-body.cover-count-1 video {
    height: 200px;
  }
  .blog-tweet-img-list-body.cover-count-2 {
    height: 200px;
  }
  .blog-tweet-img-list-body.cover-count-3 {
    height: 200px;
  }
  .blog-tweet-img-list-body.cover-count-4 {
    height: 200px;
  }
}
</style>
<style>
.blog-tweet-img-swiper-body .swiper-pagination-fraction {
  top: 13px !important;
  right: 16px !important;
  bottom: unset !important;
  left: unset !important;
  color: #ffffff !important;
  width: auto !important;
  background: rgba(0, 0, 0, 0.5) !important;
  padding: 2px 10px !important;
  border-radius: 20px !important;
  font-size: 14px !important;
}
/* .blog-tweet-img-list-body.cover-count-1-1 .wikimoe-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 50vh;
} */
</style>
