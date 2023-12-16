<template>
  <div
    class="blog-tweet-img-list-wrap"
    :class="`cover-count-${coverImages.length}`"
  >
    <template v-if="coverImages.length > 4">
      <div class="blog-tweet-img-swiper-body">
        <Swiper
          :modules="[SwiperAutoplay, SwiperPagination, SwiperMousewheel]"
          :slides-per-view="1"
          :loop="true"
          :mousewheel="true"
          :autoplay="{
            delay: 8000,
            disableOnInteraction: true,
          }"
          :pagination="{
            type: 'fraction',
            clickable: true,
          }"
        >
          <SwiperSlide v-for="(item, index) in coverImages" :key="item._id">
            <div
              class="blog-tweet-img-swiper-item"
              :style="{
                paddingBottom: sumCoverImagesPadding,
              }"
            >
              <WikimoeImage
                class="blog-tweet-img-swiper-item-img"
                :src="item.thumfor || item.filepath"
                :alt="item.filename"
                :width="880"
                :height="300"
                fit="contain"
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </template>
    <template v-else>
      <!-- 四张图以内 -->
      <div
        class="blog-tweet-img-list-body"
        :class="`cover-count-${coverImages.length}`"
        v-if="coverImages.length > 0"
      >
        <!-- 1张图时 -->
        <div
          class="blog-tweet-1img-list-body"
          :style="{
            width: `${coverImages[0].thumWidth || coverImages[0].width}px`,
          }"
          v-if="coverImages.length === 1"
        >
          <WikimoeImage
            class="mr5"
            :src="coverImages[0].thumfor || coverImages[0].filepath"
            :alt="coverImages[0].filename"
            :width="coverImages[0].thumWidth || coverImages[0].width"
            :height="coverImages[0].thumHeight || coverImages[0].height"
            :data-href="coverImages[0].filepath"
            loading="lazy"
          />
        </div>
        <template v-else v-for="(img, index) in coverImages" :key="index">
          <WikimoeImage
            class="mr5 blog-tweet-img-list-body-item"
            :src="img.thumfor || img.filepath"
            :alt="img.filename"
            :width="img.thumWidth || img.width"
            :height="img.thumHeight || img.height"
            loading="lazy"
            fit="cover"
            :square="true"
          />
        </template>
      </div>
    </template>
  </div>
</template>
<script setup>
// props
const props = defineProps({
  coverImages: {
    type: Array,
    required: true,
  },
})
const sumCoverImagesPadding = computed(() => {
  if (props.coverImages.length > 4) {
    // 寻找最大的宽度和高度
    const maxWidth = Math.max(...props.coverImages.map((item) => item.width))
    let maxHeight = Math.max(...props.coverImages.map((item) => item.height))
    // 高度最大是宽度的2倍
    maxHeight = maxHeight > maxWidth * 1.5 ? maxWidth * 1.5 : maxHeight
    // 计算padding
    const padding = (maxHeight / maxWidth) * 100

    return `${padding}%`
  }
  return ''
})
</script>
<style scoped>
.blog-tweet-1img-list-body {
  max-width: 100%;
}
.blog-tweet-img-list-body {
  /* grid */
  display: grid;
  /* 2像素间距 */
  grid-gap: 2px;
  border-radius: 20px;
  overflow: hidden;
}
.blog-tweet-img-list-body.cover-count-1 {
  /* 宽高跟着内容走 */
  display: inline-block;
  max-width: 100%;
}
.blog-tweet-img-list-body.cover-count-2 {
  grid-template-columns: repeat(2, 1fr);
  height: 400px;
}
.blog-tweet-img-list-body.cover-count-3 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: auto;
  height: 400px;
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
  height: 400px;
}
.blog-tweet-img-swiper-body {
  border-radius: 20px;
  border: 1px solid #e2e2e2;
  overflow: hidden;
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
</style>
