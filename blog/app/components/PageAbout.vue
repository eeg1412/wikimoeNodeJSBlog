<template>
  <div>
    <div class="my-page-banner">
      <!-- img -->
      <img
        v-if="author.cover"
        :src="author.cover.filepath"
        :width="author.cover.width"
        :height="author.cover.height"
        alt="cover"
        class="w-full h-auto"
      />
      <img
        v-else
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
          <div class="text-gray-500">
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
    required: true
  }
})
</script>
<style scoped>
@reference '@/assets/css/main.css';

.my-page-banner {
  margin-top: -18px;
  margin-left: -18px;
  margin-right: -18px;
}
.my-page-avatar {
  @apply dark:border-gray-800 dark:bg-gray-800;
  margin-top: -40px;
  border: 4px solid #fff;
  background-color: #fff;
}
</style>
