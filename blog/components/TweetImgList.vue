<template>
  <div
    class="blog-tweet-img-list-wrap"
    :class="`cover-count-${coverImages.length}`"
    v-if="coverImages.length > 0"
  >
    <div
      class="blog-tweet-img-list-body cover-count-1-1"
      v-if="coverImages.length === 1"
    >
      <!-- 1张图时 -->
      <div
        class="blog-tweet-1img-list-body"
        :style="{
          width: `${coverImages[0].thumWidth || coverImages[0].width}px`,
        }"
      >
        <WikimoeImage
          class="mr5"
          :src="coverImages[0].thumfor || coverImages[0].filepath"
          :alt="coverImages[0].filename"
          :width="coverImages[0].thumWidth || coverImages[0].width"
          :height="coverImages[0].thumHeight || coverImages[0].height"
          :data-href="coverImages[0].filepath"
          :dataHrefList="dataHrefList"
          :dataHrefIndex="0"
          loading="lazy"
        />
      </div>
    </div>
    <div class="blog-tweet-img-swiper-body" v-else>
      <Swiper
        :modules="[SwiperPagination, SwiperMousewheel]"
        :slides-per-view="1"
        :loop="false"
        :mousewheel="imageGroup.length > 1"
        :pagination="{
          type: 'fraction',
          clickable: true,
        }"
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
                class="mr5 blog-tweet-img-list-body-item"
                :src="img.thumfor || img.filepath"
                :alt="img.filename"
                :width="img.thumWidth || img.width"
                :height="img.thumHeight || img.height"
                loading="lazy"
                fit="cover"
                :dataHrefList="dataHrefList"
                :dataHrefIndex="indexChild"
                :square="true"
              />
            </template>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
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

const imageGroup = computed(() => {
  // 如果图片大于4张，就每4张分一组
  const group = []
  let temp = []
  props.coverImages.forEach((item, index) => {
    temp.push(item)
    if (index % 4 === 3) {
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
    }
  })
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
.blog-tweet-img-list-body.cover-count-1-1 {
  /* 宽高跟着内容走 */
  display: inline-block;
  max-width: 100%;
}
.blog-tweet-img-list-body.cover-count-1 {
  grid-template-columns: 1fr;
  height: 400px;
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
  /* border: 1px solid #e2e2e2; */
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
