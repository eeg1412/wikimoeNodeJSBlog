<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>饮品管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl"></div>
      <div class="fr">
        <el-button @click="showDefaultDialog = true">添加默认饮品</el-button>
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="drinkList"
        row-key="_id"
        border
      >
        <el-table-column prop="name" label="饮品名称" min-width="200px">
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
              @change="updateDrink(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.editing" type="primary" size="small" @click="row.editing = true">编辑</el-button>
            <el-button v-if="row.editing" type="success" size="small" @click="saveDrink(row)">保存</el-button>
            <el-button v-if="row.editing" size="small" @click="cancelEdit(row)">取消</el-button>
            <el-button type="danger" size="small" @click="deleteDrink(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加默认饮品弹窗 -->
    <el-dialog
      v-model="showDefaultDialog"
      title="选择默认饮品"
      width="60%"
      :close-on-click-modal="false"
    >
      <div class="default-items-list">
        <el-checkbox-group v-model="selectedDefaults">
          <el-row :gutter="10">
            <el-col :span="8" v-for="(item, index) in defaultDrinks" :key="index" class="mb-2">
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
    const drinkList = ref([])
    const showDefaultDialog = ref(false)
    const selectedDefaults = ref([])

    const defaultDrinks = [
      '水',
      '茶',
      '红茶',
      '绿茶',
      '咖啡',
      '奶茶',
      '可乐',
      '鲜奶',
      '豆奶',
      '果汁',
      '果味汽水',
      '苏打水',
      '运动饮料',
      '酸奶',
      '酒',
      '啤酒',
      '葡萄酒',
      '白开水',
      '矿泉水',
      '柠檬水'
    ]

    const getDrinkList = () => {
      authApi.getAlmanacDrinkList().then(res => {
        drinkList.value = res.data.list.map(item => ({
          ...item,
          editing: false,
          originalName: item.name
        }))
      })
    }

    const handleAdd = () => {
      authApi.createAlmanacDrink({ name: '新饮品' }).then(() => {
        ElMessage.success('添加成功')
        getDrinkList()
      })
    }

    const saveDrink = (row) => {
      if (!row.name.trim()) {
        ElMessage.error('饮品名称不能为空')
        return
      }
      authApi.updateAlmanacDrink({ _id: row._id, name: row.name, status: row.status }).then(() => {
        ElMessage.success('更新成功')
        row.editing = false
        row.originalName = row.name
      })
    }

    const cancelEdit = (row) => {
      row.name = row.originalName
      row.editing = false
    }

    const updateDrink = (row) => {
      authApi.updateAlmanacDrink({ _id: row._id, name: row.name, status: row.status }).then(() => {
        ElMessage.success('状态更新成功')
      })
    }

    const deleteDrink = (row) => {
      const title = escapeHtml(row.name) || '未命名'
      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除饮品：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteAlmanacDrink({ id: row._id }).then(() => {
            ElMessage.success('删除成功')
            getDrinkList()
          })
        }
      })
    }

    const addDefaultItems = () => {
      if (selectedDefaults.value.length === 0) {
        ElMessage.warning('请选择要添加的饮品')
        return
      }

      const promises = selectedDefaults.value.map(index => {
        return authApi.createAlmanacDrink({ name: defaultDrinks[index] })
      })

      Promise.all(promises).then(() => {
        ElMessage.success('添加成功')
        selectedDefaults.value = []
        showDefaultDialog.value = false
        getDrinkList()
      })
    }

    onMounted(() => {
      getDrinkList()
    })

    return {
      drinkList,
      showDefaultDialog,
      selectedDefaults,
      defaultDrinks,
      handleAdd,
      saveDrink,
      cancelEdit,
      updateDrink,
      deleteDrink,
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
