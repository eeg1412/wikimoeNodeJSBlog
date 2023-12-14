<template>
  <div
    class="blog-tweet-img-list-wrap"
    :class="`cover-count-${coverImages.length}`"
  >
    <template v-if="coverImages.length > 4">
      <div></div>
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
</style>
