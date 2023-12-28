<template>
  <div class="empty-body">
    <div class="empty-body-content">
      <!-- 文字 -->
      <div class="flex items-center justify-center mt-10">
        <UIcon name="i-heroicons-circle-stack" class="mr-2" />
        暂无数据
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.empty-body {
  width: 100%;
  padding: 100px 0;
}
.empty-body-content {
  text-align: center;
  color: #999;
  font-size: 18px;
}
</style>
