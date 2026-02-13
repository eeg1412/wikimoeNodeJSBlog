<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>评论列表</el-breadcrumb-item>
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
          @keypress.enter="getCommentList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              clearable
              placeholder="请输入评论内容/评论者/邮箱/网站"
              style="width: 250px"
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
          <!-- uuid -->
          <el-form-item>
            <el-input
              v-model="params.uuid"
              clearable
              placeholder="请输入uuid"
            ></el-input>
          </el-form-item>
          <!-- 状态 -->
          <el-form-item>
            <el-select
              v-model="params.status"
              clearable
              placeholder="请选择状态"
            >
              <el-option label="待审核" :value="0"></el-option>
              <el-option label="通过" :value="1"></el-option>
              <el-option label="未通过" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getCommentList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
      </div>
    </div>
    <!-- comments -->
    <div class="mb20 list-table-body">
      <ResponsiveTable
        ref="tableRef"
        :data="commentList"
        height="100%"
        row-key="_id"
        border
      >
        <!-- 评论文章 -->
        <ResponsiveTableColumn label="评论文章/推文" width="180">
          <template #default="{ row }">
            <div v-if="row.post">
              <div :title="row.post.title || row.post.excerpt" class="di">
                {{ titleLimit(row.post.title || row.post.excerpt) }}
              </div>
              <!-- 点击打开按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="goToBlog(row)"
                  ><i class="fas fa-external-link-alt"></i
                ></el-link>
              </div>
            </div>
            <div v-else class="cRed">文章/推文已删除</div>
          </template>
        </ResponsiveTableColumn>
        <ResponsiveTableColumn prop="content" label="内容" min-width="300">
          <template #default="{ row }">
            <div>
              <blockquote
                class="common-blockquote"
                v-if="row.parent && row.parent?.content"
              >
                <div class="fb">
                  {{ row.parent.user?.nickname || row.parent.nickname }}
                </div>
                <div>{{ $formatDate(row.date) }}</div>
                <div class="mt5 pre-wrap">{{ row.parent.content }}</div>
              </blockquote>
              <blockquote
                class="common-blockquote"
                v-else-if="!row.parent && row.parentId"
              >
                该评论审核暂未通过或已被删除
              </blockquote>
              <div class="pre-wrap">{{ row.content }}</div>
            </div>
          </template>
        </ResponsiveTableColumn>
        <!-- 状态 0未审核，1通过，2未通过 -->
        <ResponsiveTableColumn prop="status" label="状态" min-width="110">
          <template #default="{ row }">
            <el-dropdown
              trigger="click"
              @command="applyComment(row._id, $event, row.__v)"
              :disabled="!row.post"
            >
              <el-button
                size="small"
                :type="
                  row.status === 0
                    ? 'info'
                    : row.status === 1
                    ? 'success'
                    : 'danger'
                "
                :disabled="!row.post"
              >
                {{
                  row.status === 0
                    ? '待审核'
                    : row.status === 1
                    ? '通过'
                    : '未通过'
                }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status !== 0" :command="0"
                    >待审核</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="row.status !== 1"
                    :command="1"
                    class="cGreen1A7"
                    >通过</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="row.status !== 2"
                    :command="2"
                    class="cRed"
                    >未通过</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </ResponsiveTableColumn>
        <!-- 点赞 -->
        <ResponsiveTableColumn prop="likes" label="点赞" width="80" />
        <ResponsiveTableColumn label="评论者" width="180">
          <template #default="{ row }">
            <template v-if="row.user">
              {{ row.user.nickname }}（管理员）
            </template>
            <template v-else>
              <div>{{ row.nickname }}</div>
              <div>{{ row.email }}</div>
              <div>{{ row.url }}</div>
            </template>
          </template>
        </ResponsiveTableColumn>
        <!-- 评论时间 -->
        <ResponsiveTableColumn prop="date" label="评论时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
          </template>
        </ResponsiveTableColumn>
        <!-- 是否置顶 -->
        <ResponsiveTableColumn prop="top" label="置顶" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.top" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </ResponsiveTableColumn>
        <!-- IP信息 -->
        <ResponsiveTableColumn prop="ip" label="IP信息" width="350">
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
        <!-- uuid -->
        <ResponsiveTableColumn prop="uuid" label="uuid" width="350">
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
        </ResponsiveTableColumn>

        <ResponsiveTableColumn label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="openCommentForm(row)"
              :disabled="!row.post || row.status !== 1"
              ><el-icon><ChatLineSquare /></el-icon
            ></el-button>
            <el-button
              type="primary"
              size="small"
              @click="goEdit(row._id)"
              :disabled="!row.post"
              ><el-icon><Edit /></el-icon
            ></el-button>
            <el-button type="danger" size="small" @click="deleteComment(row)"
              ><el-icon><Delete /></el-icon
            ></el-button>
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
    <!-- 添加评论弹窗 -->
    <el-dialog
      v-model="commentFormVisible"
      :show-close="false"
      destroy-on-close
      :close-on-click-modal="false"
      align-center
      append-to-body
      :lock-scroll="false"
      title="回复评论"
    >
      <el-form
        :model="commentForm"
        :rules="commentFormRules"
        ref="commentFormRef"
        label-width="100px"
        @submit.prevent="submitCommentForm"
      >
        <!-- 内容 -->
        <el-form-item label="内容">
          <div>
            <blockquote
              class="common-blockquote"
              v-if="commentParentData?.parent?.content"
            >
              <div class="fb">
                {{
                  commentParentData.parent.user?.nickname ||
                  commentParentData.parent.nickname
                }}
              </div>
              <div>{{ $formatDate(commentParentData.date) }}</div>
              <div class="mt5 pre-wrap">
                {{ commentParentData.parent?.content }}
              </div>
            </blockquote>
            <blockquote
              class="common-blockquote"
              v-else-if="
                !commentParentData.parent && commentParentData.parentId
              "
            >
              该评论审核暂未通过或已被删除
            </blockquote>
            <div class="pre-wrap">{{ commentParentData.content }}</div>
          </div>
        </el-form-item>
        <el-form-item label="回复内容" prop="content">
          <EmojiTextarea v-model:value="commentForm.content" />
        </el-form-item>
        <el-form-item label="置顶" prop="top">
          <el-switch v-model="commentForm.top" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitCommentForm">提交</el-button>
          <el-button @click="closeCommentForm">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onMounted, reactive, ref, watch, computed } from 'vue'
import EmojiTextarea from '@/components/EmojiTextarea.vue'
import {
  setSessionParams,
  getSessionParams,
  copyToClipboard,
  escapeHtml
} from '@/utils/utils'
import store from '@/store'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  components: {
    EmojiTextarea
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const commentList = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
      ip: '',
      uuid: '',
      status: ''
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getCommentList = resetPage => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .getCommentList(params)
        .then(res => {
          commentList.value = res.data.list
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
        getCommentList()
      }
    )

    const goEdit = id => {
      router.push({
        name: 'CommentEdit',
        params: {
          id
        }
      })
    }
    const deleteComment = row => {
      const id = row._id
      let nickname = row.user?.nickname || row.nickname
      const email = row.email
      const url = row.url
      const content = row.content
      if (row.user) {
        nickname += '（管理员）'
      }

      CheckDialogService.open({
        correctAnswer: '是',
        content: `
          <div class="mb10">
            <p class="mb10">此操作将<span class="cRed">永久删除评论</span>，是否继续?</p>
            <p><strong>昵称：</strong>${escapeHtml(nickname || '-')}</p>
            <p><strong>邮箱：</strong>${escapeHtml(email || '-')}</p>
            <p><strong>网址：</strong>${escapeHtml(url || '-')}</p>
            <p><strong>内容：</strong>${escapeHtml(content || '-')}</p>
          </div>
        `,
        success: () => {
          return authApi.deleteComment({ id }).then(() => {
            ElMessage.success('删除成功')
            getCommentList()
          })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
        })
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

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
        params.status = sessionParams.status
        params.ip = sessionParams.ip
        params.uuid = sessionParams.uuid
      }
    }

    // 添加评论
    const commentForm = reactive({
      post: '',
      content: '',
      parent: '',
      top: false
    })
    const commentFormRef = ref(null)
    const commentFormRules = {
      content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }]
    }
    const commentParentData = ref({})

    const commentFormVisible = ref(false)
    const openCommentForm = item => {
      const nickname = item.user?.nickname || item.nickname
      commentForm.content = `@${nickname}：`
      commentForm.top = false
      commentForm.post = item.post._id
      commentForm.parent = item._id
      commentParentData.value = item
      commentFormVisible.value = true
    }
    const closeCommentForm = () => {
      commentFormVisible.value = false
    }
    const submitCommentForm = () => {
      commentFormRef.value.validate(valid => {
        if (valid) {
          authApi.createComment(commentForm).then(res => {
            ElMessage.success('评论成功')
            closeCommentForm()
            getCommentList()
          })
        } else {
          return false
        }
      })
    }

    // 审核评论
    const applyComment = (id, status, __v) => {
      const params = {
        id,
        status,
        __v
      }
      authApi
        .applyComment(params)
        .then(() => {
          ElMessage.success('操作成功')
          getCommentList()
        })
        .catch(() => {})
    }

    const addParamsAndSearch = (key, value) => {
      params[key] = value
      getCommentList(true)
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const getPath = row => {
      if (!siteUrl.value) {
        ElMessage.error('请先设置站点地址')
        return
      }
      let path
      const post = row.post
      if (post.type === 1 || post.type === 2) {
        path = '/post/'
      } else if (post.type === 3) {
        path = '/page/'
      } else {
        console.error('Invalid row type:', post.type)
        return
      }

      if (post.alias) {
        path += post.alias
      } else {
        path += post._id
      }
      return siteUrl.value + path
    }
    const goToBlog = row => {
      const url = getPath(row)
      window.open(url, '_blank')
    }

    onMounted(() => {
      initParams()
      getCommentList()
    })
    return {
      copyToClipboard,
      commentList,
      params,
      total,
      tableRef,
      getCommentList,
      goEdit,
      deleteComment,
      titleLimit,
      // 添加评论
      commentForm,
      commentFormRef,
      commentFormRules,
      commentParentData,
      commentFormVisible,
      openCommentForm,
      closeCommentForm,
      submitCommentForm,
      // 审核评论
      applyComment,
      // 搜索
      addParamsAndSearch,
      goToBlog
    }
  }
}
</script>
<style lang=""></style>
