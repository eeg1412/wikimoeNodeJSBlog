<template>
  <div class="blog-layout-right-customize-html" v-html="content"></div>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.blog-layout-right-customize-html {
  padding-top: 10px;
}
</style>
