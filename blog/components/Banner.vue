<template>
  <div class="top-banner-list-body" v-if="bannerListData">
    <Swiper
      :modules="[SwiperAutoplay, SwiperPagination, SwiperMousewheel]"
      :slides-per-view="1"
      :loop="true"
      :mousewheel="true"
      :autoplay="{
        delay: 8000,
        disableOnInteraction: false,
      }"
      :pagination="{
        type: 'progressbar',
        clickable: true,
      }"
    >
      <SwiperSlide v-for="(item, index) in bannerListData" :key="item._id">
        <div
          class="top-banner-list-item"
          :class="{
            pointer: item.link,
          }"
          @click="openLink(item)"
          @click.middle="openLink(item, true)"
        >
          <WikimoeImage
            class="top-banner-list-item-img"
            :src="item.img"
            :alt="item.title"
            :width="880"
            :height="300"
            loading="lazy"
          />
          <!-- title -->
          <div class="top-banner-list-item-title">
            {{ item.title }}
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>
<script setup>
import { getBannerListApi } from '@/api/banner'
const router = useRouter()
const [bannerListDataResponse] = await Promise.all([getBannerListApi()])
const { data: bannerListData } = bannerListDataResponse

const openLink = (item, midClick) => {
  const { link, isdefault, newtab } = item
  console.log(item)
  if (newtab || midClick) {
    window.open(link)
  } else if (isdefault) {
    router.push(link)
  } else {
    // 本窗口打开
    window.location.href = link
  }
}
</script>
<style scoped>
.top-banner-list-body {
  width: 100%;
  margin-bottom: 0px;
  overflow: hidden;
  margin-bottom: -5px;
}
.top-banner-list-item {
  width: 100%;
  /* padding 比例是 880/350 */
  padding-bottom: 39.77%;
  position: relative;
  z-index: 1;
}
.top-banner-list-item-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.top-banner-list-item-title {
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 100%;
  height: 28px;
  background: rgba(0, 0, 0, 0.4);
  /* 垂直居中 */
  line-height: 24px;
  padding: 0 40px 0 9px;
  box-sizing: border-box;
  color: #ffffff;
  z-index: 2;
  /* 超过点点点 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
<style>
.top-banner-list-body
  .swiper-pagination-progressbar
  .swiper-pagination-progressbar-fill {
  background: #ef90a7 !important;
}
.top-banner-list-body .swiper-pagination-progressbar {
  top: unset !important;
  bottom: 0px !important;
  background: rgba(0, 0, 0, 0.4);
}
</style>
