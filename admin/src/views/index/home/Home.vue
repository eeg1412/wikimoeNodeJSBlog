<template>
  <div class="common-right-panel-form">
    <template v-if="data">
      <div class="pb20">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div>
        <div class="el-descriptions__header">
          <div class="el-descriptions__title">站点统计</div>
          <div class="el-descriptions__extra"></div>
        </div>
        <el-row>
          <el-col :span="8" :xs="12" class="mb15">
            <el-statistic title="博文数量" :value="data.postCount.blogCount" />
          </el-col>
          <el-col :span="8" :xs="12" class="mb15">
            <el-statistic title="推文数量" :value="data.postCount.tweetCount" />
          </el-col>
          <el-col :span="8" :xs="12" class="mb15">
            <el-statistic title="页面数量" :value="data.postCount.pageCount" />
          </el-col>
          <el-col :span="8" :xs="12" class="mb15">
            <el-statistic title="评论数" :value="data.commentCount">
              <template #suffix
                ><span v-if="data.unAuditCommentCount > 0"
                  >(<span class="pointer cRed" @click="goCommentAudit">{{
                    data.unAuditCommentCount
                  }}</span
                  >)</span
                ></template
              >
            </el-statistic>
          </el-col>
          <el-col :span="8" :xs="12" class="mb15">
            <el-statistic
              title="文章阅读数"
              :value="data.postCount.totalViews"
            />
          </el-col>
          <el-col :span="8" :xs="12" class="mb15">
            <el-statistic
              title="文章点赞数"
              :value="data.postCount.totalLikes"
            />
          </el-col>
        </el-row>
        <el-divider />
      </div>
    </template>
    <StatisticsLoadingTime />
    <StatisticsReader />
    <Statistics />
    <el-divider />
    <el-descriptions title="配置信息" v-if="data">
      <el-descriptions-item label="NodeJs版本">{{
        data.nodeVersion
      }}</el-descriptions-item>
      <!-- 管理后台版本 -->
      <el-descriptions-item label="管理后台前端版本"
        >v{{ version }}</el-descriptions-item
      >
      <!-- API版本 -->
      <el-descriptions-item label="API版本"
        >v{{ data.version }}</el-descriptions-item
      >
      <el-descriptions-item label="JSON大小限制">{{
        data.jsonLimit
      }}</el-descriptions-item>
      <el-descriptions-item label="URL编码大小限制">{{
        data.urlencodedLimit
      }}</el-descriptions-item>
      <!-- platform,
      release,
      hostname,
      cpu,
      memory,
      arch,
      uptime -->

      <el-descriptions-item label="操作系统">{{
        data.platform
      }}</el-descriptions-item>
      <el-descriptions-item label="操作系统版本">{{
        data.release
      }}</el-descriptions-item>
      <el-descriptions-item label="主机名">{{
        data.hostname
      }}</el-descriptions-item>
      <el-descriptions-item label="CPU">{{ data.cpu }}</el-descriptions-item>
      <el-descriptions-item label="内存">{{
        data.memory
      }}</el-descriptions-item>
      <el-descriptions-item label="架构">{{ data.arch }}</el-descriptions-item>
      <el-descriptions-item label="运行时间">{{
        data.uptime
      }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import Statistics from '@/components/Statistics.vue'
import StatisticsReader from '@/components/StatisticsReader.vue'
import StatisticsLoadingTime from '@/components/StatisticsLoadingTime.vue'

export default {
  components: {
    Statistics,
    StatisticsReader,
    StatisticsLoadingTime,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const data = ref(null)

    const getDashboard = () => {
      authApi.getDashboard().then((res) => {
        const resData = res.data.data
        // 将内存转换为MB
        resData.memory = (resData.memory / 1024 / 1024).toFixed(2) + 'MB'
        // 将运行时间转换为天/小时/分钟/秒
        const uptime = resData.uptime
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor((uptime % 86400) / 3600)
        const minutes = Math.floor(((uptime % 86400) % 3600) / 60)
        const seconds = Math.floor(((uptime % 86400) % 3600) % 60)
        resData.uptime = `${days}天${hours}小时${minutes}分钟${seconds}秒`
        data.value = res.data.data
      })
    }

    // 去评论审核页面
    const goCommentAudit = () => {
      sessionStorage.setItem(
        'CommentList',
        '{"page":1,"size":50,"keyword":"","status":0}'
      )
      router.push({
        name: 'CommentList',
      })
    }

    const version = process.env.VUE_APP_VERSION

    onMounted(() => {
      getDashboard()
    })

    return {
      data,
      goCommentAudit,
      version,
    }
  },
}
</script>
<style scoped>
.home-chart-body {
  margin-top: 20px;
  width: 100%;
  height: 35vh;
  box-sizing: border-box;
  padding: 5px;
  margin-bottom: 14px;
}
</style>
