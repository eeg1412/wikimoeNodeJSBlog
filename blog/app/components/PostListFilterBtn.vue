<template>
  <transition name="fade">
    <div
      class="common-right-tool-btn opacity-70 text-white hover:opacity-100"
      @click="onClick"
    >
      <span v-if="postRouteType === 'blog'" class="text-sm system-ui-font"
        >博</span
      >
      <span v-else-if="postRouteType === 'tweet'" class="text-sm system-ui-font"
        >推</span
      >
      <WUIIcon name="i-heroicons-adjustments-horizontal" v-else />
    </div>
  </transition>
</template>

<script setup>
const route = useRoute()
const emits = defineEmits()
const postRouteType = computed(() => route.params.type)
const onClick = () => {
  // emit
  emits('btnClick')
}
</script>

<style scoped></style>
