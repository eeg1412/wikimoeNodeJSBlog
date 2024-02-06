<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>访问统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 访客统计 -->
    <div>
      <div class="el-descriptions__header">
        <div class="el-descriptions__title">排名统计</div>
        <div class="el-descriptions__extra">
          <el-select
            v-model="timeRangeType"
            placeholder="请选择时间范围"
            @change="getStatistics"
            style="width: 120px"
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
    </div>
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import moment from 'moment'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
)
moment.locale('zh-cn')

export default {
  components: {
    Line,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const timeRangeTypeList = [
      { value: 'today', label: '今天' },
      { value: 'yesterday', label: '昨天' },
      { value: 'week', label: '本周' },
      { value: 'month', label: '本月' },
      { value: 'year', label: '过去一年' },
    ]
    const timeRangeType = ref('today')
    const rankData = ref(null)
    const getStatistics = () => {
      authApi
        .getStatistics({
          timeRangeType: timeRangeType.value,
        })
        .then((res) => {
          rankData.value = res.data
        })
    }

    onMounted(() => {
      getStatistics()
    })

    return {
      timeRangeTypeList,
      timeRangeType,
      getStatistics,
    }
  },
}
</script>
<style scoped>
.home-chart-body {
  height: 200px;
  margin-top: 20px;
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
}
</style>
