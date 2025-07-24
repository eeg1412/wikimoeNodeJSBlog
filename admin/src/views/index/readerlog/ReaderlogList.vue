<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>读者操作日志列表</el-breadcrumb-item>
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
          @keypress.enter="getReaderlogList(true)"
        >
          <!-- actionList -->
          <el-form-item>
            <el-select
              v-model="params.actionList"
              placeholder="动作"
              :style="{
                minWidth: '180px'
              }"
              clearable
              multiple
            >
              <el-option
                v-for="item in actionList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
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
          <!-- isBot true false -->
          <el-form-item>
            <el-select v-model="params.isBot" placeholder="机器人" clearable>
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getReaderlogList(true)"
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
    <!-- 读者操作日志 -->
    <div class="mb20 list-table-body">
      <el-table
        ref="tableRef"
        height="100%"
        :data="readerlogList"
        row-key="_id"
        border
      >
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
        <!-- 动作 action -->
        <el-table-column prop="action" label="动作" width="200">
          <template #default="{ row }">
            {{ actionMap[row.action] }}
          </template>
        </el-table-column>
        <!-- 操作内容 data -->
        <el-table-column prop="data" label="操作对象内容" min-width="200">
          <template #default="{ row }">
            <div v-if="row.data">
              <!-- 如果 target targetId content 三者都有则显示跳转到对应页面的链接，否则优先显示content，没有再显示targetId -->
              <div
                v-if="
                  targetToPath(row.data.target) &&
                  row.data.targetId &&
                  row.data.content
                "
              >
                <div class="di">{{ row.data.content }}</div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt">
                  <el-link type="primary" @click="goToBlog(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </div>
              <div v-else-if="row.data.content">
                {{ row.data.content }}
              </div>
              <div
                v-else-if="targetToPath(row.data.target) && row.data.targetId"
              >
                <div class="dib">{{ row.data.content }}</div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt">
                  <el-link type="primary" @click="goToBlog(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </div>
              <div v-else>
                {{ row.data.targetId }}
              </div>
            </div>
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
            <div>
              是否为机器人：
              <el-tag v-if="row.isBot" type="danger">是</el-tag>
              <el-tag v-else type="success">否</el-tag>
            </div>
            <div v-if="row.isBot">机器人类型：{{ row.botName }}</div>
            <!-- ua -->
            <div>UA：{{ row.deviceInfo?.ua }}</div>
          </template>
        </el-table-column>
        <!-- 性能统计 performanceNavigationTiming -->
        <el-table-column label="性能统计" min-width="230">
          <template #default="{ row }">
            <div v-if="row.data?.performanceNavigationTiming">
              <div>
                重定向计数：{{
                  row.data.performanceNavigationTiming.redirectCount
                }}
              </div>
              <div>
                DNS查询耗时：{{
                  msToSec(
                    row.data.performanceNavigationTiming.domainLookupDuration
                  )
                }}
              </div>
              <div>
                TCP握手耗时：{{
                  msToSec(row.data.performanceNavigationTiming.connectDuration)
                }}
              </div>
              <div>
                DOM解析完成耗时：{{
                  msToSec(row.data.performanceNavigationTiming.domInteractive)
                }}
              </div>
              <div>
                DOM完全加载耗时：{{
                  msToSec(row.data.performanceNavigationTiming.domComplete)
                }}
              </div>
              <div>
                加载事件处理耗时：{{
                  msToSec(
                    row.data.performanceNavigationTiming.loadEventDuration
                  )
                }}
              </div>
              <div>
                总页面加载耗时：{{
                  msToSec(row.data.performanceNavigationTiming.duration)
                }}
              </div>
              <div>
                条目类型：{{ row.data.performanceNavigationTiming.entryType }}
              </div>
              <div class="word-break">
                URL：{{ row.data.performanceNavigationTiming.name }}
              </div>
              <div>类型：{{ row.data.performanceNavigationTiming.type }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- 来源 referrer -->
        <el-table-column prop="referrer" label="来源" min-width="200" />
        <!-- createdAt -->
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
import store from '@/store'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const actionMap = {
      open: '打开',
      postList: '文章列表',
      postListArchive: '文章归档列表',
      postListSort: '文章分类列表',
      postListTag: '文章标签列表',
      postListKeyword: '文章关键字列表',
      postListBangumi: '文章番剧列表',
      postListMovie: '文章电影列表',
      postListBook: '文章书籍列表',
      postListGame: '文章游戏列表',
      postView: '文章详情',
      postLike: '文章点赞',
      postDislike: '取消文章点赞',
      commentLike: '评论点赞',
      commentDislike: '取消评论点赞',
      commentRetract: '撤回评论'
    }
    const actionList = ref(
      Object.keys(actionMap).map(key => ({
        value: key,
        label: actionMap[key]
      }))
    )
    const readerlogList = ref([])
    const params = reactive({
      actionList: [],
      page: 1,
      size: 50,
      ip: '',
      uuid: '',
      keyword: '',
      isBot: null
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getReaderlogList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getReaderlogList(params)
        .then(res => {
          const list = res.data.list
          // 查询action是postListArchive 时，将title中的年月提取出来，放到targetId中
          list.forEach(item => {
            if (item.action === 'postListArchive' && item.data.content) {
              const title = item.data.content
              const year = title.slice(2, 6)
              const month = title.slice(7, 9)
              item.data.targetId = `${year}/${month}`
            }
          })
          readerlogList.value = list
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
      getReaderlogList(true)
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getReaderlogList()
      }
    )

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.actionList = sessionParams.actionList
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
        params.ip = sessionParams.ip
        params.uuid = sessionParams.uuid
        params.isBot = sessionParams.isBot
      }
    }
    const targetToPath = target => {
      const targetMap = {
        blog: '/post/{id}',
        tweet: '/post/{id}',
        page: '/page/{id}',
        sort: '/post/list/sort/{id}/1',
        tag: '/post/list/tag/{id}/1',
        archive: '/post/list/archive/{id}/1'
      }
      if (targetMap[target]) {
        return targetMap[target]
      } else {
        return null
      }
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const getPath = row => {
      if (!siteUrl.value) {
        ElMessage.error('请先设置站点地址')
        return
      }
      let path = targetToPath(row.data.target)
      if (!path) {
        return
      }
      let targetId = row.data.targetId
      path = path.replace('{id}', targetId)

      return siteUrl.value + path
    }
    const goToBlog = row => {
      const url = getPath(row)
      window.open(url, '_blank')
    }

    const stats = ref({
      isExceedMaxSize: 0,
      maxReaderlogsSize: 0,
      size: 0
    })
    const maxlogsSizeMB = computed(() => {
      let size = (stats.value.maxReaderlogsSize / 1024 / 1024).toFixed(3)
      return Number(size)
    })

    const sizeMB = computed(() => {
      let size = (stats.value.size / 1024 / 1024).toFixed(3)
      return Number(size)
    })
    const getlogStats = () => {
      authApi.getReaderlogStats().then(res => {
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
                .deleteReaderlog({
                  startTime: deleteForm.startTime,
                  endTime: deleteForm.endTime
                })
                .then(res => {
                  const deletedCount = res.data.data.deletedCount
                  ElMessage.success(
                    '删除成功，共删除' + deletedCount + '条日志'
                  )
                  getReaderlogList(true)
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

    const msToSec = ms => {
      if (!ms && ms !== 0) {
        return ''
      }
      const s = ms / 1000
      return s + 's'
    }

    onMounted(() => {
      initParams()
      getReaderlogList()
      getlogStats()
    })
    return {
      copyToClipboard,
      actionMap,
      actionList,
      readerlogList,
      params,
      total,
      tableRef,
      getReaderlogList,
      targetToPath,
      // 搜索
      addParamsAndSearch,
      goToBlog,
      stats,
      maxlogsSizeMB,
      sizeMB,
      deleteDialogVisible,
      deleteForm,
      deleteRules,
      openDeleteDialog,
      deleteDialogRef,
      deletelog,
      msToSec
    }
  }
}
</script>
<style scoped></style>
