<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>用户登录日志列表</el-breadcrumb-item>
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
          @keypress.enter="getUserLoginLogList(true)"
        >
          <!-- username -->
          <el-form-item>
            <el-input
              v-model="params.username"
              clearable
              placeholder="请输入用户名"
            ></el-input>
          </el-form-item>
          <!-- ip -->
          <el-form-item>
            <el-input
              v-model="params.ip"
              clearable
              placeholder="请输入ip"
            ></el-input>
          </el-form-item>
          <!-- success true false -->
          <el-form-item>
            <el-select
              v-model="params.success"
              placeholder="登录状态"
              clearable
            >
              <el-option label="成功" value="1"></el-option>
              <el-option label="失败" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getUserLoginLogList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 删除 -->
        <el-button type="danger" class="ml5" @click="openDeleteDialog"
          >删除</el-button
        >
      </div>
    </div>
    <!-- 用户登录日志 -->
    <div class="mb20 list-table-body">
      <ResponsiveTable
        ref="tableRef"
        height="100%"
        :data="userLoginLogList"
        row-key="_id"
        border
      >
        <!-- username -->
        <ResponsiveTableColumn prop="username" label="用户名" width="150">
          <template #default="{ row }">
            <div>{{ row.username }}</div>
          </template>
        </ResponsiveTableColumn>
        <!-- 登录状态 success -->
        <ResponsiveTableColumn prop="success" label="登录状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'">
              {{ row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </ResponsiveTableColumn>
        <!-- 消息 msg -->
        <ResponsiveTableColumn prop="msg" label="消息" min-width="200">
          <template #default="{ row }">
            {{ row.msg }}
          </template>
        </ResponsiveTableColumn>
        <!-- IP信息 -->
        <ResponsiveTableColumn prop="ip" label="IP信息" width="350">
          <template #default="{ row }">
            <div v-if="row.ip">
              <div class="di">{{ row.ip }}</div>
              <div class="dib ml5 vt">
                <el-link
                  type="primary"
                  @click="addParamsAndSearch('ip', row.ip)"
                  ><i class="fa fa-search"></i
                ></el-link>
              </div>
              <!-- 点击复制按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="copyToClipboard(row.ip)"
                  ><i class="far fa-clone"></i
                ></el-link>
              </div>
            </div>
            <IpInfoDisplay :ipInfo="row.ipInfo" />
          </template>
        </ResponsiveTableColumn>
        <!-- UA信息 -->
        <ResponsiveTableColumn label="UA信息" width="210">
          <template #default="{ row }">
            <div>系统：{{ row.deviceInfo?.os?.name }}</div>
            <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
            <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
            <div>浏览器版本号： {{ row.deviceInfo?.browser?.version }}</div>

            <!-- ua -->
            <div>UA：{{ row.deviceInfo?.ua }}</div>
          </template>
        </ResponsiveTableColumn>
        <!-- date -->
        <ResponsiveTableColumn prop="date" label="时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
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
    <!-- 删除弹窗 里面填写开始结束时间 -->
    <el-dialog
      title="删除"
      v-model="deleteDialogVisible"
      align-center
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="deleteForm" :rules="deleteRules" ref="deleteDialogRef">
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="deleteForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="deleteForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
          ></el-date-picker>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="deletelog">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import {
  setSessionParams,
  getSessionParams,
  copyToClipboard,
  formatDate
} from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'
import IpInfoDisplay from '@/components/IpInfoDisplay.vue'

export default {
  components: {
    IpInfoDisplay
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const userLoginLogList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      username: '',
      ip: '',
      success: null
    })
    const total = ref(0)
    const tableRef = ref(null)

    const getUserLoginLogList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getUserLoginLogList(params)
        .then(res => {
          const list = res.data.list
          userLoginLogList.value = list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }

    const addParamsAndSearch = (key, value) => {
      params[key] = value
      getUserLoginLogList(true)
    }

    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getUserLoginLogList()
      }
    )

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.username = sessionParams.username
        params.ip = sessionParams.ip
        params.success = sessionParams.success
      }
    }

    const deleteDialogVisible = ref(false)
    const openDeleteDialog = () => {
      // 清空表单
      deleteForm.startTime = null
      deleteForm.endTime = null
      deleteDialogVisible.value = true
    }
    const deleteForm = reactive({
      // 开始结束时间
      startTime: null,
      endTime: null
    })
    const deleteRules = {
      startTime: [
        {
          required: true,
          message: '请选择开始时间',
          trigger: 'blur'
        }
      ],
      endTime: [
        {
          required: true,
          message: '请选择结束时间',
          trigger: 'blur'
        },
        {
          validator: (rule, value, callback) => {
            if (value && deleteForm.startTime && value < deleteForm.startTime) {
              callback(new Error('结束时间必须在开始时间之后'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    const deleteDialogRef = ref(null)
    const deletelog = () => {
      deleteDialogRef.value.validate(valid => {
        if (valid) {
          // 确认删除
          const text = `${formatDate(deleteForm.startTime)} 到 ${formatDate(
            deleteForm.endTime
          )}`

          CheckDialogService.open({
            correctAnswer: '是',
            content: `确定删除<span class="cRed">${text}</span>的用户登录日志吗？`,
            success: () => {
              // 执行删除
              authApi
                .deleteUserLoginLog({
                  startTime: deleteForm.startTime.toISOString(),
                  endTime: deleteForm.endTime.toISOString()
                })
                .then(res => {
                  ElMessage.success('删除成功')
                  deleteDialogVisible.value = false
                  getUserLoginLogList()
                })
                .catch(err => {
                  console.log(err)
                })
            }
          })
            .then(() => {})
            .catch(error => {
              console.log('Dialog closed:', error)
            })
        }
      })
    }

    onMounted(() => {
      initParams()
      getUserLoginLogList()
    })

    return {
      copyToClipboard,
      userLoginLogList,
      params,
      total,
      tableRef,
      getUserLoginLogList,
      // 搜索
      addParamsAndSearch,
      deleteDialogVisible,
      deleteForm,
      deleteRules,
      openDeleteDialog,
      deleteDialogRef,
      deletelog
    }
  }
}
</script>
<style scoped></style>
