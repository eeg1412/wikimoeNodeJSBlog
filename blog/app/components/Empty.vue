<template>
  <div class="empty-body">
    <div class="empty-body-content">
      <div>
        <!-- img/nodata.webp -->
        <img
          src="/img/nodata.webp?v=2"
          width="1536"
          height="1024"
          alt="nodata"
        />
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped>
@reference '@/assets/css/main.css';

.empty-body {
  width: 100%;
  padding: 60px 0;
}
.empty-body-content {
  @apply dark:mix-blend-soft-light;
  text-align: center;
  font-size: 18px;
  position: relative;
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
  opacity: 0.8;
}
</style>
