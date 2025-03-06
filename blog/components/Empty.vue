<template>
  <div class="empty-body">
    <div class="empty-body-content">
      <div>
        <!-- img/nodata.webp -->
        <img src="/img/nodata.webp" width="1280" height="1280" alt="nodata" />
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
.empty-body {
  width: 100%;
  padding: 40px 0;
}
.empty-body-content {
  @apply dark:mix-blend-soft-light;
  text-align: center;
  font-size: 18px;
  position: relative;
}
</style>
