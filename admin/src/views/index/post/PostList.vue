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
      </div>
    </div>
    <div>
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
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="excerpt" label="摘要" />
        <el-table-column prop="alias" label="别名" />
        <el-table-column prop="author" label="作者" />
        <el-table-column prop="sort" label="分类" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="tags" label="标签" />
        <el-table-column prop="views" label="查看数" />
        <el-table-column prop="comnum" label="评论数" />
        <el-table-column prop="top" label="置顶" />
        <el-table-column prop="sortop" label="分类置顶" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="allowRemark" label="允许评论" />
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
  </div>
</template>
<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  setup() {
    const router = useRouter()
    // TODO: img标签自动添加loading="lazy"
    // let htmlContent = '你的HTML内容'
    // htmlContent = htmlContent.replace(
    //   /<img(?!.*?loading\s*=\s*['"]lazy['"])([^>]*?)>/gi,
    //   '<img loading="lazy" $1>'
    // )
    // console.log(htmlContent)
    const list = ref([])
    const goEdit = (id) => {}
    const deletePost = (id) => {}
    const handleAdd = (type) => {
      authApi.createPost({ type }).then((res) => {
        // TODO: 去编辑页面
      })
    }
    return {
      list,
      goEdit,
      deletePost,
      handleAdd,
    }
  },
}
</script>
<style lang=""></style>
