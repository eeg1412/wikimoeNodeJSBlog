<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>引用记录列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb10">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getReferrerList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入域名关键字"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="params.referrerType"
              placeholder="请选择类型"
              style="width: 160px"
              clearable
            >
              <el-option
                v-for="(label, value) in referrerTypeMap"
                :key="value"
                :label="label"
                :value="value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getReferrerList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
        <div>
          ※如果有不想统计的来源域名可以在【设置】->【其他设置】->【引用域名白名单】中设置
        </div>
      </div>
      <div class="fr"></div>
    </div>
    <!-- 引用记录 -->
    <div class="mb20 list-table-body">
      <el-table
        ref="tableRef"
        height="100%"
        :data="referrerList"
        row-key="_id"
        border
      >
        <!-- 来源 referrer -->
        <el-table-column prop="referrer" label="来源" min-width="200">
          <template #default="{ row }">
            <div>{{ row.referrer }}</div>
          </template>
        </el-table-column>
        <!-- 来源类型 referrerType -->
        <el-table-column prop="referrerType" label="类型">
          <template #default="{ row }">
            {{ referrerTypeMap[row.referrerType] }}
          </template>
        </el-table-column>
        <!-- 日期 creatAt -->
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
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
    const referrerList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
      referrerType: ''
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getReferrerList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getReferrerList(params)
        .then(res => {
          referrerList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }
    const referrerTypeMap = {
      assets: '静态资源',
      blogApi: '博客接口',
      adminApi: '管理后台接口'
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getReferrerList()
      }
    )

    const goEdit = id => {
      router.push({
        name: 'ReferrerEdit',
        params: {
          id
        }
      })
    }
    const deleteReferrer = id => {
      ElMessageBox.confirm('确定要删除吗？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          const params = {
            id
          }
          authApi
            .deleteReferrer(params)
            .then(() => {
              ElMessage.success('删除成功')
              getReferrerList()
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
        params.referrerType = sessionParams.referrerType // 初始化筛选参数
      }
    }
    onMounted(() => {
      initParams()
      getReferrerList()
    })
    return {
      referrerList,
      params,
      total,
      tableRef,
      getReferrerList,
      referrerTypeMap,
      goEdit,
      deleteReferrer
    }
  }
}
</script>

<style lang=""></style>
