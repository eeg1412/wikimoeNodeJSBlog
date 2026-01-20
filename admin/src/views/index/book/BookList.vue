<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>书籍列表</el-breadcrumb-item>
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
          @keypress.enter="getBookList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入关键词"
              clearable
            ></el-input>
          </el-form-item>
          <!-- 书籍类型 -->
          <el-form-item>
            <el-select
              v-model="params.booktype"
              placeholder="请选择书籍类型"
              clearable
              style="width: 200px"
              multiple
              filterable
              remote
              :automatic-dropdown="true"
              :remote-method="queryBooktypeList"
              :loading="booktypeListIsLoading"
            >
              <el-option
                v-for="item in booktypeList"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 阅读状态 -->
          <el-form-item>
            <el-select
              v-model="params.readStatus"
              placeholder="请选择阅读状态"
              style="width: 150px"
              clearable
            >
              <el-option
                v-for="item in readStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <!-- 状态 0不显示 1显示 -->
          <el-form-item>
            <el-select
              v-model="params.status"
              placeholder="请选择显示状态"
              style="width: 150px"
              clearable
            >
              <el-option label="显示" :value="1"></el-option>
              <el-option label="不显示" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getBookList(true)"
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
    <!-- 书籍 -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="bookList"
        row-key="_id"
        ref="tableRef"
        border
      >
        <!-- 封面 cover -->
        <el-table-column label="封面" width="90">
          <template #default="{ row }">
            <!-- el-image -->
            <el-image
              v-if="row.cover"
              style="width: 64px; height: 64px"
              :src="row.cover"
              fit="contain"
              :preview-src-list="[row.cover]"
              :preview-teleported="true"
            ></el-image>
          </template>
        </el-table-column>
        <!-- 标题 title -->
        <el-table-column prop="title" label="标题" min-width="200px" />
        <!-- 类型 -->
        <el-table-column label="类型" width="100px">
          <template #default="{ row }">
            <div
              :style="{ backgroundColor: row.booktype.color }"
              class="book-platform-block"
              v-if="row.booktype"
            >
              {{ row.booktype.name }}
            </div>
          </template>
        </el-table-column>
        <!-- 介绍文/简评 -->
        <el-table-column prop="summary" label="介绍文/简评" min-width="250px">
          <template #default="{ row }">
            <div :title="row.summary" class="pre-wrap">
              {{ $limitStr(row.summary, 50) }}
            </div>
          </template>
        </el-table-column>
        <!-- 评分 rating -->
        <el-table-column prop="rating" label="评分" width="60px" />
        <!-- 标记 字符串数组 label -->
        <el-table-column prop="label" label="标记" min-width="140px">
          <template #default="{ row }">
            <div class="list-table-label">
              <el-tag v-for="item in row.label" :key="item" type="success">{{
                item
              }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <!-- urlList 附加链接列表 -->
        <el-table-column prop="urlList" label="附加链接" min-width="150px">
          <template #default="{ row }">
            <div v-for="(item, index) in row.urlList" :key="index">
              <el-link
                :href="item.url"
                target="_blank"
                type="primary"
                :underline="false"
                >{{ item.text }}</el-link
              >
            </div>
          </template>
        </el-table-column>
        <!-- 书籍时间 -->
        <el-table-column label="阅读时间" width="320px">
          <template #default="{ row }">
            <span v-if="row.startTime || row.endTime"
              >{{ $formatDate(row.startTime) }} ~
              {{ $formatDate(row.endTime) }}</span
            >
          </template>
        </el-table-column>
        <!-- giveUp 已弃坑 -->
        <el-table-column label="弃坑" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.giveUp" type="danger">已弃坑</el-tag>
          </template>
        </el-table-column>
        <!-- 文章统计 -->
        <el-table-column label="相关文章数" width="120px">
          <template #default="{ row }">
            <div v-if="row.totalNormalPostCount !== undefined">
              <div>总计: {{ row.totalNormalPostCount }}</div>
              <div>公开: {{ row.publicNormalPostCount }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="推文内容数" width="120px">
          <template #default="{ row }">
            <div v-if="row.totalContentPostCount !== undefined">
              <div>总计: {{ row.totalContentPostCount }}</div>
              <div>公开: {{ row.publicContentPostCount }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- postLinkOpen 是否开启文章链接 -->
        <el-table-column prop="postLinkOpen" label="文章链接开关" width="120px">
          <template #default="{ row }">
            <el-switch
              v-model="row.postLinkOpen"
              :loading="loadingMap[row._id]"
              :before-change="() => updatePostLinkOpen(row)"
            ></el-switch>
          </template>
        </el-table-column>
        <!-- 状态 -->
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
            <el-button type="danger" size="small" @click="deleteBook(row)"
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
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const bookList = ref([])
    const loadingMap = reactive({})
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
      shouldCount: '1',
      booktype: '',
      status: '',
      readStatus: null
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getBookList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getBookList(params)
        .then(res => {
          bookList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'BookAdd'
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getBookList()
      }
    )

    const goEdit = id => {
      router.push({
        name: 'BookEdit',
        params: {
          id
        }
      })
    }
    const deleteBook = row => {
      const id = row._id
      const title = escapeHtml(row.title) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除书籍：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteBook({ id }).then(() => {
            ElMessage.success('删除成功')
            getBookList()
          })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
        })
    }

    const updatePostLinkOpen = row => {
      const id = row._id
      const postLinkOpen = !row.postLinkOpen
      loadingMap[id] = true
      return authApi
        .updateBookPostLinkOpen({ id, postLinkOpen })
        .then(() => {
          ElMessage.success('更新成功')
          return true
        })
        .catch(err => {
          console.log(err)
          return false
        })
        .finally(() => {
          loadingMap[id] = false
        })
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
        params.booktype = sessionParams.booktype
        params.status = sessionParams.status
        params.readStatus = sessionParams.readStatus
        if (params.booktype) {
          queryBooktypeList(null, {
            idList: params.booktype,
            size: 999999
          })
        }
      }
    }

    // 书籍类型列表
    const booktypeList = ref([])
    const booktypeListIsLoading = ref(false)
    const booktypeListTimer = null
    const queryBooktypeList = (query, options = {}) => {
      if (booktypeListTimer) {
        clearTimeout(booktypeListTimer)
      }
      setTimeout(() => {
        booktypeListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50,
          ...options
        }
        authApi
          .getBooktypeList(params, { noLoading: true })
          .then(res => {
            booktypeList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            booktypeListIsLoading.value = false
          })
      }, 300)
    }

    // 阅读状态
    const readStatusList = [
      // 1 尚未阅读
      {
        label: '尚未阅读',
        value: 1
      },
      {
        label: '阅读中',
        value: 2
      },
      // 2已读完
      {
        label: '已读完',
        value: 3
      },
      {
        label: '弃坑',
        value: 99
      }
    ]
    onMounted(() => {
      initParams()
      getBookList()
    })
    return {
      bookList,
      loadingMap,
      params,
      total,
      tableRef,
      getBookList,
      handleAdd,
      goEdit,
      deleteBook,
      updatePostLinkOpen,
      booktypeList,
      booktypeListIsLoading,
      queryBooktypeList,
      readStatusList
    }
  }
}
</script>
<style scoped>
.book-platform-block {
  display: inline-block;
  padding: 2px 6px;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}
</style>
