<template>
  <div class="common-right-panel-form" v-if="data">
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
        <el-col :span="8">
          <el-statistic title="博客文章" :value="data.postCount" />
        </el-col>
        <el-col :span="8">
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
        <el-col :span="8">
          <el-statistic title="媒体数" :value="data.attachmentCount" />
        </el-col>
      </el-row>
      <el-divider />
    </div>
    <!-- 访客统计 -->
    <div>
      <div class="el-descriptions__header">
        <div class="el-descriptions__title">访客统计</div>
        <div class="el-descriptions__extra">
          <el-select
            v-model="timeRangeType"
            placeholder="请选择时间范围"
            @change="getDashboardVisitor"
          >
            <el-option
              v-for="item in timeRangeTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </div>
      <el-row>
        <!-- PV -->
        <el-col :span="8">
          <el-statistic title="PV" :value="visitorData.pv" />
        </el-col>
        <!-- IP -->
        <el-col :span="8">
          <el-statistic title="IP" :value="visitorData.uniqueIPCount" />
        </el-col>
      </el-row>
      <el-divider />
    </div>
    <el-descriptions title="服务器信息">
      <el-descriptions-item label="NodeJs版本">{{
        data.nodeVersion
      }}</el-descriptions-item>
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

export default {
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
        '{"page":1,"size":10,"keyword":"","status":0}'
      )
      router.push({
        name: 'CommentList',
      })
    }

    const timeRangeTypeList = [
      { value: 'today', label: '今天' },
      { value: 'yesterday', label: '昨天' },
      { value: 'week', label: '本周' },
      { value: 'month', label: '本月' },
      { value: 'year', label: '今年' },
      { value: 'all', label: '全部' },
    ]
    const timeRangeType = ref('today')
    const visitorData = ref(null)
    const getDashboardVisitor = () => {
      authApi
        .getDashboardVisitor({
          timeRangeType: timeRangeType.value,
        })
        .then((res) => {
          visitorData.value = res.data.data
        })
    }

    onMounted(() => {
      getDashboard()
      getDashboardVisitor()
    })

    return {
      data,
      goCommentAudit,
      timeRangeTypeList,
      timeRangeType,
      visitorData,
      getDashboardVisitor,
    }
  },
}
</script>
<style lang=""></style>
