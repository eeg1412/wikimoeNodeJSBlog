<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>番剧列表</el-breadcrumb-item>
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
          @keypress.enter="getBangumiList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入关键词"
              style="width: 160px"
              clearable
            ></el-input>
          </el-form-item>
          <!-- 数字 年份输入框 -->
          <el-form-item>
            <el-input-number
              v-model="params.year"
              :precision="0"
              :min="1"
              placeholder="请输入年份"
              style="width: 160px"
            ></el-input-number>
          </el-form-item>
          <!-- 季度 选择器 1 2 3 4 -->
          <el-form-item>
            <el-select
              v-model="params.season"
              placeholder="请选择季度"
              clearable
            >
              <el-option label="冬季新番" :value="1"></el-option>
              <el-option label="春季新番" :value="2"></el-option>
              <el-option label="夏季新番" :value="3"></el-option>
              <el-option label="秋季新番" :value="4"></el-option>
            </el-select>
          </el-form-item>
          <!-- 状态 0不显示 1显示 -->
          <el-form-item>
            <el-select
              v-model="params.status"
              placeholder="请选择状态"
              style="width: 100px"
              clearable
            >
              <el-option label="显示" :value="1"></el-option>
              <el-option label="不显示" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getBangumiList(true)"
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
    <!-- 番剧 -->
    <div class="mb20 list-table-body">
      <ResponsiveTable
        ref="tableRef"
        height="100%"
        :data="bangumiList"
        row-key="_id"
        border
      >
        <!-- 封面 cover -->
        <ResponsiveTableColumn label="封面" width="90">
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
        </ResponsiveTableColumn>
        <!-- 标题 title -->
        <ResponsiveTableColumn prop="title" label="标题" min-width="200px" />
        <!-- 介绍文/简评 -->
        <ResponsiveTableColumn
          prop="summary"
          label="介绍文/简评"
          min-width="250px"
        >
          <template #default="{ row }">
            <div :title="row.summary" class="pre-wrap">
              {{ $limitStr(row.summary, 50) }}
            </div>
          </template>
        </ResponsiveTableColumn>
        <!-- 评分 rating -->
        <ResponsiveTableColumn prop="rating" label="评分" width="60px" />
        <!-- 年份 year -->
        <ResponsiveTableColumn prop="year" label="年份" width="60px" />
        <!-- 季度 season -->
        <ResponsiveTableColumn prop="season" label="季度" width="110px">
          <!-- 1冬季新番 2春季新番 3夏季新番 4秋季新番 -->
          <template #default="{ row }">
            <span v-if="row.season === 1">冬季新番</span>
            <span v-else-if="row.season === 2">春季新番</span>
            <span v-else-if="row.season === 3">夏季新番</span>
            <span v-else-if="row.season === 4">秋季新番</span>
          </template>
        </ResponsiveTableColumn>
        <!-- urlList 附加链接列表 -->
        <ResponsiveTableColumn
          prop="urlList"
          label="附加链接"
          min-width="150px"
        >
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
        </ResponsiveTableColumn>
        <!-- 标记 字符串数组 label -->
        <ResponsiveTableColumn prop="label" label="标记">
          <template #default="{ row }">
            <div class="list-table-label">
              <el-tag v-for="item in row.label" :key="item" type="success">{{
                item
              }}</el-tag>
            </div>
          </template>
        </ResponsiveTableColumn>
        <!-- giveUp 已弃坑 -->
        <ResponsiveTableColumn label="弃坑" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.giveUp" type="danger">已弃坑</el-tag>
          </template>
        </ResponsiveTableColumn>
        <!-- 文章统计 -->
        <ResponsiveTableColumn label="相关文章数" width="120px">
          <template #default="{ row }">
            <div v-if="row.totalNormalPostCount !== undefined">
              <div>总计: {{ row.totalNormalPostCount }}</div>
              <div>公开: {{ row.publicNormalPostCount }}</div>
            </div>
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn label="推文内容数" width="120px">
          <template #default="{ row }">
            <div v-if="row.totalContentPostCount !== undefined">
              <div>总计: {{ row.totalContentPostCount }}</div>
              <div>公开: {{ row.publicContentPostCount }}</div>
            </div>
          </template>
        </ResponsiveTableColumn>
        <!-- postLinkOpen 是否开启文章链接 -->
        <ResponsiveTableColumn
          prop="postLinkOpen"
          label="文章链接开关"
          width="120px"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.postLinkOpen"
              :loading="loadingMap[row._id]"
              :before-change="() => updatePostLinkOpen(row)"
            ></el-switch>
          </template>
        </ResponsiveTableColumn>
        <!-- 状态 -->
        <ResponsiveTableColumn prop="status" label="状态" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">显示</el-tag>
            <el-tag v-else type="danger">不显示</el-tag>
          </template>
        </ResponsiveTableColumn>

        <ResponsiveTableColumn label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteBangumi(row)"
              >删除</el-button
            >
          </template>
        </ResponsiveTableColumn>
      </ResponsiveTable>
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
    const bangumiList = ref([])
    const loadingMap = reactive({})
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
      shouldCount: '1',
      year: null,
      season: null,
      status: null
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getBangumiList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getBangumiList(params)
        .then(res => {
          bangumiList.value = res.data.list
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
        name: 'BangumiAdd'
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getBangumiList()
      }
    )

    const goEdit = id => {
      router.push({
        name: 'BangumiEdit',
        params: {
          id
        }
      })
    }
    const deleteBangumi = row => {
      const id = row._id
      const title = escapeHtml(row.title) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除番剧：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteBangumi({ id }).then(() => {
            ElMessage.success('删除成功')
            getBangumiList()
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
        .updateBangumiPostLinkOpen({ id, postLinkOpen })
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
        params.year = sessionParams.year
        params.season = sessionParams.season
        params.status = sessionParams.status
      }
    }
    onMounted(() => {
      initParams()
      getBangumiList()
    })
    return {
      bangumiList,
      loadingMap,
      params,
      total,
      tableRef,
      getBangumiList,
      handleAdd,
      goEdit,
      deleteBangumi,
      updatePostLinkOpen
    }
  }
}
</script>
<style lang=""></style>
