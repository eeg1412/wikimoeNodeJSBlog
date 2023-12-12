<template>
  <div class="blog-body">
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
<style scoped></style>
