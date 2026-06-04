<template>
  <el-dialog
    v-model="dialogOpen"
    :destroy-on-close="true"
    title="导入 JSON 模板"
    width="90%"
    :lock-scroll="false"
    :align-center="true"
    @closed="closeDialog"
    class="common-max-dialog"
  >
    <div class="event-template-import-body">
      <!-- 步骤条 -->
      <el-steps
        :active="currentStep"
        finish-status="success"
        align-center
        class="mb20 event-template-import-steps"
      >
        <el-step title="粘贴 JSON" description="粘贴整理好的活动数据" />
        <el-step title="解析预览" description="勾选要导入的活动" />
        <el-step title="完成导入" description="批量录入系统" />
      </el-steps>

      <!-- 步骤一：粘贴 JSON -->
      <div v-show="currentStep === 0" class="event-template-import-section">
        <el-alert type="info" :closable="false" show-icon class="mb20">
          <template #title>
            粘贴由「导出 JSON 模板」整理好的活动 JSON
            数组，点击「解析预览」后可勾选需要导入的活动。
          </template>
        </el-alert>
        <el-input
          v-model="jsonText"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 16 }"
          placeholder="请粘贴活动 JSON 数组"
          class="event-template-import-code"
        ></el-input>
      </div>

      <!-- 步骤二：预览 -->
      <div v-show="currentStep === 1" class="event-template-import-section">
        <!-- 统计与选项 -->
        <div class="event-template-import-summary mb10">
          <el-tag type="info" class="mr10"
            >共解析 {{ previewList.length }} 条</el-tag
          >
          <el-tag type="success" class="mr10"
            >可导入 {{ validCount }} 条</el-tag
          >
          <el-tag type="danger" v-if="invalidCount > 0"
            >存在问题 {{ invalidCount }} 条</el-tag
          >
        </div>
        <div class="event-template-import-option mb10">
          <span class="event-template-import-option-label">导入后状态：</span>
          <el-radio-group v-model="importStatus">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">不显示</el-radio>
          </el-radio-group>
        </div>

        <div class="event-template-import-table">
          <ResponsiveTable
            :data="previewList"
            border
            row-key="rowKey"
            scrollbar-always-on
          >
            <!-- 选择 -->
            <ResponsiveTableColumn label="" width="60px">
              <template #header>
                <el-checkbox
                  :model-value="isAllValidSelected"
                  :indeterminate="isIndeterminate"
                  :disabled="validCount === 0"
                  @change="toggleSelectAll"
                />
              </template>
              <template #default="{ row }">
                <el-checkbox v-model="row.selected" :disabled="!row.valid" />
              </template>
            </ResponsiveTableColumn>
            <!-- 校验状态 -->
            <ResponsiveTableColumn label="校验" width="90px">
              <template #default="{ row }">
                <el-tag v-if="row.valid" type="success">通过</el-tag>
                <el-tag v-else type="danger">有问题</el-tag>
              </template>
            </ResponsiveTableColumn>
            <!-- 活动类型 -->
            <ResponsiveTableColumn label="活动类型" width="150px">
              <template #default="{ row }">
                <div
                  v-if="row.matchedEventtype"
                  :style="{ backgroundColor: row.matchedEventtype.color }"
                  class="event-template-import-block"
                >
                  {{ row.matchedEventtype.name }}
                </div>
                <span v-else class="cRed">{{
                  row.rawEventtype || '未填写'
                }}</span>
              </template>
            </ResponsiveTableColumn>
            <!-- 标题 -->
            <ResponsiveTableColumn
              label="标题"
              prop="title"
              width="220px"
              show-overflow-tooltip
            ></ResponsiveTableColumn>
            <!-- 时间 -->
            <ResponsiveTableColumn label="时间" width="320px">
              <template #default="{ row }">
                <span v-if="row.startTimeText || row.endTimeText"
                  >{{ row.startTimeText }} ~ {{ row.endTimeText }}</span
                >
                <span v-else class="cRed">未填写</span>
              </template>
            </ResponsiveTableColumn>
            <!-- 正文预览 -->
            <ResponsiveTableColumn label="正文预览" width="100px">
              <template #default="{ row }">
                <el-link
                  v-if="row.contentHtml"
                  type="primary"
                  @click="openContentPreview(row)"
                  >查看</el-link
                >
                <span v-else>（空）</span>
              </template>
            </ResponsiveTableColumn>
            <!-- 链接 -->
            <ResponsiveTableColumn label="链接" width="180px">
              <template #default="{ row }">
                <div
                  v-for="(item, index) in row.urlList"
                  :key="index"
                  class="event-template-import-url"
                >
                  <el-link
                    :href="item.url"
                    target="_blank"
                    type="primary"
                    underline="never"
                    >{{ item.text }}</el-link
                  >
                </div>
                <span v-if="!row.urlList || row.urlList.length === 0">-</span>
              </template>
            </ResponsiveTableColumn>
            <!-- 问题 -->
            <ResponsiveTableColumn label="问题" width="240px">
              <template #default="{ row }">
                <div
                  v-for="(msg, index) in row.errors"
                  :key="index"
                  class="cRed event-template-import-error"
                >
                  {{ msg }}
                </div>
                <span v-if="row.valid">-</span>
              </template>
            </ResponsiveTableColumn>
          </ResponsiveTable>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <!-- 步骤一按钮 -->
        <template v-if="currentStep === 0">
          <el-button @click="dialogOpen = false">取消</el-button>
          <el-button type="primary" @click="parseJson">解析预览</el-button>
        </template>
        <!-- 步骤二按钮 -->
        <template v-else>
          <el-button @click="goPrevStep">上一步</el-button>
          <el-button
            type="primary"
            :disabled="selectedValidCount === 0"
            :loading="submitting"
            @click="submit"
          >
            导入选中（{{ selectedValidCount }}）
          </el-button>
        </template>
      </span>
    </template>

    <!-- 正文预览弹窗 -->
    <el-dialog
      v-model="contentPreviewVisible"
      :title="contentPreviewTitle"
      width="60%"
      append-to-body
      :lock-scroll="false"
      :align-center="true"
      class="common-max-dialog"
    >
      <div
        class="event-template-import-content-html"
        v-html="contentPreviewHtml"
      ></div>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { computed, ref } from 'vue'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
import { escapeHtml } from '@/utils/utils'

export default {
  name: 'EventTemplateImportDialog',
  emits: ['success'],
  setup(props, { emit }) {
    const dialogOpen = ref(false)
    const currentStep = ref(0)
    const jsonText = ref('')
    const previewList = ref([])
    const importStatus = ref(1)
    const submitting = ref(false)

    // 正文预览弹窗
    const contentPreviewVisible = ref(false)
    const contentPreviewTitle = ref('正文预览')
    const contentPreviewHtml = ref('')
    const openContentPreview = row => {
      contentPreviewTitle.value = row.title
        ? `正文预览：${row.title}`
        : '正文预览'
      contentPreviewHtml.value = row.contentHtml
      contentPreviewVisible.value = true
    }

    // 活动类型映射：_id => { _id, name, color }
    const eventtypeMap = ref({})

    // 解析时间，支持 "2026-01-01 10:00:00" 与 ISO 格式
    const parseDateValue = value => {
      if (value === null || value === undefined || value === '') {
        return null
      }
      if (typeof value !== 'string' && typeof value !== 'number') {
        return null
      }
      let date = new Date(value)
      if (isNaN(date.getTime()) && typeof value === 'string') {
        date = new Date(value.replace(' ', 'T'))
      }
      if (isNaN(date.getTime())) {
        return null
      }
      return date
    }

    // 格式化时间展示
    const formatDateText = date => {
      const pad = num => {
        return String(num).padStart(2, '0')
      }
      const year = date.getFullYear()
      const month = pad(date.getMonth() + 1)
      const day = pad(date.getDate())
      const hour = pad(date.getHours())
      const minute = pad(date.getMinutes())
      const second = pad(date.getSeconds())
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }

    // 正文按换行转换为 <p> 富文本
    const convertContentToHtml = content => {
      if (!content || typeof content !== 'string') {
        return ''
      }
      const lines = content.split('\n')
      const htmlList = lines.map(line => {
        const trimmedLine = line.trim()
        if (trimmedLine === '') {
          return '<p><br></p>'
        }
        return `<p>${escapeHtml(line)}</p>`
      })
      return htmlList.join('')
    }

    // 校验单条 urlList
    const normalizeUrlList = rawUrlList => {
      const result = {
        valid: true,
        list: []
      }
      if (rawUrlList === undefined || rawUrlList === null) {
        return result
      }
      if (!Array.isArray(rawUrlList)) {
        result.valid = false
        return result
      }
      for (let i = 0; i < rawUrlList.length; i++) {
        const item = rawUrlList[i]
        if (!item || typeof item !== 'object') {
          result.valid = false
          return result
        }
        if (typeof item.text !== 'string' || typeof item.url !== 'string') {
          result.valid = false
          return result
        }
        result.list.push({
          text: item.text,
          url: item.url
        })
      }
      return result
    }

    // 获取全部活动类型，构建映射
    const loadEventtypeMap = () => {
      const params = {
        page: 1,
        size: 999999
      }
      return authApi
        .getEventtypeList(params, { noLoading: true })
        .then(res => {
          const map = {}
          res.data.list.forEach(item => {
            const key = String(item._id)
            map[key] = {
              _id: item._id,
              name: item.name,
              color: item.color
            }
          })
          eventtypeMap.value = map
        })
        .catch(() => {
          eventtypeMap.value = {}
        })
    }

    // 构建单条预览数据
    const buildPreviewRow = (item, index) => {
      const errors = []
      const row = {
        rowKey: `row_${index}`,
        valid: true,
        selected: false,
        rawEventtype: '',
        matchedEventtype: null,
        title: '',
        startTimeText: '',
        endTimeText: '',
        startTimeISO: null,
        endTimeISO: null,
        contentPreview: '',
        contentHtml: '',
        urlList: [],
        errors
      }

      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        row.valid = false
        errors.push('数据格式错误，应为对象')
        return row
      }

      // 活动类型
      row.rawEventtype =
        typeof item.eventtype === 'string' ? item.eventtype : ''
      if (!row.rawEventtype || row.rawEventtype.trim() === '') {
        row.valid = false
        errors.push('活动类型必填')
      } else {
        const matched = eventtypeMap.value[row.rawEventtype.trim()]
        if (matched) {
          row.matchedEventtype = matched
        } else {
          row.valid = false
          errors.push('活动类型 ID 不存在，请检查 _id 是否正确')
        }
      }

      // 标题
      if (typeof item.title === 'string' && item.title.trim() !== '') {
        row.title = item.title
      } else {
        row.valid = false
        errors.push('标题必填')
      }

      // 开始时间
      const startDate = parseDateValue(item.startTime)
      if (startDate) {
        row.startTimeText = formatDateText(startDate)
        row.startTimeISO = startDate.toISOString()
      } else {
        row.valid = false
        errors.push('开始时间格式错误或未填写')
      }

      // 结束时间
      const endDate = parseDateValue(item.endTime)
      if (endDate) {
        row.endTimeText = formatDateText(endDate)
        row.endTimeISO = endDate.toISOString()
      } else {
        row.valid = false
        errors.push('结束时间格式错误或未填写')
      }

      // 时间先后校验
      if (startDate && endDate && endDate < startDate) {
        row.valid = false
        errors.push('结束时间不能早于开始时间')
      }

      // 正文
      const rawContent = typeof item.content === 'string' ? item.content : ''
      row.contentHtml = convertContentToHtml(rawContent)
      row.contentPreview = rawContent.replace(/\n/g, ' ').trim()

      // 链接列表
      const urlResult = normalizeUrlList(item.urlList)
      if (urlResult.valid) {
        row.urlList = urlResult.list
      } else {
        row.valid = false
        errors.push('链接列表格式错误，每项需包含 text 与 url')
      }

      // 默认勾选合法项
      row.selected = row.valid
      return row
    }

    // 解析 JSON 并进入下一步
    const parseJson = async () => {
      const text = jsonText.value.trim()
      if (!text) {
        ElMessage.warning('请先粘贴活动 JSON')
        return
      }
      let parsed = null
      try {
        parsed = JSON.parse(text)
      } catch (err) {
        ElMessage.error('JSON 解析失败，请检查格式')
        return
      }
      let list = parsed
      if (!Array.isArray(parsed)) {
        // 允许单个对象
        if (parsed && typeof parsed === 'object') {
          list = [parsed]
        } else {
          ElMessage.error('JSON 格式错误，应为活动数组')
          return
        }
      }
      if (list.length === 0) {
        ElMessage.warning('没有解析到任何活动')
        return
      }

      await loadEventtypeMap()
      previewList.value = list.map((item, index) => {
        return buildPreviewRow(item, index)
      })
      currentStep.value = 1
    }

    // 返回上一步
    const goPrevStep = () => {
      currentStep.value = 0
    }

    // 统计
    const validCount = computed(() => {
      return previewList.value.filter(row => row.valid).length
    })
    const invalidCount = computed(() => {
      return previewList.value.filter(row => !row.valid).length
    })
    const selectedValidCount = computed(() => {
      return previewList.value.filter(row => row.valid && row.selected).length
    })
    const isAllValidSelected = computed(() => {
      if (validCount.value === 0) {
        return false
      }
      return selectedValidCount.value === validCount.value
    })
    const isIndeterminate = computed(() => {
      return (
        selectedValidCount.value > 0 &&
        selectedValidCount.value < validCount.value
      )
    })
    const toggleSelectAll = value => {
      previewList.value.forEach(row => {
        if (row.valid) {
          row.selected = value
        }
      })
    }

    // 提交批量导入
    const submit = () => {
      const selectedRows = previewList.value.filter(
        row => row.valid && row.selected
      )
      if (selectedRows.length === 0) {
        ElMessage.warning('请至少选择一条活动')
        return
      }
      const list = selectedRows.map(row => {
        return {
          eventtype: row.matchedEventtype._id,
          title: row.title,
          color: null,
          urlList: row.urlList,
          content: row.contentHtml,
          startTime: row.startTimeISO,
          endTime: row.endTimeISO,
          status: importStatus.value
        }
      })
      submitting.value = true
      authApi
        .batchCreateEvent({ list })
        .then(res => {
          const count = res.data.data.count
          currentStep.value = 2
          ElMessage.success(`成功导入 ${count} 条活动`)
          emit('success')
          dialogOpen.value = false
        })
        .catch(() => {})
        .finally(() => {
          submitting.value = false
        })
    }

    const open = () => {
      dialogOpen.value = true
      currentStep.value = 0
    }
    const closeDialog = () => {
      dialogOpen.value = false
      currentStep.value = 0
      jsonText.value = ''
      previewList.value = []
      importStatus.value = 1
      submitting.value = false
      contentPreviewVisible.value = false
      contentPreviewHtml.value = ''
    }

    return {
      dialogOpen,
      currentStep,
      jsonText,
      previewList,
      importStatus,
      submitting,
      contentPreviewVisible,
      contentPreviewTitle,
      contentPreviewHtml,
      openContentPreview,
      validCount,
      invalidCount,
      selectedValidCount,
      isAllValidSelected,
      isIndeterminate,
      toggleSelectAll,
      parseJson,
      goPrevStep,
      submit,
      open,
      closeDialog
    }
  }
}
</script>
<style scoped>
.event-template-import-steps {
  margin-top: 8px;
}
.event-template-import-section {
  margin-bottom: 8px;
}
.event-template-import-code :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
}
.event-template-import-option-label {
  margin-right: 10px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.event-template-import-block {
  display: inline-block;
  padding: 2px 6px;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}
.event-template-import-content-html {
  max-height: 60vh;
  overflow-y: auto;
  word-break: break-word;
  line-height: 1.8;
}
.event-template-import-content-html :deep(p) {
  margin: 0 0 8px;
}
.event-template-import-url {
  margin-bottom: 2px;
}
.event-template-import-error {
  font-size: 12px;
  line-height: 1.6;
}
@media (max-width: 767px) {
  .event-template-import-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
