<template>
  <div>
    <div>
      <el-switch
        :model-value="isRichMode"
        active-text="富文本模式"
        inactive-text="HTML模式"
        @change="changeMode"
      />
    </div>
    <div v-if="isRichMode">
      <RichEditor5 v-model:content="valueHtml" />
    </div>
    <div v-else>
      <el-input
        type="textarea"
        :rows="10"
        v-model="valueHtml"
        placeholder="请输入HTML代码"
      />
    </div>
  </div>
</template>
<script>
import { ref, computed, emit } from 'vue'
import RichEditor5 from '@/components/RichEditor5'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  props: {
    content: {
      type: String,
      default: ''
    },
    isRichMode: {
      type: Boolean,
      default: true
    }
  },
  components: {
    RichEditor5
  },
  setup(props, { emit }) {
    const changeMode = val => {
      if (val) {
        ElMessageBox.confirm(
          '自定义HTML可能会导致富文本编辑器出错或者内容丢失，如果是自定义HTML内容，请清空内容！',
          '提示',
          {
            confirmButtonText: '清空',
            cancelButtonText: '保留',
            type: 'warning',
            distinguishCancelAndClose: true
          }
        )
          .then(() => {
            emit('update:content', '')
            emit('update:isRichMode', val)
          })
          .catch(action => {
            if (action === 'cancel') {
              emit('update:isRichMode', val)
            }
          })
      } else {
        emit('update:isRichMode', val)
      }
    }
    const valueHtml = computed({
      get() {
        return props.content
      },
      set(val) {
        emit('update:content', val)
      }
    })
    return {
      changeMode,
      valueHtml
    }
  }
}
</script>
<style scoped></style>
