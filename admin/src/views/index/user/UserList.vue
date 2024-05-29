<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>管理员列表</el-breadcrumb-item>
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
          @keypress.enter="getUserList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入管理员账号或昵称"
              style="width: 200px"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getUserList(true)"
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
    <!-- 管理员 -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="userList"
        row-key="_id"
        ref="tableRef"
        border
      >
        <!-- photo -->
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar
              :src="row.photo"
              shape="square"
              :size="50"
              v-if="row.photo"
            />
          </template>
        </el-table-column>
        <!-- username -->
        <el-table-column label="账号" prop="username" width="180">
          <template #default="{ row }">
            <span>{{ row.username }}</span>
            <span v-if="adminInfo.id === row._id">（我）</span>
          </template>
        </el-table-column>
        <!-- nickname -->
        <el-table-column label="昵称" prop="nickname" width="120" />
        <!-- email -->
        <el-table-column label="邮箱" prop="email" width="200" />
        <!-- role 999是站长 990是管理员-->
        <el-table-column label="角色" prop="role" width="100">
          <template #default="{ row }">
            <span v-if="row.role === 999">站长</span>
            <span v-else-if="row.role === 990">管理员</span>
          </template>
        </el-table-column>
        <!-- disabled -->
        <el-table-column label="状态" prop="disabled" width="75">
          <template #default="{ row }">
            <el-tag v-if="row.disabled" type="danger">禁用</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <!-- description -->
        <el-table-column label="描述" prop="description" min-width="200" />
        <!-- IP -->
        <el-table-column label="操作IP" prop="IP" width="350">
          <template #default="{ row }">
            <div>{{ row.IP }}</div>
            <div>
              {{ row.ipInfo?.countryLong }} {{ row.ipInfo?.city
              }}<template v-if="row.ipInfo?.region !== row.ipInfo?.city">
                {{ ' ' + row.ipInfo?.region }}</template
              >
            </div>
          </template>
        </el-table-column>
        <!-- createdAt -->
        <el-table-column label="创建时间" prop="createdAt" width="160">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="goEdit(row._id)"
              :disabled="adminInfo.id === row._id"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="deleteUser(row)"
              :disabled="adminInfo.id === row._id"
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
    <UserDeleteDialog
      v-model:show="showDeleteDialog"
      :id="deleteId"
      :username="deleteUsername"
      @deleteSuccess="getUserList(true)"
    />
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch, computed } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
import store from '@/store'
import UserDeleteDialog from '@/components/UserDeleteDialog'
export default {
  components: {
    UserDeleteDialog,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getUserList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getUserList(params)
        .then((res) => {
          userList.value = res.data.list
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
        name: 'UserAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getUserList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'UserEdit',
        params: {
          id,
        },
      })
    }

    const showDeleteDialog = ref(false)
    const deleteId = ref('')
    const deleteUsername = ref('')
    const deleteUser = (row) => {
      showDeleteDialog.value = true
      deleteId.value = row._id
      deleteUsername.value = row.username
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }

    const adminInfo = computed(() => {
      return store.getters.adminInfo
    })
    onMounted(() => {
      initParams()
      getUserList()
    })
    return {
      userList,
      params,
      total,
      tableRef,
      getUserList,
      handleAdd,
      goEdit,
      showDeleteDialog,
      deleteUser,
      adminInfo,
      deleteId,
      deleteUsername,
    }
  },
}
</script>
<style lang=""></style>
