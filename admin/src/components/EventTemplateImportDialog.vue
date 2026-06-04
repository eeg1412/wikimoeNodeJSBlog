<template>
  <el-dialog
    v-model="dialogOpen"
    :destroy-on-close="true"
    title="导入 JSON 模板"
    width="90%"
    :lock-scroll="false"
    :align-center="true"
    @closed="closeDialog"
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
          <el-tag type="danger" v-if="invalidCount > 0" class="mr10"
            >存在问题 {{ invalidCount }} 条</el-tag
          >
          <el-tag type="warning" v-if="duplicateCount > 0"
            >疑似重复 {{ duplicateCount }} 条</el-tag
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
            :row-class-name="getRowClassName"
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
            <!-- 重复检测 -->
            <ResponsiveTableColumn label="重复" width="160px">
              <template #default="{ row }">
                <div v-if="row.isDuplicate" class="event-template-import-dup">
                  <el-tag type="warning" size="small" effect="dark"
                    >疑似重复 {{ row.duplicateList.length }} 个</el-tag
                  >
                  <el-link
                    type="warning"
                    underline="never"
                    @click="openDuplicatePreview(row)"
                    >查看重合活动</el-link
                  >
                </div>
                <span v-else>-</span>
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
          <el-button type="primary" :loading="parsing" @click="parseJson"
            >解析预览</el-button
          >
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

    <!-- 重合活动弹窗 -->
    <el-dialog
      v-model="duplicateDialogVisible"
      :title="duplicateDialogTitle"
      width="80%"
      append-to-body
      :lock-scroll="false"
      :align-center="true"
      class="common-max-dialog"
    >
      <el-alert type="warning" :closable="false" show-icon class="mb10">
        <template #title>
          左侧为本次「待导入」活动，右侧为数据库中「类型相同、开始与结束日期完全一致」的已有活动，请对比确认是否重复后再决定是否导入。
        </template>
      </el-alert>
      <div class="event-template-import-compare">
        <div
          v-for="(col, colIndex) in duplicateCompareList"
          :key="colIndex"
          class="event-template-import-compare-col"
          :class="{ 'is-current': col.isCurrent }"
        >
          <div class="event-template-import-compare-head">
            <span class="event-template-import-compare-head-label">{{
              col.headLabel
            }}</span>
            <el-tag v-if="col.status === 1" type="success" size="small"
              >显示中</el-tag
            >
            <el-tag v-else-if="col.status === 0" type="info" size="small"
              >未显示</el-tag
            >
          </div>
          <div class="event-template-import-compare-row">
            <div class="event-template-import-compare-row-label">活动类型</div>
            <div class="event-template-import-compare-row-value">
              <span
                v-if="col.eventtypeName"
                :style="{ backgroundColor: col.eventtypeColor }"
                class="event-template-import-block"
                >{{ col.eventtypeName }}</span
              >
              <span v-else class="event-template-import-compare-empty">-</span>
            </div>
          </div>
          <div class="event-template-import-compare-row">
            <div class="event-template-import-compare-row-label">标题</div>
            <div class="event-template-import-compare-row-value">
              {{ col.title }}
            </div>
          </div>
          <div class="event-template-import-compare-row">
            <div class="event-template-import-compare-row-label">开始时间</div>
            <div class="event-template-import-compare-row-value">
              {{ col.startText }}
            </div>
          </div>
          <div class="event-template-import-compare-row">
            <div class="event-template-import-compare-row-label">结束时间</div>
            <div class="event-template-import-compare-row-value">
              {{ col.endText }}
            </div>
          </div>
          <div class="event-template-import-compare-row">
            <div class="event-template-import-compare-row-label">正文</div>
            <div class="event-template-import-compare-row-value">
              <div
                v-if="col.content"
                class="event-template-import-compare-content"
                v-html="col.content"
              ></div>
              <span v-else class="event-template-import-compare-empty"
                >（空）</span
              >
            </div>
          </div>
          <div class="event-template-import-compare-row">
            <div class="event-template-import-compare-row-label">相关链接</div>
            <div class="event-template-import-compare-row-value">
              <template v-if="col.urlList && col.urlList.length > 0">
                <div
                  v-for="(link, linkIndex) in col.urlList"
                  :key="linkIndex"
                  class="event-template-import-compare-link"
                >
                  <el-link
                    :href="link.url"
                    target="_blank"
                    type="primary"
                    underline="never"
                    >{{ link.text }}</el-link
                  >
                </div>
              </template>
              <span v-else class="event-template-import-compare-empty">-</span>
            </div>
          </div>
        </div>
      </div>
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
    const parsing = ref(false)

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

    // 重合活动弹窗
    const duplicateDialogVisible = ref(false)
    const duplicateDialogTitle = ref('重合活动对比')
    const duplicateCompareList = ref([])
    const openDuplicatePreview = row => {
      duplicateDialogTitle.value = row.title
        ? `重合活动对比：${row.title}`
        : '重合活动对比'
      const current = {
        isCurrent: true,
        headLabel: '本次待导入',
        status: null,
        eventtypeName: row.matchedEventtype ? row.matchedEventtype.name : '',
        eventtypeColor: row.matchedEventtype ? row.matchedEventtype.color : '',
        title: row.title,
        startText: row.startTimeText,
        endText: row.endTimeText,
        content: row.contentHtml,
        urlList: row.urlList
      }
      const existCols = (row.duplicateList || []).map(item => {
        return {
          isCurrent: false,
          headLabel: '数据库已有',
          status: item.status,
          eventtypeName: item.eventtypeName,
          eventtypeColor: item.eventtypeColor,
          title: item.title,
          startText: formatExistTime(item.startTime),
          endText: formatExistTime(item.endTime),
          content: item.content,
          urlList: item.urlList
        }
      })
      duplicateCompareList.value = [current, ...existCols]
      duplicateDialogVisible.value = true
    }
    // 重复行高亮
    const getRowClassName = ({ row }) => {
      if (row.isDuplicate) {
        return 'event-template-import-row-duplicate'
      }
      return ''
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

    // 格式化已有活动时间展示
    const formatExistTime = value => {
      const date = parseDateValue(value)
      if (!date) {
        return ''
      }
      return formatDateText(date)
    }

    // 构建单条预览数据
    const buildPreviewRow = (item, index) => {
      const errors = []
      const row = {
        rowKey: `row_${index}`,
        index,
        valid: true,
        selected: false,
        isDuplicate: false,
        duplicateList: [],
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

      parsing.value = true
      try {
        await loadEventtypeMap()
        previewList.value = list.map((item, index) => {
          return buildPreviewRow(item, index)
        })
        await checkDuplicates()
        currentStep.value = 1
      } finally {
        parsing.value = false
      }
    }

    // 与数据库已有活动进行「日完全重合」预检
    const checkDuplicates = async () => {
      const validRows = previewList.value.filter(row => row.valid)
      if (validRows.length === 0) {
        return
      }
      const checkList = validRows.map(row => {
        return {
          index: row.index,
          eventtype: row.matchedEventtype._id,
          startTime: row.startTimeISO,
          endTime: row.endTimeISO
        }
      })
      const timezoneOffsetMinutes = -new Date().getTimezoneOffset()
      try {
        const res = await authApi.checkDuplicateEvent({
          list: checkList,
          timezoneOffsetMinutes
        })
        const duplicates = res.data.data.duplicates || {}
        previewList.value.forEach(row => {
          const matched = duplicates[row.index]
          if (matched && matched.length > 0) {
            row.isDuplicate = true
            row.duplicateList = matched
          } else {
            row.isDuplicate = false
            row.duplicateList = []
          }
        })
      } catch (err) {
        // 预检失败不阻断导入流程，仅不展示重复提示
      }
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
    const duplicateCount = computed(() => {
      return previewList.value.filter(row => row.isDuplicate).length
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
      parsing.value = false
      contentPreviewVisible.value = false
      contentPreviewHtml.value = ''
      duplicateDialogVisible.value = false
      duplicateCompareList.value = []
    }

    return {
      dialogOpen,
      currentStep,
      jsonText,
      previewList,
      importStatus,
      submitting,
      parsing,
      contentPreviewVisible,
      contentPreviewTitle,
      contentPreviewHtml,
      openContentPreview,
      duplicateDialogVisible,
      duplicateDialogTitle,
      duplicateCompareList,
      openDuplicatePreview,
      getRowClassName,
      formatExistTime,
      validCount,
      invalidCount,
      duplicateCount,
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
.event-template-import-dup {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.event-template-import-table :deep(.event-template-import-row-duplicate) {
  --el-table-tr-bg-color: rgba(230, 162, 60, 0.16);
  --el-table-row-hover-bg-color: rgba(230, 162, 60, 0.28);
}
.event-template-import-dup-list {
  max-height: 60vh;
  overflow-y: auto;
}
.event-template-import-compare {
  display: flex;
  gap: 12px;
  max-height: 60vh;
  overflow: auto;
  padding: 0 2px 6px;
  scrollbar-width: thin;
}
.event-template-import-compare::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.event-template-import-compare::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-darker);
  border-radius: 4px;
}
.event-template-import-compare::-webkit-scrollbar-track {
  background-color: transparent;
}
.event-template-import-compare-col {
  flex: 1 0 280px;
  align-self: flex-start;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background-color: var(--el-bg-color);
}
.event-template-import-compare-col.is-current {
  border-color: var(--el-color-primary);
}
.event-template-import-compare-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-weight: 600;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-radius: 6px 6px 0 0;
}
.event-template-import-compare-col.is-current
  .event-template-import-compare-head {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
.event-template-import-compare-row {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.event-template-import-compare-row:last-child {
  border-bottom: none;
}
.event-template-import-compare-row-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.event-template-import-compare-row-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  word-break: break-word;
  line-height: 1.7;
}
.event-template-import-compare-content :deep(p) {
  margin: 0 0 6px;
}
.event-template-import-compare-content :deep(p:last-child) {
  margin-bottom: 0;
}
.event-template-import-compare-link {
  margin-bottom: 2px;
}
.event-template-import-compare-empty {
  color: var(--el-text-color-secondary);
}
@media (max-width: 767px) {
  .event-template-import-compare {
    flex-direction: column;
    flex-wrap: nowrap;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .event-template-import-compare-col {
    flex: none;
    width: 100%;
    align-self: stretch;
  }
}
@media (max-width: 767px) {
  .event-template-import-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
