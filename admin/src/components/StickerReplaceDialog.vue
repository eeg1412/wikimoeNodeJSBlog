<template>
  <el-dialog
    v-model="dialogVisible"
    title="全局替换并删除贴纸"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
    @closed="resetData"
  >
    <el-steps :active="currentStep" finish-status="success" align-center>
      <el-step title="确认源贴纸" />
      <el-step title="选择目标贴纸" />
      <el-step title="确认执行" />
    </el-steps>

    <div class="replace-sticker-body">
      <template v-if="currentStep === 0">
        <el-alert
          type="warning"
          :closable="false"
          class="mb15"
          description="如果这张贴纸已经被评论引用，替换完成前它会先保持隐藏状态，避免新的评论继续选中它。"
        ></el-alert>
        <div class="replace-sticker-section">
          <div class="replace-sticker-label">即将删除的贴纸</div>
          <div class="replace-sticker-card" v-if="fromSticker">
            <img :src="fromSticker.image" class="replace-sticker-img" />
            <div class="replace-sticker-meta">
              <div class="replace-sticker-desc">
                {{ fromSticker.description }}
              </div>
              <div class="replace-sticker-tip">
                替换完成后，这张贴纸会被删除。
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="currentStep === 1">
        <el-alert
          type="info"
          :closable="false"
          class="mb15"
          description="请选择一张新的可见贴纸，用来替换所有引用了当前贴纸的评论。"
        ></el-alert>
        <div class="replace-sticker-toolbar">
          <AdminStickerPicker
            buttonText="选择目标贴纸"
            :maxCount="0"
            :currentCount="0"
            :selectedIds="toSticker ? [toSticker._id] : []"
            @stickerClick="handleTargetSelect"
          />
        </div>
        <div class="replace-sticker-card" v-if="toSticker">
          <img :src="toSticker.image" class="replace-sticker-img" />
          <div class="replace-sticker-meta">
            <div class="replace-sticker-desc">{{ toSticker.description }}</div>
            <div class="replace-sticker-tip">
              后续所有引用都会改成这张贴纸。
            </div>
          </div>
        </div>
        <el-empty description="尚未选择目标贴纸" v-else></el-empty>
      </template>

      <template v-else>
        <el-alert
          type="error"
          :closable="false"
          class="mb15"
          description="确认后会批量替换所有评论中的旧贴纸，并删除旧贴纸文件。该操作不可撤销。"
        ></el-alert>
        <div class="replace-sticker-confirm-grid">
          <div class="replace-sticker-confirm-item">
            <div class="replace-sticker-label">源贴纸</div>
            <div class="replace-sticker-card" v-if="fromSticker">
              <img :src="fromSticker.image" class="replace-sticker-img" />
              <div class="replace-sticker-meta">
                <div class="replace-sticker-desc">
                  {{ fromSticker.description }}
                </div>
              </div>
            </div>
          </div>
          <div class="replace-sticker-confirm-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
          <div class="replace-sticker-confirm-item">
            <div class="replace-sticker-label">目标贴纸</div>
            <div class="replace-sticker-card" v-if="toSticker">
              <img :src="toSticker.image" class="replace-sticker-img" />
              <div class="replace-sticker-meta">
                <div class="replace-sticker-desc">
                  {{ toSticker.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <el-button v-if="currentStep > 0" @click="currentStep -= 1"
        >上一步</el-button
      >
      <el-button
        v-if="currentStep < 2"
        type="primary"
        :disabled="currentStep === 1 && !toSticker"
        @click="currentStep += 1"
      >
        下一步
      </el-button>
      <el-button
        v-else
        type="danger"
        :loading="submitting"
        @click="handleReplace"
      >
        确认替换并删除
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api'
import AdminStickerPicker from './AdminStickerPicker.vue'

export default {
  name: 'StickerReplaceDialog',
  components: {
    AdminStickerPicker
  },
  emits: ['done'],
  setup(props, { emit }) {
    const dialogVisible = ref(false)
    const currentStep = ref(0)
    const submitting = ref(false)
    const fromSticker = ref(null)
    const toSticker = ref(null)

    const open = sticker => {
      fromSticker.value = sticker
      toSticker.value = null
      currentStep.value = 0
      dialogVisible.value = true
    }

    const handleTargetSelect = sticker => {
      if (fromSticker.value && sticker._id === fromSticker.value._id) {
        return
      }
      toSticker.value = sticker
    }

    const handleReplace = async () => {
      if (!fromSticker.value || !toSticker.value) {
        return
      }
      submitting.value = true
      try {
        const res = await authApi.replaceAndDeleteSticker({
          fromStickerId: fromSticker.value._id,
          toStickerId: toSticker.value._id
        })
        ElMessage.success(res.data.data.message || '替换完成')
        dialogVisible.value = false
        emit('done')
      } catch (err) {
        // error handled by interceptor
      } finally {
        submitting.value = false
      }
    }

    const resetData = () => {
      currentStep.value = 0
      submitting.value = false
      fromSticker.value = null
      toSticker.value = null
    }

    return {
      dialogVisible,
      currentStep,
      submitting,
      fromSticker,
      toSticker,
      open,
      handleTargetSelect,
      handleReplace,
      resetData
    }
  }
}
</script>

<style scoped>
.replace-sticker-body {
  margin-top: 24px;
}

.replace-sticker-section {
  margin-bottom: 12px;
}

.replace-sticker-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
}

.replace-sticker-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 14px;
  background: var(--el-fill-color-light);
}

.replace-sticker-img {
  width: 72px;
  height: 72px;
  object-fit: contain;
  flex-shrink: 0;
}

.replace-sticker-meta {
  min-width: 0;
}

.replace-sticker-desc {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.replace-sticker-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.replace-sticker-toolbar {
  margin-bottom: 16px;
}

.replace-sticker-confirm-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.replace-sticker-confirm-arrow {
  font-size: 18px;
  color: var(--el-text-color-secondary);
  padding-top: 22px;
}

@media (max-width: 767px) {
  .replace-sticker-confirm-grid {
    grid-template-columns: 1fr;
  }

  .replace-sticker-confirm-arrow {
    text-align: center;
    padding-top: 0;
    transform: rotate(90deg);
  }
}
</style>
