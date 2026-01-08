<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>老黄历列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getAlmanacList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入关键词"
              style="width: 160px"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="params.status"
              placeholder="请选择状态"
              style="width: 100px"
              clearable
            >
              <el-option label="显示" :value="1"></el-option>
              <el-option label="不显示" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getAlmanacList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <el-button @click="showDefaultDialog = true">添加默认项目</el-button>
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <div class="mb20 list-table-body">
      <el-table
        ref="tableRef"
        height="100%"
        :data="almanacList"
        row-key="_id"
        border
      >
        <el-table-column prop="name" label="项目名称" min-width="200px" />
        <el-table-column prop="good" label="宜的说明" min-width="250px">
          <template #default="{ row }">
            <div :title="row.good" class="pre-wrap">
              {{ $limitStr(row.good, 50) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="bad" label="不宜的说明" min-width="250px">
          <template #default="{ row }">
            <div :title="row.bad" class="pre-wrap">
              {{ $limitStr(row.bad, 50) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="仅周末" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.weekend" type="info">周末</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="effectiveDate" label="生效日期" width="120px" />
        <el-table-column prop="status" label="状态" width="100px">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">显示</el-tag>
            <el-tag v-else type="danger">不显示</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteAlmanac(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="clearfix">
      <el-pagination
        class="fr"
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="currentChange"
      />
    </div>

    <!-- 添加默认项目弹窗 -->
    <el-dialog
      v-model="showDefaultDialog"
      title="选择默认项目"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="default-items-list">
        <el-checkbox-group v-model="selectedDefaults">
          <div
            v-for="(item, index) in defaultActivities"
            :key="index"
            class="default-item"
          >
            <el-checkbox :label="index">
              <span class="default-item-name">{{ item.name }}</span>
            </el-checkbox>
            <div class="default-item-content">
              <div class="default-item-desc">
                <span class="good-tag">宜：</span>{{ item.good }}
              </div>
              <div class="default-item-desc" v-if="item.bad">
                <span class="bad-tag">不宜：</span>{{ item.bad }}
              </div>
              <div class="default-item-tags">
                <el-tag v-if="item.weekend" size="small">仅周末</el-tag>
              </div>
            </div>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDefaultDialog = false">取消</el-button>
          <el-button type="primary" @click="addDefaultItems">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const almanacList = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const params = reactive({
      keyword: '',
      status: null
    })

    const defaultActivities = [
      {
        name: '写单元测试',
        good: '写单元测试将减少出错',
        bad: '写单元测试会降低你的开发效率'
      },
      {
        name: '洗澡',
        good: '你几天没洗澡了？',
        bad: '会把设计方面的灵感洗掉',
        weekend: true
      },
      {
        name: '锻炼一下身体',
        good: '是时候舒展下僵硬的肌肉了',
        bad: '能量没消耗多少，吃得却更多',
        weekend: true
      },
      {
        name: '抽烟',
        good: '抽烟有利于提神，增加思维敏捷，但吸烟仍然有害健康',
        bad: '吸烟有害健康',
        weekend: true
      },
      { name: '白天上线', good: '今天白天上线是安全的', bad: '可能导致灾难性后果' },
      { name: '重构', good: '代码质量得到提高', bad: '你很有可能会陷入泥潭' },
      { name: '使用%t', good: '你看起来更有品位', bad: '别人会觉得你在装逼' },
      {
        name: '跳槽',
        good: '该放手时就放手',
        bad: '鉴于当前的经济形势，你的下一份工作未必比现在强'
      },
      { name: '招人', good: '你面前这位有成为牛人的潜质', bad: '这人会写程序吗？' },
      { name: '面试', good: '面试官今天心情很好', bad: '面试官不爽，会拿你出气' },
      {
        name: '提交辞职申请',
        good: '公司找到了一个比你更能干更便宜的家伙，巴不得你赶快滚蛋',
        bad: '鉴于当前的经济形势，你的下一份工作未必比现在强'
      },
      { name: '申请加薪', good: '老板今天心情很好', bad: '公司正在考虑裁员' },
      {
        name: '晚上加班',
        good: '晚上是程序员精神最好的时候',
        bad: '身心憔悴，早点休息',
        weekend: true
      },
      {
        name: '在妹子面前吹牛',
        good: '改善你矮穷挫的形象',
        bad: '会被识破',
        weekend: true
      },
      {
        name: '在维基萌抽卡',
        good: '大概率抽到了自己心仪的卡',
        bad: '垃圾卡片满天飞',
        weekend: true
      },
      {
        name: '写技术文章',
        good: '新的水文即将诞生',
        bad: '你的博文会被抄袭',
        weekend: true
      },
      { name: '命名变量"%v"', good: '变量名萌萌哒', bad: '这个变量永远引用不到' },
      {
        name: '写超过%l行的方法',
        good: '你的代码组织的很好，长一点没关系',
        bad: '你的代码将混乱不堪，你自己都看不懂'
      },
      {
        name: '提交代码',
        good: '遇到冲突的几率是最低的',
        bad: '你遇到的一大堆冲突会让你觉得自己是不是时间穿越了'
      },
      {
        name: '代码复审',
        good: '发现重要问题的几率大大增加',
        bad: '你什么问题都发现不了，白白浪费时间'
      },
      {
        name: '开会',
        good: '写代码之余放松一下打个盹，有益健康',
        bad: '小心被扣屎盆子背黑锅'
      },
      {
        name: '打守望先锋',
        good: '你将有如神助',
        bad: '你会被虐的很惨',
        weekend: true
      },
      {
        name: '晚上上线',
        good: '晚上是程序员精神最好的时候',
        bad: '你白天已经筋疲力尽了'
      },
      {
        name: '修复BUG',
        good: '你今天对BUG的嗅觉大大提高',
        bad: '新产生的BUG将比修复的更多'
      },
      {
        name: '设计评审',
        good: '设计评审会议将变成头脑风暴',
        bad: '人人筋疲力尽，评审就这么过了'
      },
      {
        name: '需求评审',
        good: '这个需求很简单',
        bad: '公司需要一个能根据手机外壳变化APP皮肤的功能'
      },
      {
        name: '上博客',
        good: '今天发生的事不能错过',
        bad: '今天的博客充满负能量',
        weekend: true
      },
      {
        name: '上AB站',
        good: '还需要理由吗？',
        bad: '发现弹幕评论都是键盘侠',
        weekend: true
      },
      {
        name: '玩冒险岛Online',
        good: '砸出二十五星神装',
        bad: '除非你想把电脑砸了',
        weekend: true
      }
    ]

    const showDefaultDialog = ref(false)
    const selectedDefaults = ref([])

    const getAlmanacList = (isSearch = false) => {
      if (isSearch) {
        currentPage.value = 1
      }
      const data = {
        keyword: params.keyword,
        status: params.status,
        page: currentPage.value,
        pageSize: pageSize.value
      }
      authApi.getAlmanacList(data).then(res => {
        almanacList.value = res.data.list
        total.value = res.data.total
      })
    }

    const currentChange = val => {
      currentPage.value = val
      getAlmanacList()
    }

    const handleAdd = () => {
      router.push({ name: 'AlmanacAdd' })
    }

    const goEdit = id => {
      router.push({ name: 'AlmanacEdit', params: { id } })
    }

    const deleteAlmanac = row => {
      const id = row._id
      const title = escapeHtml(row.name) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除老黄历项目：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteAlmanac({ id }).then(() => {
            ElMessage.success('删除成功')
            getAlmanacList()
          })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
        })
    }

    const addDefaultItems = () => {
      if (selectedDefaults.value.length === 0) {
        ElMessage.warning('请选择要添加的项目')
        return
      }

      // Get today's date as effectiveDate
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayDate = Number(`${year}${month}${day}`)

      const promises = selectedDefaults.value.map(index => {
        const item = defaultActivities[index]
        return authApi.createAlmanac({
          name: item.name,
          good: item.good,
          bad: item.bad,
          weekend: item.weekend || false,
          effectiveDate: todayDate
        })
      })

      Promise.all(promises)
        .then(() => {
          ElMessage.success('添加成功')
          selectedDefaults.value = []
          showDefaultDialog.value = false
          getAlmanacList()
        })
        .catch(err => {
          console.log(err)
        })
    }

    onMounted(() => {
      getAlmanacList()
    })

    return {
      almanacList,
      currentPage,
      pageSize,
      total,
      params,
      defaultActivities,
      showDefaultDialog,
      selectedDefaults,
      getAlmanacList,
      currentChange,
      handleAdd,
      goEdit,
      deleteAlmanac,
      addDefaultItems
    }
  }
}
</script>
<style scoped>
.default-items-list {
  max-height: 500px;
  overflow-y: auto;
}
.default-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.default-item-content {
  margin-left: 24px;
  margin-top: 8px;
}
.default-item-name {
  font-weight: bold;
  font-size: 15px;
}
.default-item-desc {
  font-size: 13px;
  color: #606266;
  margin-top: 5px;
  line-height: 1.5;
}
.good-tag {
  color: #67c23a;
  font-weight: bold;
}
.bad-tag {
  color: #f56c6c;
  font-weight: bold;
}
.default-item-tags {
  margin-top: 8px;
}
</style>
