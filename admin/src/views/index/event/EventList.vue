<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>活动列表</el-breadcrumb-item>
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
          @keypress.enter="getEventList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入活动名称"
            ></el-input>
          </el-form-item>
          <!-- 活动类型 -->
          <el-form-item>
            <el-select
              v-model="params.eventtype"
              placeholder="请选择活动类型"
              clearable
              style="width: 200px"
              multiple
              filterable
              remote
              :automatic-dropdown="true"
              :remote-method="queryEventtypeList"
              :loading="eventtypeListIsLoading"
            >
              <el-option
                v-for="item in eventtypeList"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              ></el-option>
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
            <el-button type="primary" @click="getEventList(true)"
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
    <!-- 活动 -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="eventList"
        row-key="_id"
        ref="tableRef"
        border
      >
        <el-table-column
          prop="eventtype.name"
          label="活动类型"
          min-width="160px"
        >
          <template #default="{ row }">
            <div
              :style="{ backgroundColor: row.eventtype.color }"
              class="event-list-block"
              v-if="row.eventtype"
            >
              {{ row.eventtype.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="标题"
          min-width="200px"
        ></el-table-column>
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
        <el-table-column prop="startTime" label="时间" width="320px">
          <template #default="{ row }">
            <span v-if="row.startTime || row.endTime"
              >{{ $formatDate(row.startTime) }} ~
              {{ $formatDate(row.endTime) }}</span
            >
          </template>
        </el-table-column>
        <!-- 专属颜色 -->
        <el-table-column prop="color" label="专属颜色" min-width="90px">
          <template #default="{ row }">
            <div :style="{ background: row.color }" class="event-list-block">
              {{ row.color }}
            </div>
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="120px">
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
            <el-button type="danger" size="small" @click="deleteEvent(row._id)"
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
    const eventList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getEventList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getEventList(params)
        .then((res) => {
          eventList.value = res.data.list
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
        name: 'EventAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getEventList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'EventEdit',
        params: {
          id,
        },
      })
    }
    const deleteEvent = (id) => {
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
            .deleteEvent(params)
            .then(() => {
              ElMessage.success('删除成功')
              getEventList()
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
        params.eventtype = sessionParams.eventtype
        params.status = sessionParams.status
        if (params.eventtype) {
          queryEventtypeList(null, {
            idList: params.eventtype,
            size: 999999,
          })
        }
      }
    }
    // 活动类型列表
    const eventtypeList = ref([])
    const eventtypeListIsLoading = ref(false)
    const eventtypeListTimer = null
    const queryEventtypeList = (query, options = {}) => {
      if (eventtypeListTimer) {
        clearTimeout(eventtypeListTimer)
      }
      setTimeout(() => {
        eventtypeListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50,
          ...options,
        }
        authApi
          .getEventtypeList(params, { noLoading: true })
          .then((res) => {
            eventtypeList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            eventtypeListIsLoading.value = false
          })
      }, 300)
    }
    onMounted(() => {
      initParams()
      getEventList()
    })
    return {
      eventList,
      params,
      total,
      tableRef,
      getEventList,
      handleAdd,
      goEdit,
      deleteEvent,
      eventtypeList,
      eventtypeListIsLoading,
      queryEventtypeList,
    }
  },
}
</script>
<style scoped>
.event-list-block {
  display: inline-block;
  padding: 2px 6px;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}
</style>
