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
    <div
      class="attachment-filename pointer"
      @click="toEditName"
      :title="item.name || '未命名'"
    >
      <span>{{ item.name || '未命名' }}</span>
      <div class="attachment-filename-edit-icon">
        <el-icon><EditPen /></el-icon>
      </div>
    </div>
    <div class="attachment-selector-body pointer" @click="onSelectorClick">
      <i class="far fa-circle" v-show="!isSelected"></i>
      <i class="fas fa-check-circle" v-show="isSelected"></i>
    </div>
  </div>
  <!-- 更改名称dialog -->
  <el-dialog
    title="更改名称"
    v-model="showNameDialog"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
  >
    <div>
      <el-form
        :model="formName"
        :rules="rulesName"
        ref="formNameRef"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="媒体名称" prop="name">
          <el-input
            v-model="formName.name"
            placeholder="请输入媒体名称"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showNameDialog = false">取消</el-button>
        <el-button type="primary" @click="submitName"> 提交 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { computed, reactive, ref, watch } from 'vue'
import { authApi } from '@/api'
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
  emits: ['onSelectorClick', 'onUpdateName'],
  setup(props, { emit }) {
    const onSelectorClick = () => {
      emit('onSelectorClick', props.item)
    }

    const showNameDialog = ref(false)
    const formNameRef = ref(null)
    const formName = reactive({
      name: '',
    })
    const rulesName = reactive({
      name: [{ required: true, message: '请输入媒体名称', trigger: 'blur' }],
    })
    const submitName = () => {
      formNameRef.value.validate(async (valid) => {
        if (!valid) {
          return false
        }
        const params = {
          id: props.item._id,
          name: formName.name,
          __v: props.item.__v,
        }
        authApi.updateAttachmentName(params).then(() => {
          showNameDialog.value = false
          emit('onUpdateName', formName.name)
        })
      })
    }
    const toEditName = () => {
      formName.name = props.item.name || ''
      showNameDialog.value = true
    }
    return {
      onSelectorClick,
      showNameDialog,
      formNameRef,
      formName,
      rulesName,
      submitName,
      toEditName,
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
  padding-right: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 12px;
  color: #fff;
  z-index: 2;
}
.attachment-filename-edit-icon {
  position: absolute;
  z-index: 2;
  right: 5px;
  bottom: 3px;
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