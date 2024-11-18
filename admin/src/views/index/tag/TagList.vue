<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>标签</el-breadcrumb-item>
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
          @keypress.enter="getTagList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入标签名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getTagList(true)">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- tags -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="tagList"
        row-key="_id"
        border
        default-expand-all
        ref="tableRef"
      >
        <el-table-column prop="tagname" label="标签名称" min-width="300">
          <template #default="{ row }">
            <div class="di">{{ row.tagname }}</div>
            <!-- 点击打开按钮 -->
            <div class="dib ml5 vt">
              <el-link type="primary" @click="goToBlog(row)"
                ><i class="fas fa-external-link-alt"></i
              ></el-link>
            </div>
            <!-- 点击复制按钮 -->
            <div class="dib ml5 vt">
              <el-link type="primary" @click="copyPage(row)"
                ><i class="far fa-clone"></i
              ></el-link>
            </div>
          </template>
        </el-table-column>
        <!-- 最后一次使用时间 -->
        <el-table-column prop="last_use_time" label="最终使用时间">
          <template #default="{ row }">
            {{ $formatDate(row.lastusetime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteTag(row)"
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
import { onMounted, reactive, ref, watch, computed } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
import store from '@/store'
import { copyToClipboard, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const tagList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getTagList = (resetPage) => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getTagList(params)
        .then((res) => {
          tagList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'TagAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getTagList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'TagEdit',
        params: {
          id,
        },
      })
    }
    const deleteTag = (row) => {
      const id = row._id
      const title = escapeHtml(row.tagname)

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除标签：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteTag({ id }).then(() => {
            ElMessage.success('删除成功')
            getTagList()
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

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const getPath = (row) => {
      if (!siteUrl.value) {
        ElMessage.error('请先设置站点地址')
        return
      }
      return `${siteUrl.value}/post/list/tag/${row._id}/1`
    }
    const goToBlog = (row) => {
      const url = getPath(row)
      window.open(url, '_blank')
    }
    const copyPage = (row) => {
      const url = getPath(row)
      copyToClipboard(url)
    }

    onMounted(() => {
      initParams()
      getTagList()
    })
    return {
      tagList,
      params,
      total,
      tableRef,
      getTagList,
      handleAdd,
      goEdit,
      deleteTag,
      goToBlog,
      copyPage,
    }
  },
}
</script>
<style lang=""></style>
