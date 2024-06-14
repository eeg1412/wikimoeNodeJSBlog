<template>
  <div
    class="blog-tweet-img-list-wrap"
    ref="blogTweetImgListWrapRef"
    :class="`cover-count-${coverImages.length}`"
    v-if="coverImages.length > 0"
  >
    <div
      class="blog-tweet-img-list-body cover-count-1-1"
      :style="{
        aspectRatio: `${coverImages[0].thumWidth || coverImages[0].width} / ${
          coverImages[0].thumHeight || coverImages[0].height
        }`,
        ...((coverImages[0].thumHeight || coverImages[0].height) >
        (coverImages[0].thumWidth || coverImages[0].width)
          ? {
              height: `${coverImages[0].thumHeight || coverImages[0].height}px`,
              maxHeight: '320px',
            }
          : { width: `${coverImages[0].thumWidth || coverImages[0].width}px` }),
      }"
      v-if="coverImages.length === 1"
    >
      <!-- 1张图时 -->
      <div class="blog-tweet-1img-list-body">
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
          v-if="videoPlayId !== coverImages[0]._id"
        />
        <video
          controls
          :id="`${componentUUID}-${coverImages[0]._id}`"
          muted
          loop
          playsinline
          class="blog-tweet-1img-list-body-video bg-black"
          @click.stop
          v-else
        >
          <source
            :src="`${options.siteUrl}${coverImages[0].filepath}`"
            type="video/mp4"
          />
        </video>
        <!-- 如果是视频加上播放按钮 -->
        <div
          class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
          v-if="
            coverImages[0].mimetype.includes('video') &&
            videoPlayId !== coverImages[0]._id
          "
          @click.stop="videoPlay(coverImages[0]._id)"
        >
          <UIcon
            class="blog-tweet-img-list-body-item-video-mask-icon text-white"
            name="i-heroicons-play-circle"
          />
        </div>
        <div
          class="absolute tweet-img-list-body-item-description"
          v-if="coverImages[0].description"
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
                  :alt="img.description || img.filename"
                  :width="img.thumWidth || img.width"
                  :height="img.thumHeight || img.height"
                  loading="lazy"
                  fit="cover"
                  :dataHrefList="dataHrefList"
                  :dataHrefIndex="index * 4 + indexChild"
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
                  class="blog-tweet-1img-list-body-video bg-black self-stretch"
                  @click.stop
                  v-else
                >
                  <source
                    :src="`${options.siteUrl}${img.filepath}`"
                    type="video/mp4"
                  />
                </video>
                <div
                  class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
                  @click.stop="videoPlay(img._id)"
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
                <div
                  class="absolute tweet-img-list-body-item-description"
                  v-if="img.description"
                >
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white bg-opacity-80 text-xs flex align-middle justify-center pointer"
                    @click.stop="tryOpenHref(index * 4 + indexChild)"
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
          <!-- 四张图以内 -->
          <div class="blog-tweet-img-list-no-swiper-body">
            <div
              class="blog-tweet-img-list-body blog-tweet-img-list-body-no-swiper"
              :class="`cover-count-${item.length}`"
              v-if="item.length > 0"
            >
              <template v-for="(img, indexChild) in item" :key="index">
                <WikimoeImage
                  class="blog-tweet-img-list-body-item"
                  :src="img.thumfor || img.filepath"
                  :alt="img.description || img.filename"
                  :width="img.thumWidth || img.width"
                  :height="img.thumHeight || img.height"
                  loading="lazy"
                  fit="cover"
                  :dataHrefList="dataHrefList"
                  :dataHrefIndex="index * 4 + indexChild"
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
                  class="blog-tweet-1img-list-body-video bg-black self-stretch"
                  @click.stop
                  v-else
                >
                  <source
                    :src="`${options.siteUrl}${img.filepath}`"
                    type="video/mp4"
                  />
                </video>
                <div
                  class="blog-tweet-img-list-body-item-video-mask absolute inset-0 flex items-center justify-center z-10"
                  @click.stop="videoPlay(img._id)"
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
                <div
                  class="absolute tweet-img-list-body-item-description"
                  v-if="img.description"
                >
                  <div
                    class="rounded px-1 py-0.5 bg-primary-500 text-white bg-opacity-80 text-xs flex align-middle justify-center pointer"
                    @click.stop="tryOpenHref(index * 4 + indexChild)"
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
  videoPlayId.value = null
}

const videoPlayId = ref(null)
const videoPlay = (id) => {
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
  left: 12px;
  top: 10px;
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
