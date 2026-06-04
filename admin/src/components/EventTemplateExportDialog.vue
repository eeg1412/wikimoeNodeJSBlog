<template>
  <el-dialog
    v-model="dialogOpen"
    :destroy-on-close="true"
    title="导出 JSON 模板"
    width="80%"
    :lock-scroll="false"
    :align-center="true"
    @closed="closeDialog"
    class="common-max-dialog"
  >
    <div class="event-template-export-body">
      <!-- <el-alert type="info" :closable="false" show-icon class="mb20">
        <template #title>
          将下面的「活动 JSON 模板」和「活动类型列表」一起提供给 AI，让 AI
          按照模板格式整理活动信息，再通过「导入 JSON 模板」批量录入。
        </template>
      </el-alert> -->
      <el-tabs v-model="activeTab">
        <!-- 活动 JSON 模板 -->
        <el-tab-pane label="活动 JSON 模板" name="event">
          <div class="event-template-export-block">
            <div class="event-template-export-block-header">
              <span class="event-template-export-block-title"
                >活动 JSON 模板（数组，可包含多条活动）</span
              >
              <el-button
                type="primary"
                size="small"
                @click="copyToClipboard(eventTemplateJson)"
              >
                <el-icon class="mr5"><CopyDocument /></el-icon>复制
              </el-button>
            </div>
            <el-input
              :model-value="eventTemplateJson"
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 20 }"
              readonly
              class="event-template-export-code"
            ></el-input>
            <div class="event-template-export-tips">
              <p class="mb5">字段说明：</p>
              <ul>
                <li>
                  <b>eventtype</b>：活动类型
                  ID，必须从「活动类型列表」中复制对应的 _id 填写。
                </li>
                <li><b>title</b>：活动标题，必填。</li>
                <li>
                  <b>content</b
                  >：活动正文，普通文本即可，每个换行会自动转换为段落。
                </li>
                <li>
                  <b>startTime</b> /
                  <b>endTime</b>：开始与结束时间，使用带时区的 ISO 8601
                  格式，请沿用模板示例中的时区偏移（即导出者所在时区），结束时间不能早于开始时间。
                </li>
                <li>
                  <b>urlList</b>：相关链接数组，每项包含 text（链接名称）与
                  url（链接地址），无链接可留空数组。
                </li>
              </ul>
            </div>
          </div>
        </el-tab-pane>
        <!-- 活动类型列表 -->
        <el-tab-pane label="活动类型列表" name="eventtype">
          <div class="event-template-export-block">
            <div class="event-template-export-block-header">
              <span class="event-template-export-block-title"
                >活动类型列表 JSON（当前系统中可用的活动类型）</span
              >
              <el-button
                type="primary"
                size="small"
                :disabled="eventtypeListIsLoading"
                @click="copyToClipboard(eventtypeJson)"
              >
                <el-icon class="mr5"><CopyDocument /></el-icon>复制
              </el-button>
            </div>
            <div
              v-if="eventtypeListIsLoading"
              class="event-template-export-loading"
            >
              <el-icon class="is-loading"><Loading /></el-icon>
              <span class="ml5">活动类型加载中...</span>
            </div>
            <el-input
              v-else
              :model-value="eventtypeJson"
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 20 }"
              readonly
              class="event-template-export-code"
            ></el-input>
            <div class="event-template-export-tips">
              <p>
                填写活动的 eventtype 字段时，请使用上方列表中对应活动类型的 _id
                值，确保活动类型能够正确匹配。
              </p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogOpen = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { computed, reactive, ref } from 'vue'
import { authApi } from '@/api'
import { copyToClipboard } from '@/utils/utils'

export default {
  name: 'EventTemplateExportDialog',
  setup() {
    const dialogOpen = ref(false)
    const activeTab = ref('event')

    // 将日期格式化为带本地时区偏移的 ISO 8601 字符串，例如 2026-01-01T10:00:00+09:00
    const toLocalISOString = date => {
      const pad = num => {
        return String(num).padStart(2, '0')
      }
      const year = date.getFullYear()
      const month = pad(date.getMonth() + 1)
      const day = pad(date.getDate())
      const hour = pad(date.getHours())
      const minute = pad(date.getMinutes())
      const second = pad(date.getSeconds())
      // getTimezoneOffset 返回 UTC 与本地的分钟差，东时区为负值
      const offsetMinutes = date.getTimezoneOffset()
      const offsetSign = offsetMinutes <= 0 ? '+' : '-'
      const absOffset = Math.abs(offsetMinutes)
      const offsetHour = pad(Math.floor(absOffset / 60))
      const offsetMinute = pad(absOffset % 60)
      return `${year}-${month}-${day}T${hour}:${minute}:${second}${offsetSign}${offsetHour}:${offsetMinute}`
    }

    // 活动 JSON 模板示例（时间使用导出者所在的本地时区）
    const eventTemplateJson = computed(() => {
      const exampleStart = new Date()
      exampleStart.setHours(10, 0, 0, 0)
      const exampleEnd = new Date()
      exampleEnd.setHours(18, 0, 0, 0)
      const example = [
        {
          eventtype: '活动类型ID（请从活动类型列表中复制对应的 _id）',
          title: '活动标题',
          content: '活动正文第一行\n活动正文第二行（每个换行会自动转换为段落）',
          startTime: toLocalISOString(exampleStart),
          endTime: toLocalISOString(exampleEnd),
          urlList: [
            {
              text: '链接名称',
              url: 'https://example.com'
            }
          ]
        }
      ]
      return JSON.stringify(example, null, 2)
    })

    // 活动类型列表
    const eventtypeList = ref([])
    const eventtypeListIsLoading = ref(false)
    const eventtypeJson = computed(() => {
      const list = eventtypeList.value.map(item => {
        return {
          _id: item._id,
          name: item.name,
          color: item.color
        }
      })
      return JSON.stringify(list, null, 2)
    })
    const getAllEventtypeList = () => {
      eventtypeListIsLoading.value = true
      const params = {
        page: 1,
        size: 999999
      }
      authApi
        .getEventtypeList(params, { noLoading: true })
        .then(res => {
          eventtypeList.value = res.data.list
        })
        .catch(() => {})
        .finally(() => {
          eventtypeListIsLoading.value = false
        })
    }

    const open = () => {
      dialogOpen.value = true
      activeTab.value = 'event'
      getAllEventtypeList()
    }
    const closeDialog = () => {
      dialogOpen.value = false
      eventtypeList.value = []
    }

    return {
      dialogOpen,
      activeTab,
      eventTemplateJson,
      eventtypeJson,
      eventtypeListIsLoading,
      copyToClipboard,
      open,
      closeDialog
    }
  }
}
</script>
<style scoped>
.event-template-export-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.event-template-export-block-title {
  font-weight: bold;
  font-size: 14px;
}
.event-template-export-code :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.6;
}
.event-template-export-tips {
  margin-top: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.8;
}
.event-template-export-tips ul {
  padding-left: 18px;
  list-style: disc;
}
.event-template-export-loading {
  display: flex;
  align-items: center;
  padding: 40px 0;
  justify-content: center;
  color: var(--el-text-color-secondary);
}
@media (max-width: 767px) {
  .event-template-export-block-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
