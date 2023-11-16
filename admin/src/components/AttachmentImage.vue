<template>
  <div class="attachment-image-body">
    <div class="attachment-image-content">
      <el-image
        :src="item.thumfor || item.filepath"
        fit="cover"
        loading="lazy"
        :preview-src-list="[item.filepath]"
        :preview-teleported="true"
        style="width: 100%; height: 100%"
      />
    </div>
    <div class="attachment-filename">{{ item.name || '未命名' }}</div>
    <div class="attachment-selector-body pointer" @click="onSelectorClick">
      <i class="far fa-circle" v-show="!isSelected"></i>
      <i class="fas fa-check-circle" v-show="isSelected"></i>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      },
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onSelectorClick'],
  setup(props, { emit }) {
    const onSelectorClick = () => {
      emit('onSelectorClick', props.item)
    }
    return {
      onSelectorClick,
    }
  },
}
</script>
<style scoped>
.attachment-image-body {
  /* padding 正方形 */
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.attachment-image-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
.attachment-filename {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 12px;
  color: #fff;
  z-index: 2;
}
.attachment-selector-body {
  /* 左上角 */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  font-size: 18px;
  line-height: 18px;
  padding: 5px;
  color: #fff;
  text-shadow: 0 0 5px #000;
}
.attachment-selector-body .fa-check-circle {
  /* 绿色 */
  color: #67c23a;
}
</style>
