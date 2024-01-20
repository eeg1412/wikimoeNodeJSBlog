<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>文章列表</el-breadcrumb-item>
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
          @keypress.enter="getPostList(true)"
        >
          <!-- 类型 -->
          <el-form-item>
            <el-select
              v-model="params.type"
              placeholder="请选择类型"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 状态 -->
          <el-form-item>
            <el-select
              v-model="params.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="草稿" value="0"></el-option>
              <el-option label="发布" value="1"></el-option>
              <!-- <el-option label="回收站" value="99"></el-option> -->
            </el-select>
          </el-form-item>
          <!-- 分类 -->
          <el-form-item>
            <el-select
              v-model="params.sort"
              placeholder="请选择分类"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="item in sortList"
                :key="item._id"
                :label="item.sortname"
                :value="item._id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- tags -->
          <el-form-item>
            <el-select
              v-model="params.tags"
              placeholder="请选择标签"
              clearable
              style="width: 200px"
              multiple
              filterable
              remote
              :remote-method="queryTags"
              :loading="tagsIsLoading"
            >
              <el-option
                v-for="item in tagList"
                :key="item._id"
                :label="item.tagname"
                :value="item._id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="params.keyword"
              clearable
              style="width: 180px"
              placeholder="检索关键词"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getPostList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-dropdown trigger="click" @command="handlePostCommand">
          <el-button type="primary">
            发表<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 用typeOptions v-for -->
              <el-dropdown-item
                v-for="(item, index) in typeOptions"
                :key="item.value"
                :command="item.value"
                >{{ item.label }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="mb20">
      <el-table
        :data="list"
        row-key="_id"
        border
        @sort-change="tableSortChange"
        :default-sort="defaultSort"
      >
        <!-- //   - title	标题字段
          // - date	日期字段
          // - content	内容字段
          // - excerpt	摘要字段
          // - alias	别名字段
          // - author	作者字段
          // - sort	分类
          // - type	类型：1blog,2tweet,3page
          // - tags	标签字段[]
          // - views	查看次数字段
          // - comnum	评论次数字段
          // - top	是否置顶字段
          // - sortop	是否分类置顶字段
          // - status	状态字段：0草稿，1发布，99回收站
          // - allowRemark	是否允许评论字段 -->
        <el-table-column prop="type" label="类型">
          <!-- 1blog,2tweet,3page -->
          <template #default="{ row }">
            <el-tag v-if="row.type === 1" effect="plain" type="success"
              >博客</el-tag
            >
            <el-tag v-else-if="row.type === 2" effect="plain">推文</el-tag>
            <el-tag v-else-if="row.type === 3" effect="plain" type="info"
              >页面</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <!-- 0草稿，1发布，99回收站 -->
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">发布</el-tag>
            <el-tag v-else-if="row.status === 99" type="danger">回收站</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题/推文" width="320">
          <template #default="{ row }">
            <div>
              <div :title="row.title || row.excerpt" class="dib">
                {{ titleLimit(row.title || row.excerpt) }}
              </div>
              <!-- 点击打开按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="openPage(row)"
                  ><i class="fas fa-external-link-alt"></i
                ></el-link>
              </div>
              <!-- 点击复制按钮 -->
              <div class="dib ml5 vt">
                <el-link type="primary" @click="copyPage(row)"
                  ><i class="far fa-clone"></i
                ></el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="date"
          label="发表时间"
          sortable="custom"
          width="180"
        >
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="alias" label="别名" />
        <el-table-column prop="author" label="作者" width="100">
          <template #default="{ row }">
            {{ row.author.nickname }}
          </template>
        </el-table-column>
        <el-table-column prop="sort.sortname" label="分类" />

        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag._id"
              size="small"
              style="margin-right: 5px"
              >{{ tag.tagname }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="views"
          label="查看数"
          width="100"
          sortable="custom"
        />
        <el-table-column
          prop="comnum"
          label="评论数"
          width="100"
          sortable="custom"
        />
        <el-table-column prop="top" label="置顶">
          <template #default="{ row }">
            <el-tag v-if="row.top" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortop" label="分类置顶" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.sortop" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="allowRemark" label="允许评论" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.allowRemark" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <!-- 更新时间 -->
        <el-table-column
          prop="updatedAt"
          label="更新日期"
          sortable="custom"
          width="180"
        >
          <template #default="{ row }">
            {{ $formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openCommentForm(row._id, row.title)"
              ><el-icon><ChatLineSquare /></el-icon
            ></el-button>
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              ><el-icon><Edit /></el-icon
            ></el-button>
            <el-button type="danger" size="small" @click="deletePost(row._id)"
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
      :title="commentFormTitle"
    >
      <el-form
        :model="commentForm"
        :rules="commentFormRules"
        ref="commentFormRef"
        label-width="100px"
        @submit.prevent="submitCommentForm"
      >
        <el-form-item label="内容" prop="content">
          <EmojiTextarea
            v-model:value="commentForm.content"
            placeholder="请输入评论内容"
          />
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
import { onMounted, ref, reactive, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmojiTextarea from '@/components/EmojiTextarea.vue'
import {
  setSessionParams,
  getSessionParams,
  copyToClipboard,
} from '@/utils/utils'
import store from '@/store'
export default {
  components: {
    EmojiTextarea,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    // img标签自动添加loading="lazy"
    // let htmlContent = '你的HTML内容'
    // htmlContent = htmlContent.replace(
    //   /<img(?!.*?loading\s*=\s*['"]lazy['"])([^>]*?)>/gi,
    //   '<img loading="lazy" $1>'
    // )
    // console.log(htmlContent)
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
      type: null,
      sorttype: null,
      sort: null,
      tags: [],
    })
    const total = ref(0)
    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
        params.type = sessionParams.type
        params.sorttype = sessionParams.sorttype
        params.sort = sessionParams.sort
        params.tags = sessionParams.tags || []
      }
    }
    const list = ref([])
    const goEdit = (id) => {
      router.push({
        name: 'PostEdit',
        params: {
          id,
        },
      })
    }
    const deletePost = (id) => {
      // 弹窗确认
      ElMessageBox.confirm('此操作将永久删除该文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          authApi.deletePost({ id }).then((res) => {
            ElMessage.success('删除成功')
            getPostList()
          })
        })
        .catch(() => {})
    }
    const getPostList = (resetPage, resetKeyword) => {
      if (resetPage) {
        params.page = 1
      }
      if (resetKeyword) {
        params.keyword = ''
      }
      authApi.getPostList(params).then((res) => {
        list.value = res.data.list
        total.value = res.data.total
        setSessionParams(route.name, params)
      })
    }
    const handleAdd = (type) => {
      authApi.createPost({ type }).then((res) => {
        router.push({
          name: 'PostEdit',
          params: {
            id: res.data.data._id,
          },
        })
      })
    }

    const handlePostCommand = (command) => {
      handleAdd(command)
    }

    const tableSortChange = ({ column, prop, order }) => {
      console.log(column, prop, order)
      if (order) {
        params.sorttype = `${prop}_${order}`
      } else {
        params.sorttype = null
      }
      getPostList()
    }
    const defaultSort = { prop: 'date', order: 'descending' }

    const titleLimit = (title) => {
      let title_ = title || ''
      if (title_.length > 20) {
        title_ = title_.slice(0, 20) + '...'
      }
      return title_
    }

    const typeOptions = [
      {
        value: 1,
        label: '博客',
      },
      {
        value: 2,
        label: '推文',
      },
      {
        value: 3,
        label: '页面',
      },
    ]

    // 获取文章分类
    const sortList = ref([])
    const getSortList = () => {
      authApi.getSortList().then((res) => {
        const list = res.data.data
        // 循环list，查找里面有没有children，如果有，就把children里面的sortname前面加上'--',然后把children push到newlist里面
        const newlist = []
        list.forEach((item) => {
          newlist.push(item)
          if (item.children && item.children.length) {
            item.children.forEach((child) => {
              child.sortname = '└─ ' + child.sortname
            })
            newlist.push(...item.children)
          }
        })
        sortList.value = newlist
      })
    }

    // tags
    const tagList = ref([])
    const tagsIsLoading = ref(false)
    const getTagList = (tagKeyword = null) => {
      if (tagsIsLoading.value) {
        return
      }
      tagsIsLoading.value = true
      authApi
        .getTagList({ keyword: tagKeyword, size: 100, page: 1 }, true)
        .then((res) => {
          tagList.value = res.data.list
        })
        .finally(() => {
          tagsIsLoading.value = false
        })
    }
    let queryTagsTimer = null
    const queryTags = (query) => {
      if (queryTagsTimer) {
        clearTimeout(queryTagsTimer)
      }
      queryTagsTimer = setTimeout(() => {
        getTagList(query)
      }, 50)
    }

    // 添加评论
    const commentForm = reactive({
      post: '',
      content: '',
      top: false,
    })
    const commentFormRef = ref(null)
    const commentFormRules = {
      content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }],
    }
    const commentFormVisible = ref(false)
    const commentFormTitle = ref('添加评论')
    const openCommentForm = (postId, title) => {
      // 重置表单
      commentForm.content = ''
      commentForm.top = false
      commentForm.post = postId
      if (title) {
        commentFormTitle.value = title
      } else {
        commentFormTitle.value = '添加评论'
      }
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
            // 重新获取文章列表
            getPostList()
          })
        } else {
          return false
        }
      })
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const openPage = (row) => {
      const path = getPostPagePath(row)
      // 使用 window.open 方法在新窗口中打开 URL
      window.open(path, '_blank')
    }
    const copyPage = (row) => {
      const path = getPostPagePath(row)
      copyToClipboard(path)
    }
    const getPostPagePath = (row) => {
      // 先判断type是1，2还是3，1和2跳转到/post/id，3跳转到/page/id
      // 如果有别名，就跳转到别名，没有别名就跳转到id
      let path
      if (row.type === 1 || row.type === 2) {
        path = '/post/'
      } else if (row.type === 3) {
        path = '/page/'
      } else {
        console.error('Invalid row type:', row.type)
        return
      }

      if (row.alias) {
        path += row.alias
      } else {
        path += row._id
      }
      return siteUrl.value + path
    }

    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getPostList()
      }
    )

    onMounted(() => {
      initParams()
      getPostList()
      getSortList()
      getTagList()
    })
    return {
      params,
      total,
      list,
      goEdit,
      deletePost,
      getPostList,
      handleAdd,
      handlePostCommand,
      tableSortChange,
      defaultSort,
      titleLimit,
      typeOptions,
      sortList,
      getSortList,
      tagList,
      tagsIsLoading,
      getTagList,
      queryTags,
      // 添加评论
      commentForm,
      commentFormRef,
      commentFormRules,
      commentFormVisible,
      commentFormTitle,
      openCommentForm,
      closeCommentForm,
      submitCommentForm,
      openPage,
      copyPage,
    }
  },
}
</script>
<style lang=""></style>
