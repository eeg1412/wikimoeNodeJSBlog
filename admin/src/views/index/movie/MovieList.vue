<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>电影列表</el-breadcrumb-item>
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
          @keypress.enter="getMovieList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入关键词"
              style="width: 160px"
              clearable
            ></el-input>
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
            <el-button type="primary" @click="getMovieList(true)"
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
    <!-- 电影 -->
    <div class="mb20 list-table-body">
      <el-table
        ref="tableRef"
        height="100%"
        :data="movieList"
        row-key="_id"
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
        <!-- 观看日期 year年month月day日 -->
        <el-table-column label="观看日期" width="150px">
          <template #default="{ row }">
            <span v-if="row.year && row.month && row.day"
              >{{ row.year }}年{{ row.month }}月{{ row.day }}日</span
            >
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
        <!-- 标记 字符串数组 label -->
        <el-table-column prop="label" label="标记">
          <template #default="{ row }">
            <el-tag v-for="item in row.label" :key="item" type="success">{{
              item
            }}</el-tag>
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
            <el-button type="danger" size="small" @click="deleteMovie(row)"
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
    const movieList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
      year: null,
      season: null,
      status: null
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getMovieList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getMovieList(params)
        .then(res => {
          movieList.value = res.data.list
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
        name: 'MovieAdd'
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getMovieList()
      }
    )

    const goEdit = id => {
      router.push({
        name: 'MovieEdit',
        params: {
          id
        }
      })
    }
    const deleteMovie = row => {
      const id = row._id
      const title = escapeHtml(row.title) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除电影：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteMovie({ id }).then(() => {
            ElMessage.success('删除成功')
            getMovieList()
          })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
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
      getMovieList()
    })
    return {
      movieList,
      params,
      total,
      tableRef,
      getMovieList,
      handleAdd,
      goEdit,
      deleteMovie
    }
  }
}
</script>
<style lang=""></style>
