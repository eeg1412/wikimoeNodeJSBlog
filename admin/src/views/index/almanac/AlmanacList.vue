<template>
  <div class="common-right-panel-form almanac-list-body">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>老黄历管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body"></div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 排序 -->
        <el-button @click="onDragBtnClick">{{
          canDrag ? '完成排序' : '排序'
        }}</el-button>
        <!-- 添加默认项目 -->
        <el-button @click="showDefaultDialog = true">添加默认项目</el-button>
        <!-- 追加 -->
        <el-button type="primary" @click="handleAlmanac">追加</el-button>
      </div>
    </div>
    <!-- 老黄历列表 -->
    <div class="mb20" v-if="almanacSettingsForm.length > 0">
      <draggable
        v-model="almanacSettingsForm"
        group="almanacSettings"
        item-key="_id"
        handle=".handle"
      >
        <template #item="{ element }">
          <div>
            <div class="config-border-item">
              <div
                class="config-border-item-title clearfix"
                :class="{ handle: canDrag }"
                v-show="canDrag"
              >
                <div class="fl pr10">
                  <!-- up-down-left-right -->
                  <i class="fas fa-arrows-alt-v"></i>
                  <span class="pl5 dib">拖动排序</span>
                </div>
              </div>
              <el-form
                :model="element"
                label-width="120px"
                label-position="left"
                class="pt20"
              >
                <!-- name -->
                <el-form-item label="项目名称" prop="name">
                  <el-input
                    v-model="element.name"
                    placeholder="可使用占位符：%v(变量名)、%t(工具)、%l(行数)"
                  ></el-input>
                </el-form-item>
                <!-- good -->
                <el-form-item label="宜的说明" prop="good">
                  <el-input
                    v-model="element.good"
                    type="textarea"
                    :rows="2"
                  ></el-input>
                </el-form-item>
                <!-- bad -->
                <el-form-item label="不宜的说明" prop="bad">
                  <el-input
                    v-model="element.bad"
                    type="textarea"
                    :rows="2"
                  ></el-input>
                </el-form-item>
                <!-- weekend -->
                <el-form-item label="仅周末显示" prop="weekend">
                  <el-switch v-model="element.weekend"></el-switch>
                </el-form-item>
                <!-- effectiveDate -->
                <el-form-item label="生效日期" prop="effectiveDate">
                  <el-input
                    v-model="element.effectiveDate"
                    placeholder="格式：YYYYMMDD，如20240101，留空表示长期有效"
                    type="number"
                  ></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                  <!-- 0不显示 1显示 -->
                  <el-switch
                    v-model="element.status"
                    :active-value="1"
                    :inactive-value="0"
                  ></el-switch>
                </el-form-item>
                <!-- 提交按钮 -->
                <div class="mt10 clearfix">
                  <el-button
                    type="primary"
                    class="fr"
                    @click="almanacSettingsSubmit(element)"
                    >提交更改</el-button
                  >
                  <el-button
                    type="danger"
                    class="fr mr10"
                    @click="almanacSettingsDelete(element)"
                    >删除</el-button
                  >
                </div>
              </el-form>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="mt30" v-else><el-empty description="暂无数据" /></div>

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
            <el-checkbox :label="index" class="default-checkbox">
              <div class="default-item-content">
                <div class="default-item-name">{{ item.name }}</div>
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
            </el-checkbox>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  components: {
    draggable
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    // 老黄历设置
    const almanacSettingsFormRef = ref(null)
    const almanacSettingsForm = ref([])

    // 默认项目数据
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

    const getAlmanacList = () => {
      authApi.getAlmanacList().then(res => {
        almanacSettingsForm.value = res.data.list
      })
    }
    const handleAlmanac = () => {
      authApi
        .createAlmanac({})
        .then(res => {
          // 在前面插入
          almanacSettingsForm.value.unshift(res.data.data)
        })
        .catch(err => {
          console.log(err)
        })
    }
    const almanacSettingsSubmit = item => {
      authApi
        .updateAlmanac(item)
        .then(res => {
          ElMessage.success('更新成功')
        })
        .catch(err => {
          console.log(err)
        })
    }
    const almanacSettingsDelete = row => {
      const id = row._id
      const title = escapeHtml(row.name) || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除老黄历设置：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteAlmanac({ id }).then(() => {
            ElMessage.success('删除成功')
            almanacSettingsForm.value = almanacSettingsForm.value.filter(
              item => item._id !== id
            )
          })
        }
      })
        .then(() => {})
        .catch(error => {
          console.log('Dialog closed:', error)
        })
    }

    const canDrag = ref(false)
    const onDragBtnClick = () => {
      if (canDrag.value) {
        const params = almanacSettingsForm.value.map((item, index) => {
          return {
            _id: item._id,
            taxis: index
          }
        })
        updateAlmanacTaxis({
          almanacList: params
        }).then(res => {
          canDrag.value = false
          getAlmanacList()
        })
      } else {
        canDrag.value = true
      }
    }
    const updateAlmanacTaxis = params => {
      return authApi.updateAlmanacTaxis(params).then(res => {
        ElMessage.success('更新成功')
      })
    }

    const addDefaultItems = () => {
      if (selectedDefaults.value.length === 0) {
        ElMessage.warning('请选择要添加的项目')
        return
      }

      const promises = selectedDefaults.value.map(index => {
        const item = defaultActivities[index]
        return authApi.createAlmanac({
          name: item.name,
          good: item.good,
          bad: item.bad,
          weekend: item.weekend || false
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
      // 老黄历设置
      almanacSettingsFormRef,
      almanacSettingsForm,
      handleAlmanac,
      almanacSettingsSubmit,
      almanacSettingsDelete,
      canDrag,
      onDragBtnClick,
      // 默认项目
      defaultActivities,
      showDefaultDialog,
      selectedDefaults,
      addDefaultItems
    }
  }
}
</script>
<style scoped>
.handle {
  cursor: move;
}
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
.default-checkbox {
  width: 100%;
}
.default-item-content {
  margin-left: 30px;
}
.default-item-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}
.default-item-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
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
