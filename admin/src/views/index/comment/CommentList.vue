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
              placeholder="请输入评论内容"
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
    <div class="mb20">
      <el-table :data="commentList" row-key="_id" border>
        <!-- 评论文章 -->
        <el-table-column label="评论文章/推文" width="180">
          <template #default="{ row }">
            <div :title="row.post.title || row.post.excerpt">
              {{ titleLimit(row.post.title || row.post.excerpt) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="300">
          <template #default="{ row }">
            <div>
              <blockquote class="common-blockquote" v-if="row.parent?.content">
                {{ row.parent.content }}
              </blockquote>
              <div>{{ row.content }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- 状态 0未审核，1通过，2未通过 -->
        <el-table-column prop="status" label="状态" min-width="110">
          <template #default="{ row }">
            <el-dropdown
              trigger="click"
              @command="applyComment(row._id, $event, row.__v)"
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
        </el-table-column>
        <!-- 点赞 -->
        <el-table-column prop="likes" label="点赞" width="80" />
        <el-table-column label="评论者" width="180">
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
        </el-table-column>
        <!-- 评论时间 -->
        <el-table-column prop="date" label="评论时间" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
          </template>
        </el-table-column>
        <!-- 是否置顶 -->
        <el-table-column prop="top" label="置顶" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.top" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <!-- IP信息 -->
        <el-table-column prop="ip" label="IP信息" width="200">
          <template #default="{ row }">
            <div>
              {{ row.ip }}
            </div>
            <div>
              {{ row.ipInfo?.countryLong }} {{ row.ipInfo?.city
              }}<template v-if="row.ipInfo?.region !== row.ipInfo?.city">
                {{ ' ' + row.ipInfo?.region }}</template
              >
            </div>
          </template>
        </el-table-column>
        <!-- UA信息 -->
        <el-table-column label="UA信息" width="210">
          <template #default="{ row }">
            <div>系统：{{ row.deviceInfo?.os?.name }}</div>
            <div>系统版本号：{{ row.deviceInfo?.os?.version }}</div>
            <div>浏览器：{{ row.deviceInfo?.browser?.name }}</div>
            <div>浏览器版本号： {{ row.deviceInfo?.browser?.version }}</div>
          </template>
        </el-table-column>
        <!-- uuid -->
        <el-table-column prop="uuid" label="uuid" width="315" />

        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openCommentForm(row)"
              ><el-icon><ChatLineSquare /></el-icon
            ></el-button>
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              ><el-icon><Edit /></el-icon
            ></el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteComment(row._id)"
              ><el-icon><Delete /></el-icon
            ></el-button>
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
        v-model:current-page="params.page"
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
              {{ commentParentData.parent?.content }}
            </blockquote>
            <div>{{ commentParentData.content }}</div>
          </div>
        </el-form-item>
        <el-form-item label="回复内容" prop="content">
          <el-input
            type="textarea"
            v-model="commentForm.content"
            rows="5"
          ></el-input>
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
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const commentList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
      status: '',
    })
    const total = ref(0)
    const getCommentList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getCommentList(params)
        .then((res) => {
          commentList.value = res.data.list
          total.value = res.data.total
          setSessionParams(route.name, params)
        })
        .catch((err) => {
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

    const goEdit = (id) => {
      router.push({
        name: 'CommentEdit',
        params: {
          id,
        },
      })
    }
    const deleteComment = (id) => {
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
            .deleteComment(params)
            .then(() => {
              ElMessage.success('删除成功')
              getCommentList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    }

    const titleLimit = (title) => {
      let title_ = title || ''
      if (title_.length > 20) {
        title_ = title_.slice(0, 20) + '...'
      }
      return title_
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        ;(params.keyword = sessionParams.keyword),
          (params.status = sessionParams.status)
      }
    }

    // 添加评论
    const commentForm = reactive({
      post: '',
      content: '',
      parent: '',
      top: false,
    })
    const commentFormRef = ref(null)
    const commentFormRules = {
      content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }],
    }
    const commentParentData = ref({})

    const commentFormVisible = ref(false)
    const openCommentForm = (item) => {
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
      commentFormRef.value.validate((valid) => {
        if (valid) {
          authApi.createComment(commentForm).then((res) => {
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
        __v,
      }
      authApi
        .applyComment(params)
        .then(() => {
          ElMessage.success('操作成功')
          getCommentList()
        })
        .catch(() => {})
    }

    onMounted(() => {
      initParams()
      getCommentList()
    })
    return {
      commentList,
      params,
      total,
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
    }
  },
}
</script>
<style lang=""></style>
