<template>
  <div class="vote-option">
    <el-tag v-if="option" type="primary">{{ option.title }}</el-tag>
    <el-tag v-else type="danger">选项已删除</el-tag>
  </div>
</template>
<script>
import { computed } from 'vue'

export default {
  props: {
    vote: {
      type: Object,
      required: true
    },
    optionId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const option = computed(() => {
      return props.vote.options.find(option => option._id === props.optionId)
    })
    return {
      option
    }
  }
}
</script>
<style scoped>
.vote-option {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
