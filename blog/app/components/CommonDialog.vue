<template>
  <WUIModal v-model="commonDialogOpen">
    <div
      class="flex items-center justify-between page-commonDialog-current-commonDialog-title"
    >
      <!-- slot -->
      <slot name="title"></slot>
      <WUIButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        @click="commonDialogOpen = false"
        @keydown.enter="commonDialogOpen = false"
        tabindex="0"
        ref="closeBtn"
      />
    </div>
    <div
      class="custom-scroll scroll-not-hide page-commonDialog-current-commonDialog-body"
    >
      <!-- slot -->
      <slot name="body"></slot>
    </div>
  </WUIModal>
</template>
<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits()
const commonDialogOpen = computed({
  get: () => {
    // if (import.meta.client) {
    //   if (props.show) {
    //     addStyle()
    //   } else {
    //     removeStyle()
    //   }
    // }

    return props.show
  },
  set: val => {
    emits('update:show', val)
  }
})
const closeBtn = ref(null)
let lastFocusedElement = null
watch(
  () => commonDialogOpen.value,
  val => {
    if (val) {
      // 记录打开对话框前的焦点元素
      lastFocusedElement = document.activeElement
      // 打开对话框后将焦点移到关闭按钮
      nextTick(() => {
        if (closeBtn.value && closeBtn.value.$el) {
          closeBtn.value.$el.focus({
            preventScroll: true
          })
        }
      })
    } else {
      // 对话框关闭后恢复焦点
      if (lastFocusedElement && lastFocusedElement.focus) {
        lastFocusedElement.focus({
          preventScroll: true
        })
        lastFocusedElement = null
      }
    }
  }
)

// const styleId = generateRandomString(8)
// const addStyle = () => {
//   if (import.meta.client) {
//     const style = document.createElement('style')
//     style.id = styleId
//     style.innerHTML = `
//     html {
//         overflow: visible !important;
//         padding-right: 0 !important;
//       }
//     `
//     document.body.appendChild(style)
//   }
// }
// const removeStyle = () => {
//   if (import.meta.client) {
//     const style = document.getElementById(styleId)
//     if (style) {
//       document.body.removeChild(style)
//     }
//   }
// }
onUnmounted(() => {
  // removeStyle()
})
</script>
<style scoped>
.page-commonDialog-current-commonDialog-body {
  max-height: calc(100vh - 150px);
  max-height: calc(100dvh - 150px);
  min-height: 50px;
  overflow: auto;
  font-size: 14px;
  padding: 12px;
}
.page-commonDialog-current-commonDialog-title {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}
</style>
