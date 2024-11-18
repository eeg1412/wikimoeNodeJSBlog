<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>导航列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- 导航 -->
    <div class="mb20 list-table-body no-page">
      <el-table
        height="100%"
        :data="naviList"
        row-key="_id"
        border
        default-expand-all
      >
        <el-table-column prop="naviname" label="导航名称" min-width="150px" />
        <el-table-column prop="url" label="导航URL" min-width="250px" />
        <el-table-column prop="newtab" label="新标签打开" width="110px">
          <template #default="{ row }">
            <el-tag v-if="row.newtab" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90px">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">显示</el-tag>
            <el-tag v-else type="danger">不显示</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="taxis" label="排序" width="80px" />

        <el-table-column prop="isdefault" label="本站链接" width="110px">
          <template #default="{ row }">
            <el-tag v-if="row.isdefault" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="query" label="参数" min-width="150px" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteNavi(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const naviList = ref([])
    const params = reactive({})
    const total = ref(0)
    const getNaviList = () => {
      authApi
        .getNaviList(params)
        .then((res) => {
          naviList.value = res.data.data
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'NaviAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getNaviList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'NaviEdit',
        params: {
          id,
        },
      })
    }
    const deleteNavi = (row) => {
      const id = row._id
      const title = escapeHtml(row.naviname)

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除导航项：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteNavi({ id }).then(() => {
            ElMessage.success('删除成功')
            getNaviList()
          })
        },
      })
        .then(() => {})
        .catch((error) => {
          console.log('Dialog closed:', error)
        })
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }
    onMounted(() => {
      initParams()
      getNaviList()
    })
    return {
      naviList,
      params,
      total,
      getNaviList,
      handleAdd,
      goEdit,
      deleteNavi,
    }
  },
}
</script>
<style lang=""></style>
