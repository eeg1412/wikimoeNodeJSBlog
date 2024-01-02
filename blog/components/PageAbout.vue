<template>
  <div>
    <div class="my-page-banner">
      <!-- img -->
      <img
        src="/img/mypage-banner.webp"
        width="880"
        height="350"
        alt="mypage-banner"
      />
    </div>
    <!-- 头像 -->
    <div class="flex">
      <img
        :src="author.photo"
        class="my-page-avatar flex-shrink-0 rounded-full w-32 h-32"
      />
      <div class="mt-1 ml-3">
        <div
          class="text-xl sm:text-2xl font-bold my-page-nickname line-clamp-1 overflow-ellipsis overflow-hidden"
        >
          {{ author.nickname }}
        </div>
        <!-- 介绍 -->
        <div class="mt-1">
          <div
            class="text-gray-500 line-clamp-2 overflow-ellipsis overflow-hidden"
          >
            {{ author.description || '暂无介绍' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  author: {
    type: Object,
    required: true,
  },
})
</script>
<style scoped>
.my-page-banner {
  margin-top: -20px;
  margin-left: -20px;
  margin-right: -20px;
}
.my-page-avatar {
  margin-top: -40px;
  border: 4px solid #fff;
}
</style>
