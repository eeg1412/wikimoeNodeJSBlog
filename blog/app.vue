<template>
  <div class="blog-body">
    <NuxtLoadingIndicator color="#ef90a7" />
    <NuxtPage></NuxtPage>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'
const optionStore = useOptionStore()
const { getOptions } = optionStore
getOptions()
</script>
<style scoped>
.blog-body {
  font-size: 14px;
}
</style>
