<template>
  <div class="common-right-panel-form">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>贴纸管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="mt20 mb20 clearfix">
      <div class="fr">
        <el-button type="primary" @click="showCreateDialog">
          新建贴纸组
        </el-button>
      </div>
    </div>

    <!-- 贴纸组卡片 -->
    <div class="sticker-group-grid" v-if="groupList.length > 0">
      <div
        class="sticker-group-card"
        v-for="item in groupList"
        :key="item._id"
        @click="goToDetail(item._id)"
      >
        <div class="sticker-group-card-cover">
          <img
            v-if="item.coverSticker"
            :src="item.coverSticker.image"
            :alt="item.name"
            class="sticker-group-card-img"
          />
          <div v-else class="sticker-group-card-empty">
            <i class="fas fa-sticky-note"></i>
          </div>
        </div>
        <div class="sticker-group-card-info">
          <div class="sticker-group-card-name" :title="item.name">
            {{ item.name }}
          </div>
          <div class="sticker-group-card-meta">
            <span class="ml5 f12 text-gray">{{ item.stickerCount }}张</span>
            <el-switch
              :model-value="item.status === 1"
              :loading="groupStatusLoadingMap[item._id] === true"
              size="small"
              inline-prompt
              active-text="显"
              inactive-text="隐"
              @click.stop
              @change="value => handleGroupStatusChange(item, value)"
            ></el-switch>
          </div>
          <div class="sticker-group-card-actions">
            <el-button
              type="danger"
              size="small"
              @click.stop="handleDeleteGroup(item)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <el-empty description="暂无贴纸组" v-else></el-empty>

    <!-- 新建贴纸组弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建贴纸组"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="createForm"
        :rules="createRules"
        ref="createFormRef"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="请输入贴纸组名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="taxis">
          <el-input-number
            v-model="createForm.taxis"
            :min="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="显示" prop="status">
          <el-switch
            v-model="createForm.statusBool"
            active-text="显示"
            inactive-text="隐藏"
          ></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
import CheckDialogService from '@/services/CheckDialogService'
import { escapeHtml } from '@/utils/utils'

export default {
  name: 'StickerGroupList',
  setup() {
    const router = useRouter()
    const groupList = ref([])
    const groupStatusLoadingMap = reactive({})
    const createDialogVisible = ref(false)
    const createFormRef = ref(null)
    const createForm = reactive({
      name: '',
      taxis: 0,
      statusBool: false
    })
    const createRules = {
      name: [{ required: true, message: '请输入贴纸组名称', trigger: 'blur' }]
    }

    const getList = () => {
      authApi.getStickerGroupList().then(res => {
        groupList.value = res.data.list
      })
    }

    const showCreateDialog = () => {
      createForm.name = ''
      createForm.taxis = 0
      createForm.statusBool = false
      createDialogVisible.value = true
    }

    const handleCreate = () => {
      createFormRef.value.validate(valid => {
        if (!valid) return
        authApi
          .createStickerGroup({
            name: createForm.name,
            taxis: createForm.taxis,
            status: createForm.statusBool ? 1 : 0
          })
          .then(() => {
            ElMessage.success('创建成功')
            createDialogVisible.value = false
            getList()
          })
      })
    }

    const goToDetail = id => {
      router.push({ name: 'StickerGroupEdit', params: { id } })
    }

    const handleGroupStatusChange = (item, value) => {
      const id = item._id
      if (groupStatusLoadingMap[id]) {
        return
      }
      groupStatusLoadingMap[id] = true
      authApi
        .updateStickerGroup({
          id: item._id,
          __v: item.__v,
          name: item.name,
          taxis: item.taxis,
          status: value ? 1 : 0
        })
        .then(() => {
          item.status = value ? 1 : 0
          item.__v += 1
          ElMessage.success(`贴纸组已${value ? '显示' : '隐藏'}`)
        })
        .catch(() => {})
        .finally(() => {
          groupStatusLoadingMap[id] = false
        })
    }

    const handleDeleteGroup = item => {
      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除贴纸组：【${escapeHtml(item.name || '')}】</span>及其所有贴纸文件，是否继续?`,
        success: () => {
          return authApi.deleteStickerGroup({ id: item._id }).then(() => {
            ElMessage.success('删除成功')
            getList()
          })
        }
      })
        .then(() => {})
        .catch(() => {})
    }

    onMounted(() => {
      getList()
    })

    return {
      groupList,
      createDialogVisible,
      createFormRef,
      createForm,
      createRules,
      showCreateDialog,
      handleCreate,
      groupStatusLoadingMap,
      handleGroupStatusChange,
      handleDeleteGroup,
      goToDetail
    }
  }
}
</script>

<style scoped>
.sticker-group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
.sticker-group-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--el-bg-color);
}
.sticker-group-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
.sticker-group-card-cover {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
}
.sticker-group-card-img {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
}
.sticker-group-card-empty {
  font-size: 36px;
  color: var(--el-text-color-placeholder);
}
.sticker-group-card-info {
  padding: 10px;
}
.sticker-group-card-name {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}
.sticker-group-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sticker-group-card-actions {
  margin-top: 6px;
  display: flex;
  justify-content: flex-end;
}

.text-gray {
  color: var(--el-text-color-secondary);
}
</style>
