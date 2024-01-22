<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>友链列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getLinkList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入友链名称"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getLinkList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- 友链 -->
    <div class="mb20 list-table-body">
      <el-table
        :key="updateCount"
        height="100%"
        :data="linkList"
        row-key="_id"
        border
      >
        <!-- 图标 -->
        <el-table-column label="图标" width="90">
          <template #default="{ row }">
            <!-- el-image -->
            <el-image
              v-if="row.icon"
              style="width: 64px; height: 64px"
              :src="row.icon"
              fit="cover"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="sitename" label="网站名称" min-width="100px" />
        <el-table-column prop="siteurl" label="网站URL" min-width="250px" />
        <el-table-column prop="rss" label="RSS地址" min-width="250px" />
        <el-table-column prop="description" label="描述" min-width="250px" />
        <el-table-column prop="taxis" label="排序" width="100px" />
        <el-table-column prop="status" label="状态" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">显示</el-tag>
            <el-tag v-else type="danger">不显示</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteLink(row._id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="clearfix">
      <el-pagination
        class="fr"
        background
        layout="total, prev, pager, next"
        :total="total"
        :pager-count="5"
        small
        v-model:current-page="params.page"
        v-model:page-size="params.size"
      />
    </div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const linkList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const updateCount = ref(0)
    const getLinkList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getLinkList(params)
        .then((res) => {
          linkList.value = res.data.list
          total.value = res.data.total
          updateCount.value++
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'LinkAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getLinkList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'LinkEdit',
        params: {
          id,
        },
      })
    }
    const deleteLink = (id) => {
      ElMessageBox.confirm('确定要删除吗？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          const params = {
            id,
          }
          authApi
            .deleteLink(params)
            .then(() => {
              ElMessage.success('删除成功')
              getLinkList()
            })
            .catch(() => {})
        })
        .catch(() => {})
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
      getLinkList()
    })
    return {
      linkList,
      params,
      total,
      updateCount,
      getLinkList,
      handleAdd,
      goEdit,
      deleteLink,
    }
  },
}
</script>
<style lang=""></style>
