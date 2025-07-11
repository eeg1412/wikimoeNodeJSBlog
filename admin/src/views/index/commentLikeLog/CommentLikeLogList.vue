<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>评论点赞记录列表</el-breadcrumb-item>
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
          @keypress.enter="getCommentLikeLogList(true)"
        >
          <!-- ip -->
          <el-form-item>
            <el-input
              v-model="params.ip"
              clearable
              placeholder="请输入ip"
            ></el-input>
          </el-form-item>
          <!-- uuid -->
          <el-form-item>
            <el-input
              v-model="params.uuid"
              clearable
              placeholder="请输入uuid"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="getCommentLikeLogList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        {{ sizeMB }}MB / {{ maxlogsSizeMB }}MB
        <!-- 按钮用 -->
        <!-- 删除 -->
        <el-button type="danger" class="ml5" @click="openDeleteDialog"
          >删除</el-button
        >
      </div>
    </div>
    <!-- 评论点赞记录 -->
    <div class="mb20 list-table-body">
      <el-table
        ref="tableRef"
        height="100%"
        :data="commentLikeLogList"
        row-key="_id"
        border
      >
        <el-table-column label="评论" min-width="180">
          <template #default="{ row }">
            <div :title="row.comment.content" v-if="row.comment">
              {{ row.comment.content }}
            </div>
            <div v-else class="cRed">评论已删除</div>
          </template>
        </el-table-column>
        <!-- uuid -->
        <el-table-column prop="uuid" label="uuid" width="350">
          <template #default="{ row }">
            <div v-if="row.uuid">
              <div class="di">{{ row.uuid }}</div>
              <!-- 查询按钮 -->
              <div class="dib ml5 vt">
                <el-link
                  type="primary"
                  @click="addParamsAndSearch('uuid', row.uuid)"
                  ><i class="fa fa-search"></i
                ></el-link>
              </div>
              <!-- 点击复制按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="copyToClipboard(row.uuid)"
                  ><i class="far fa-clone"></i
                ></el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- like 内容用tag -->
        <el-table-column prop="like" label="点赞" width="100">
          <template #default="{ row }">
            <!-- 根据like -->
            <el-tag
              v-if="row.like"
              type="success"
              effect="dark"
              style="margin-right: 5px"
            >
              点赞
            </el-tag>
            <el-tag
              v-else
              type="danger"
              effect="dark"
              style="margin-right: 5px"
            >
              取消点赞
            </el-tag>
          </template>
        </el-table-column>
        <!-- 时间date -->
        <el-table-column prop="date" label="时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
          </template>
        </el-table-column>
        <!-- IP信息 -->
        <el-table-column prop="ip" label="IP信息" width="350">
          <template #default="{ row }">
            <div v-if="row.ip">
              <div class="di word-break">{{ row.ip }}</div>
              <!-- 查询按钮 -->
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
        </el-table-column>
        <!-- UA信息 -->
        <el-table-column label="UA信息" width="210">
          <template #default="{ row }">
            <div>系统：{{ row.deviceInfo?.os?.name }}</div>
            <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
            <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
            <div>浏览器版本号： {{ row.deviceInfo?.browser?.version }}</div>
            <!-- ua -->
            <div>UA：{{ row.deviceInfo?.ua }}</div>
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
import { onMounted, reactive, ref, watch, computed } from 'vue'
import {
  setSessionParams,
  getSessionParams,
  copyToClipboard,
  formatDate
} from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const commentLikeLogList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      ip: '',
      uuid: '',
      keyword: ''
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getCommentLikeLogList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getCommentLikeLogList(params)
        .then(res => {
          commentLikeLogList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch(err => {
          console.log(err)
        })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getCommentLikeLogList()
      }
    )

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
        params.ip = sessionParams.ip
        params.uuid = sessionParams.uuid
      }
    }
    const titleLimit = title => {
      let title_ = Array.from(title || '')
      if (title_.length > 20) {
        title_ = title_.slice(0, 20).join('') + '...'
      } else {
        title_ = title_.join('')
      }
      return title_
    }
    const addParamsAndSearch = (key, value) => {
      params[key] = value
      getCommentLikeLogList(true)
    }

    const stats = ref({
      isExceedMaxSize: 0,
      maxCommentLikeLogsSize: 0,
      size: 0
    })
    const maxlogsSizeMB = computed(() => {
      let size = (stats.value.maxCommentLikeLogsSize / 1024 / 1024).toFixed(3)
      return Number(size)
    })

    const sizeMB = computed(() => {
      let size = (stats.value.size / 1024 / 1024).toFixed(3)
      return Number(size)
    })
    const getlogStats = () => {
      authApi.getCommentLikeLogStats().then(res => {
        stats.value = res.data.stats
      })
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
            content: `确定删除<span class="cRed">${text}</span>的日志吗？`,
            success: () => {
              return authApi
                .deleteCommentLikeLog({
                  startTime: deleteForm.startTime,
                  endTime: deleteForm.endTime
                })
                .then(res => {
                  const deletedCount = res.data.data.deletedCount
                  ElMessage.success(
                    '删除成功，共删除' + deletedCount + '条日志'
                  )
                  getCommentLikeLogList(true)
                  getlogStats()
                  deleteDialogVisible.value = false
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
      getCommentLikeLogList()
      getlogStats()
    })
    return {
      copyToClipboard,
      commentLikeLogList,
      params,
      total,
      tableRef,
      getCommentLikeLogList,
      titleLimit,
      // 搜索
      addParamsAndSearch,
      stats,
      maxlogsSizeMB,
      sizeMB,
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
<style lang=""></style>
