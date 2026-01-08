<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>工具管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl"></div>
      <div class="fr">
        <el-button @click="showDefaultDialog = true">添加默认工具</el-button>
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="toolList"
        row-key="_id"
        border
      >
        <el-table-column prop="name" label="工具名称" min-width="200px">
          <template #default="{ row }">
            <el-input v-if="row.editing" v-model="row.name" />
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100px">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="updateTool(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.editing" type="primary" size="small" @click="row.editing = true">编辑</el-button>
            <el-button v-if="row.editing" type="success" size="small" @click="saveTool(row)">保存</el-button>
            <el-button v-if="row.editing" size="small" @click="cancelEdit(row)">取消</el-button>
            <el-button type="danger" size="small" @click="deleteTool(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加默认工具弹窗 -->
    <el-dialog
      v-model="showDefaultDialog"
      title="选择默认工具"
      width="60%"
      :close-on-click-modal="false"
    >
      <div class="default-items-list">
        <el-checkbox-group v-model="selectedDefaults">
          <el-row :gutter="10">
            <el-col :span="8" v-for="(item, index) in defaultTools" :key="index" class="mb-2">
              <el-checkbox :label="index">{{ item }}</el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showDefaultDialog = false">取消</el-button>
        <el-button type="primary" @click="addDefaultItems">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const toolList = ref([])
    const showDefaultDialog = ref(false)
    const selectedDefaults = ref([])

    const defaultTools = [
      'Eclipse写程序',
      'MSOffice写文档',
      '记事本写程序',
      'Windows8',
      'Linux',
      'MacOS',
      'IE',
      'Android设备',
      'iOS设备',
      'VS Code',
      'IntelliJ IDEA',
      'Sublime Text',
      'Vim',
      'Emacs',
      'Visual Studio',
      'Xcode',
      'Chrome',
      'Firefox',
      'Safari'
    ]

    const getToolList = () => {
      authApi.getAlmanacToolList().then(res => {
        toolList.value = res.data.list.map(item => ({
          ...item,
          editing: false,
          originalName: item.name
        }))
      })
    }

    const handleAdd = () => {
      authApi.createAlmanacTool({ name: '新工具' }).then(() => {
        ElMessage.success('添加成功')
        getToolList()
      })
    }

    const saveTool = (row) => {
      if (!row.name.trim()) {
        ElMessage.error('工具名称不能为空')
        return
      }
      authApi.updateAlmanacTool({ _id: row._id, name: row.name, status: row.status }).then(() => {
        ElMessage.success('更新成功')
        row.editing = false
        row.originalName = row.name
      })
    }

    const cancelEdit = (row) => {
      row.name = row.originalName
      row.editing = false
    }

    const updateTool = (row) => {
      authApi.updateAlmanacTool({ _id: row._id, name: row.name, status: row.status }).then(() => {
        ElMessage.success('状态更新成功')
      })
    }

    const deleteTool = (row) => {
      const title = escapeHtml(row.name) || '未命名'
      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除工具：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteAlmanacTool({ id: row._id }).then(() => {
            ElMessage.success('删除成功')
            getToolList()
          })
        }
      })
    }

    const addDefaultItems = () => {
      if (selectedDefaults.value.length === 0) {
        ElMessage.warning('请选择要添加的工具')
        return
      }

      const promises = selectedDefaults.value.map(index => {
        return authApi.createAlmanacTool({ name: defaultTools[index] })
      })

      Promise.all(promises).then(() => {
        ElMessage.success('添加成功')
        selectedDefaults.value = []
        showDefaultDialog.value = false
        getToolList()
      })
    }

    onMounted(() => {
      getToolList()
    })

    return {
      toolList,
      showDefaultDialog,
      selectedDefaults,
      defaultTools,
      handleAdd,
      saveTool,
      cancelEdit,
      updateTool,
      deleteTool,
      addDefaultItems
    }
  }
}
</script>
<style scoped>
.default-items-list {
  max-height: 400px;
  overflow-y: auto;
}
.mb-2 {
  margin-bottom: 8px;
}
</style>
