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
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd(1)"
          ><el-icon><Tickets /></el-icon>发表博客</el-button
        >
        <el-button type="primary" @click="handleAdd(2)"
          ><el-icon><ChatLineRound /></el-icon>发表推文</el-button
        >
        <el-button type="primary" @click="handleAdd(3)"
          ><el-icon><Document /></el-icon>发表页面</el-button
        >
      </div>
    </div>
    <div class="mb20">
      <el-table :data="list" row-key="_id" border default-expand-all>
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
            <el-tag v-if="row.type === 1" type="success">博客</el-tag>
            <el-tag v-else-if="row.type === 2" type="warning">推文</el-tag>
            <el-tag v-else-if="row.type === 3" type="info">页面</el-tag>
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
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="date" label="创建日期" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="alias" label="别名" width="180" />
        <el-table-column prop="author" label="作者" width="100">
          <template #default="{ row }">
            {{ row.author.nickname }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="分类" />

        <el-table-column prop="tags" label="标签">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag._id"
              type="success"
              size="mini"
              style="margin-right: 5px"
              >{{ tag.tagname }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="views" label="查看数" />
        <el-table-column prop="comnum" label="评论数" />
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
        <el-table-column prop="updatetime" label="更新日期" width="180">
          <template #default="{ row }">
            {{ $formatDate(row.updatetime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deletePost(row._id)"
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
        layout="prev, pager, next"
        :total="total"
        v-model:current-page="params.page"
      />
    </div>
  </div>
</template>
<script>
import { onMounted, ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    // TODO: img标签自动添加loading="lazy"
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
      }
    }
    const list = ref([])
    const goEdit = (id) => {}
    const deletePost = (id) => {}
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
        // TODO: 去编辑页面
      })
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
    })
    return {
      params,
      total,
      list,
      goEdit,
      deletePost,
      handleAdd,
    }
  },
}
</script>
<style lang=""></style>
