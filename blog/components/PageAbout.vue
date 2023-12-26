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
      <div class="mt-2 ml-3">
        <div class="text-2xl font-bold my-page-nickname">
          {{ author.nickname }}
        </div>
      </div>
    </div>
    <!-- 介绍 -->
    <div class="mt-3">
      <div class="text-gray-500">{{ author.description || '暂无介绍' }}</div>
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
  margin-top: -48px;
  border: 4px solid #fff;
}
</style>
