<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>文章列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix" :class="{ mb20: selectedRows.length <= 0 }">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
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
            <SortSelector v-model="params.sort" />
          </el-form-item>
          <!-- tags -->
          <el-form-item>
            <TagSelector v-model="params.tags" ref="SearchTagSelectorRef" />
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
    <div v-if="selectedRows.length > 0">
      <PostBatchForm
        :postList="selectedRows"
        @success="postBatchFormSuccess()"
        @cancel="clearSelection"
      />
    </div>
    <div
      class="mb20 list-table-body"
      :class="{ batch: selectedRows.length > 0 }"
    >
      <el-table
        :data="list"
        row-key="_id"
        height="100%"
        border
        @sort-change="tableSortChange"
        :default-sort="defaultSort"
        @selection-change="handleSelectionChange"
        ref="tableRef"
      >
        <!--
          //   - title	标题字段
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
        <el-table-column
          type="selection"
          :reserve-selection="true"
          width="55"
          fixed="left"
        />
        <el-table-column prop="type" label="类型">
          <!-- 1blog,2tweet,3page -->
          <template #default="{ row }">
            <el-tag v-if="row.type === 1" effect="plain" type="success"
              >博文</el-tag
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
              <div :title="row.title || row.excerpt" class="di">
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
        <el-table-column prop="alias" label="别名" min-width="100" />
        <el-table-column prop="author" label="作者" width="100">
          <template #default="{ row }">
            {{ row.author.nickname }}
          </template>
        </el-table-column>
        <el-table-column prop="sort.sortname" label="分类" />

        <el-table-column prop="tags" label="标签" width="200">
          <template #default="{ row }">
            <div
              class="postlist-content-item"
              v-for="tag in row.tags"
              :key="tag._id"
              size="small"
              style="margin-right: 5px"
            >
              #{{ tag.tagname }}
            </div>
          </template>
        </el-table-column>
        <!-- 关联内容 -->
        <el-table-column prop="related" label="关联与相关内容" min-width="400">
          <template #default="{ row }">
            <div
              class="post-list-about-body"
              v-if="row.mergeTweetContentList.length > 0"
            >
              <div class="fb">
                推文内关联内容<template v-if="row.contentSeriesSortListTurnOn"
                  >(自定义排序)</template
                >：
              </div>
              <div
                v-for="content in row.mergeTweetContentList"
                :key="content._id"
                class="postlist-content-item"
                :class="{ danger: content.status === 0 }"
              >
                <template v-if="content.type === 'bangumi'">
                  <i class="fas fa-fw fa-tv"></i>{{ `${checkShowText(content)}`
                  }}{{
                    `【${content.year}年${seasonToStr(content.season)}季新番】`
                  }}
                </template>
                <!-- movie -->
                <template v-else-if="content.type === 'movie'">
                  <i class="fas fa-fw fa-film"></i
                  >{{ `${checkShowText(content)}` }}{{ setMovieTitle(content) }}
                </template>
                <template v-else-if="content.type === 'book'">
                  <i class="fas fa-fw fa-book"></i
                  >{{ `${checkShowText(content)}`
                  }}{{
                    content.booktype?.name ? `【${content.booktype.name}】` : ''
                  }}
                </template>
                <template v-else-if="content.type === 'game'">
                  <i class="fas fa-fw fa-gamepad"></i
                  >{{ `${checkShowText(content)}`
                  }}{{
                    content.gamePlatform?.name
                      ? `【${content.gamePlatform.name}】`
                      : ''
                  }}
                </template>
                <template v-else-if="content.type === 'post'">
                  <i class="fas fa-fw fa-newspaper"></i>
                  {{ `${checkShowText(content)}` }}
                  {{
                    `${
                      content.date
                        ? $formatDate(content.date, '【YYYY年MM月DD日】')
                        : ''
                    }`
                  }}
                </template>
                <template v-else-if="content.type === 'tweet'">
                  <i class="fas fa-fw fa-align-left"></i>
                  {{ `${checkShowText(content)}` }}
                  {{
                    `${
                      content.date
                        ? $formatDate(content.date, '【YYYY年MM月DD日】')
                        : ''
                    }`
                  }}
                </template>
                <template v-else-if="content.type === 'event'">
                  <i class="fas fa-fw fa-calendar-alt"></i
                  >{{ `${checkShowText(content)}`
                  }}{{ `【${$formatDate(content.startTime, 'YYYY年MM月')}】` }}
                </template>
                <!-- vote -->
                <template v-else-if="content.type === 'vote'">
                  <i class="fas fa-fw fa-poll-h"></i
                  >{{ `${checkShowText(content)}` }}{{ `【投票】` }}
                </template>
                {{ content.title }}
              </div>
            </div>
            <div
              class="post-list-about-body"
              v-if="row.mergeContentList.length > 0"
            >
              <div class="fb">
                详情页相关内容<template v-if="row.seriesSortListTurnOn"
                  >(自定义排序)</template
                >：
              </div>
              <div
                v-for="content in row.mergeContentList"
                :key="content._id"
                class="postlist-content-item"
                :class="{ danger: content.status === 0 }"
              >
                <template v-if="content.type === 'bangumi'">
                  <i class="fas fa-fw fa-tv"></i>{{ `${checkShowText(content)}`
                  }}{{
                    `【${content.year}年${seasonToStr(content.season)}季新番】`
                  }}
                </template>
                <!-- movie -->
                <template v-else-if="content.type === 'movie'">
                  <i class="fas fa-fw fa-film"></i
                  >{{ `${checkShowText(content)}` }}{{ setMovieTitle(content) }}
                </template>
                <template v-else-if="content.type === 'book'">
                  <i class="fas fa-fw fa-book"></i
                  >{{ `${checkShowText(content)}`
                  }}{{
                    content.booktype?.name ? `【${content.booktype.name}】` : ''
                  }}
                </template>
                <template v-else-if="content.type === 'game'">
                  <i class="fas fa-fw fa-gamepad"></i
                  >{{ `${checkShowText(content)}`
                  }}{{
                    content.gamePlatform?.name
                      ? `【${content.gamePlatform.name}】`
                      : ''
                  }}
                </template>
                <template v-else-if="content.type === 'post'">
                  <i class="fas fa-fw fa-newspaper"></i
                  >{{ `${checkShowText(content)}`
                  }}{{
                    `${
                      content.date
                        ? $formatDate(content.date, '【YYYY年MM月DD日】')
                        : ''
                    }`
                  }}
                </template>
                <template v-else-if="content.type === 'tweet'">
                  <i class="fas fa-fw fa-align-left"></i
                  >{{ `${checkShowText(content)}`
                  }}{{
                    `${
                      content.date
                        ? $formatDate(content.date, '【YYYY年MM月DD日】')
                        : ''
                    }`
                  }}
                </template>
                <template v-else-if="content.type === 'event'">
                  <i class="fas fa-fw fa-calendar-alt"></i
                  >{{ `${checkShowText(content)}`
                  }}{{ `【${$formatDate(content.startTime, 'YYYY年MM月')}】` }}
                </template>
                <!-- vote -->
                <template v-else-if="content.type === 'vote'">
                  <i class="fas fa-fw fa-poll-h"></i
                  >{{ `${checkShowText(content)}` }}{{ `【投票】` }}
                </template>
                {{ content.title }}
              </div>
            </div>
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
        <!-- likes -->
        <el-table-column
          prop="likes"
          label="点赞数"
          width="100"
          sortable="likes"
        />
        <!-- shares -->
        <el-table-column
          prop="shares"
          label="分享数"
          width="100"
          sortable="shares"
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
        <el-table-column
          label="操作"
          width="170"
          fixed="right"
          v-if="selectedRows.length <= 0"
        >
          <template #default="{ row }">
            <el-button size="small" @click="openCommentForm(row._id, row.title)"
              ><el-icon><ChatLineSquare /></el-icon
            ></el-button>
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              ><el-icon><Edit /></el-icon
            ></el-button>
            <el-button type="danger" size="small" @click="deletePost(row)"
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
        :pager-count="5"
        small
        :total="total"
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
import TagSelector from '@/components/TagSelector.vue'
import SortSelector from '@/components/SortSelector.vue'
import PostBatchForm from '@/components/PostBatchForm.vue'
import {
  setSessionParams,
  getSessionParams,
  copyToClipboard,
  seasonToStr,
  escapeHtml,
  limitStr
} from '@/utils/utils'
import store from '@/store'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  components: {
    EmojiTextarea,
    TagSelector,
    SortSelector,
    PostBatchForm
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
      size: 50,
      keyword: '',
      type: null,
      status: null,
      sorttype: null,
      sort: null,
      tags: []
    })
    const total = ref(0)
    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
        params.type = sessionParams.type
        params.status = sessionParams.status
        params.sorttype = sessionParams.sorttype
        params.sort = sessionParams.sort
        params.tags = sessionParams.tags || []
      }
    }
    const list = ref([])
    const goEdit = id => {
      router.push({
        name: 'PostEdit',
        params: {
          id
        }
      })
    }
    const deletePost = row => {
      const id = row._id
      let title = row.title || row.excerpt
      if (title.length > 20) {
        title = limitStr(title, 20)
      }
      if (!title) {
        title = '未定义标题或内容'
      }
      title = escapeHtml(title)

      let type
      switch (row.type) {
        case 1:
          type = '博文'
          break
        case 2:
          type = '推文'
          break
        default:
          type = '页面'
          break
      }

      // 弹窗确认
      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除【${type}】《${title}》</span>, 是否继续?`,
        success: () => {
          return authApi.deletePost({ id }).then(res => {
            ElMessage.success('删除成功')
            getPostList()
          })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
        })
    }
    const tableRef = ref(null)
    const getPostList = (resetPage, resetKeyword, top = true) => {
      if (resetKeyword) {
        params.keyword = ''
      }
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi.getPostList(params).then(res => {
        const dataList = res.data.list
        dataList.forEach(item => {
          const seriesSortList = item.seriesSortList
          const contentSeriesSortList = item.contentSeriesSortList
          if (seriesSortList && seriesSortList.length) {
            item.seriesSortListTurnOn = true
          } else {
            item.seriesSortListTurnOn = false
          }
          if (contentSeriesSortList && contentSeriesSortList.length) {
            item.contentSeriesSortListTurnOn = true
          } else {
            item.contentSeriesSortListTurnOn = false
          }
          item.mergeContentList = mergeContentList(
            item,
            undefined,
            seriesSortList
          )
          item.mergeTweetContentList = mergeContentList(
            item,
            'content',
            contentSeriesSortList
          )
        })

        list.value = dataList
        total.value = res.data.total
        if (top) {
          tableRef.value.scrollTo({ top: 0 })
        }
        setSessionParams(route.name, params)
      })
    }
    const handleAdd = type => {
      authApi.createPost({ type }).then(res => {
        router.push({
          name: 'PostEdit',
          params: {
            id: res.data.data._id
          },
          query: {
            new: '1'
          }
        })
      })
    }

    const handlePostCommand = command => {
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

    const titleLimit = title => {
      let title_ = Array.from(title || '')
      if (title_.length > 20) {
        title_ = title_.slice(0, 20).join('') + '...'
      } else {
        title_ = title_.join('')
      }
      return title_
    }

    const typeOptions = [
      {
        value: 1,
        label: '博文'
      },
      {
        value: 2,
        label: '推文'
      },
      {
        value: 3,
        label: '页面'
      }
    ]

    // 添加评论
    const commentForm = reactive({
      post: '',
      content: '',
      top: false
    })
    const commentFormRef = ref(null)
    const commentFormRules = {
      content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }]
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
      commentFormRef.value.validate(valid => {
        if (valid) {
          authApi.createComment(commentForm).then(res => {
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

    const openPage = row => {
      const path = getPostPagePath(row)
      // 使用 window.open 方法在新窗口中打开 URL
      window.open(path, '_blank')
    }
    const copyPage = row => {
      const path = getPostPagePath(row)
      copyToClipboard(path)
    }
    const getPostPagePath = row => {
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

    // 合并bookList,bangumiList,gameList,postList
    const mergeContentList = (row, type, sort) => {
      // 根据type决定从哪里获取列表
      const {
        bookList: originalBookList,
        bangumiList: originalBangumiList,
        movieList: originalMovieList,
        gameList: originalGameList,
        postList: originalPostList,
        tweetList: originalTweetList,
        eventList: originalEventList,
        voteList: originalVoteList,
        contentBookList,
        contentBangumiList,
        contentMovieList,
        contentGameList,
        contentPostList,
        contentTweetList,
        contentEventList,
        contentVoteList
      } = row

      // 根据type参数选择适当的列表
      const bookList = type === 'content' ? contentBookList : originalBookList
      const bangumiList =
        type === 'content' ? contentBangumiList : originalBangumiList
      const movieList =
        type === 'content' ? contentMovieList : originalMovieList
      const gameList = type === 'content' ? contentGameList : originalGameList
      const postList = type === 'content' ? contentPostList : originalPostList
      const tweetList =
        type === 'content' ? contentTweetList : originalTweetList
      const eventList =
        type === 'content' ? contentEventList : originalEventList
      const voteList = type === 'content' ? contentVoteList : originalVoteList

      const contentList = []
      if (!sort || sort.length <= 0) {
        sort = ['event', 'vote', 'post', 'tweet', 'acgn']
      }
      sort.forEach(item => {
        if (item === 'event') {
          if (eventList && eventList.length) {
            const type = 'event'
            eventList.forEach(item => {
              contentList.push({ ...item, type })
            })
          }
        } else if (item === 'vote') {
          if (voteList && voteList.length) {
            const type = 'vote'
            voteList.forEach(item => {
              contentList.push({ ...item, type })
            })
          }
        } else if (item === 'post') {
          if (postList && postList.length) {
            const type = 'post'
            postList.forEach(item => {
              contentList.push({ ...item, type })
            })
          }
        } else if (item === 'tweet') {
          if (tweetList && tweetList.length) {
            const type = 'tweet'
            tweetList.forEach(item => {
              const title = limitStr(item.excerpt, 20)
              item.title = title
              delete item.excerpt
              contentList.push({ ...item, type })
            })
          }
        } else if (item === 'acgn') {
          if (bangumiList && bangumiList.length) {
            const type = 'bangumi'
            bangumiList.forEach(item => {
              contentList.push({ ...item, type })
            })
          }
          if (movieList && movieList.length) {
            const type = 'movie'
            movieList.forEach(item => {
              contentList.push({ ...item, type })
            })
          }
          if (bookList && bookList.length) {
            const type = 'book'
            bookList.forEach(item => {
              contentList.push({ ...item, type })
            })
          }
          if (gameList && gameList.length) {
            const type = 'game'
            gameList.forEach(item => {
              contentList.push({ ...item, type })
            })
          }
        }
      })

      return contentList
    }

    const selectedRows = ref([])
    const handleSelectionChange = rows => {
      console.log(rows)
      selectedRows.value = rows
    }
    const clearSelection = () => {
      tableRef.value.clearSelection()
    }
    const postBatchFormSuccess = () => {
      clearSelection()
      getPostList(false, false, false)
    }

    const checkShowText = item => {
      if (item.status === 0) {
        return '【状态:不显示】'
      }
      return ''
    }

    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getPostList()
      }
    )

    const SearchTagSelectorRef = ref(null)

    const setMovieTitle = item => {
      const year = item.year
      const month = item.month
      const day = item.day
      if (year && month && day) {
        return `【${year}年${month}月${day}日观看】`
      }
      return ''
    }

    onMounted(() => {
      initParams()
      getPostList()
      if (params.tags.length) {
        SearchTagSelectorRef.value.getTagList(null, {
          idList: params.tags,
          size: 999999
        })
      }
    })
    return {
      seasonToStr,
      params,
      total,
      list,
      goEdit,
      deletePost,
      tableRef,
      getPostList,
      handleAdd,
      handlePostCommand,
      tableSortChange,
      defaultSort,
      titleLimit,
      typeOptions,
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
      mergeContentList,
      // 复选框
      handleSelectionChange,
      selectedRows,
      clearSelection,
      postBatchFormSuccess,
      // 搜索标签
      SearchTagSelectorRef,
      checkShowText,
      setMovieTitle
    }
  }
}
</script>
<style scoped>
.postlist-content-item {
  margin-right: 5px;
  margin-bottom: 5px;
  display: inline-block;
  --el-tag-border-radius: 4px;
  --el-tag-text-color: var(--el-color-primary);
  --el-tag-bg-color: var(--el-color-primary-light-9);
  --el-tag-border-color: var(--el-color-primary-light-8);
  --el-tag-hover-color: var(--el-color-primary);
  background-color: var(--el-tag-bg-color);
  color: var(--el-tag-text-color);
  border-color: var(--el-tag-border-color);
  vertical-align: middle;
  padding: 0 9px;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
}
.postlist-content-item.danger {
  --el-tag-text-color: var(--el-color-danger);
  --el-tag-bg-color: var(--el-color-danger-light-9);
  --el-tag-border-color: var(--el-color-danger-light-8);
  --el-tag-hover-color: var(--el-color-danger);
}
.post-list-about-body {
  margin-bottom: 10px;
}
.post-list-about-body:last-child {
  margin-bottom: 0;
}
</style>
