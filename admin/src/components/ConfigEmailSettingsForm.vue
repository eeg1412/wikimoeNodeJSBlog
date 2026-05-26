<template>
  <el-form
    class="config-email-settings-form"
    :model="emailSettingsForm"
    :rules="emailSettingsRules"
    ref="emailSettingsFormRef"
    label-width="120px"
    v-if="inited"
  >
    <el-form-item label="开启邮件通知" prop="emailEnable">
      <el-switch v-model="emailSettingsForm.emailEnable"></el-switch>
    </el-form-item>
    <div class="config-border-item">
      <div class="config-border-item-title">
        SMTP设置<span class="config-border-item-tip"
          >※当开启邮件通知时生效</span
        >
      </div>
      <el-form-item label="SMTP服务器" prop="emailSmtpHost">
        <el-input v-model="emailSettingsForm.emailSmtpHost"></el-input>
      </el-form-item>
      <el-form-item label="SMTP端口" prop="emailSmtpPort">
        <el-input v-model="emailSettingsForm.emailSmtpPort"></el-input>
      </el-form-item>
      <el-form-item label="开启安全协议" prop="emailSmtpSecure">
        <el-switch v-model="emailSettingsForm.emailSmtpSecure"></el-switch>
        <div>
          ※在大多数情况下，如果您连接到465端口时请开启安全协议。对于587端口或25端口，请不要开启。
        </div>
      </el-form-item>
      <el-form-item label="发信邮箱" prop="emailSender">
        <el-input v-model="emailSettingsForm.emailSender"></el-input>
      </el-form-item>
      <el-form-item label="发信密码" prop="emailPassword">
        <el-input
          v-model="emailSettingsForm.emailPassword"
          type="password"
          show-password
        ></el-input>
      </el-form-item>
      <el-form-item label="收信邮箱" prop="emailReceiver">
        <el-input v-model="emailSettingsForm.emailReceiver"></el-input>
        <div>※多个收信邮箱地址可以用英文逗号隔开</div>
      </el-form-item>
      <!-- 通知自己模板 -->
      <el-form-item
        label="通知自己模板"
        prop="emailSendToMeTemplate"
        class="blok-form-item"
      >
        <RichEditor5Switch
          v-model:content="emailSettingsForm.emailSendToMeTemplate"
          v-model:isRichMode="emailSettingsForm.emailSendToMeTemplateIsRichMode"
          v-if="inited"
        />
        <!-- siteTitle -->
        <div>${siteTitle}为带链接的站点名称</div>
        <div>${title}为带链接的文章标题</div>
        <div>${nickname}为评论者昵称</div>
        <div>${comment}为评论内容</div>
      </el-form-item>
      <!-- 通知评论者模板 -->
      <el-form-item
        label="通知评论者模板"
        prop="emailSendToCommenterTemplate"
        class="blok-form-item config-email-commenter-template-item"
      >
        <el-tabs
          v-model="activeCommenterTemplateTab"
          class="config-email-commenter-template-tabs"
        >
          <el-tab-pane label="主站" name="main">
            <div class="config-email-commenter-title-field">
              <div class="config-email-commenter-title-label">邮件标题</div>
              <el-input v-model="emailSettingsForm.emailSendToCommenterTitle" />
            </div>
            <RichEditor5Switch
              v-model:content="emailSettingsForm.emailSendToCommenterTemplate"
              v-model:isRichMode="
                emailSettingsForm.emailSendToCommenterTemplateIsRichMode
              "
              v-if="inited && activeCommenterTemplateTab === 'main'"
            />
          </el-tab-pane>
          <el-tab-pane
            v-for="item in multilingualCommenterTemplateList"
            :key="item.siteLangCode"
            :label="getCommenterTemplateTabLabel(item)"
            :name="item.siteLangCode"
          >
            <div class="config-email-commenter-title-field">
              <div class="config-email-commenter-title-label">邮件标题</div>
              <el-input v-model="item.title" />
            </div>
            <RichEditor5Switch
              v-model:content="item.template"
              v-model:isRichMode="item.templateIsRichMode"
              v-if="inited && activeCommenterTemplateTab === item.siteLangCode"
            />
          </el-tab-pane>
        </el-tabs>

        <!-- siteTitle -->
        <div class="config-email-template-vars">
          <div>${siteTitle}为带链接的站点名称</div>
          <div>${title}为带链接的文章标题</div>
          <!-- nickname -->
          <div>${nickname}为评论者昵称</div>
          <div>${comment}为评论内容</div>
          <div>${parentNickname}为被回复者昵称</div>
          <div>${parentComment}为被回复的内容</div>
        </div>
      </el-form-item>
      <!-- 撤回评论模板 -->
      <el-form-item
        label="撤回评论模板"
        prop="emailRetractCommentTemplate"
        class="blok-form-item"
      >
        <RichEditor5Switch
          v-model:content="emailSettingsForm.emailRetractCommentTemplate"
          v-model:isRichMode="
            emailSettingsForm.emailRetractCommentTemplateIsRichMode
          "
          v-if="inited"
        />
        <!-- siteTitle -->
        <div>${siteTitle}为带链接的站点名称</div>
        <div>${title}为带链接的文章标题</div>
        <div>${nickname}为评论者昵称</div>
        <div>${comment}为评论内容</div>
      </el-form-item>

      <el-form-item label="发送选项" prop="emailSendOptions">
        <el-checkbox-group v-model="emailSettingsForm.emailSendOptions">
          <el-checkbox
            v-for="item in emailSendOptions"
            :key="item.value"
            :label="item.value"
            :name="item.value"
            >{{ item.label }}</el-checkbox
          >
        </el-checkbox-group>
      </el-form-item>
    </div>
    <el-form-item>
      <el-button type="primary" @click="emailSettingsSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import RichEditor5Switch from '@/components/RichEditor5Switch'
import {
  formatResToForm,
  formatResToObj,
  fieldErrorNotice
} from '@/utils/utils'
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage } from 'element-plus'
import { LANGUAGE_CONFIG_LIST } from '@/config/languages'

const MULTILINGUAL_COMMENTER_TEMPLATE_OPTION_NAME =
  'emailSendToCommenterTemplateMultilingualList'
const DEFAULT_COMMENTER_EMAIL_TITLE = '您在【${siteTitle}】发表的评论收到了回复'
const LANGUAGE_CODE_SET = new Set(
  LANGUAGE_CONFIG_LIST.map(languageConfig => {
    return languageConfig.code
  })
)

export default {
  components: {
    RichEditor5Switch
  },
  setup(props, { emit }) {
    // 邮件设置
    const emailSettingsFormRef = ref(null)
    const activeCommenterTemplateTab = ref('main')
    const multilingualCommenterTemplateList = ref([])
    const emailSettingsForm = reactive({
      // 开启邮件通知
      emailEnable: false,
      // smtp服务器
      emailSmtpHost: '',
      // smtp端口
      emailSmtpPort: '',
      // 安全协议
      emailSmtpSecure: true,
      // 发信邮箱
      emailSender: '',
      // 发信密码
      emailPassword: '',
      // 收信邮箱
      emailReceiver: '',
      // 发送选项
      // 收到评论时通知自己,回复评论时通知评论者
      emailSendOptions: [],
      // 收到评论时通知自己模板
      emailSendToMeTemplate: '',
      emailSendToMeTemplateIsRichMode: true,
      // 回复评论时通知评论者模板
      emailSendToCommenterTitle: DEFAULT_COMMENTER_EMAIL_TITLE,
      emailSendToCommenterTemplate: '',
      emailSendToCommenterTemplateIsRichMode: true,
      // 撤回评论时通知自己模板
      emailRetractCommentTemplate: '',
      emailRetractCommentTemplateIsRichMode: true
    })
    const emailSendOptions = ref([
      {
        label: '收到评论时通知自己',
        value: 'receiveComment'
      },
      {
        label: '回复评论时通知评论者',
        value: 'replyComment'
      },
      // 撤回时通知自己
      {
        label: '撤回评论时通知自己',
        value: 'retractComment'
      }
    ])
    const emailSettingsRules = computed(() => {
      if (emailSettingsForm.emailEnable) {
        return {
          emailSmtpHost: [
            { required: true, message: '请输入smtp服务器', trigger: 'blur' }
          ],
          emailSmtpPort: [
            { required: true, message: '请输入smtp端口', trigger: 'blur' }
          ],
          emailSender: [
            { required: true, message: '请输入发信邮箱', trigger: 'blur' },
            // 校验邮箱格式
            {
              type: 'email',
              message: '请输入正确的邮箱格式',
              trigger: ['blur', 'change']
            }
          ],
          emailPassword: [
            { required: true, message: '请输入发信密码', trigger: 'blur' }
          ],
          emailReceiver: [
            { required: true, message: '请输入收信邮箱', trigger: 'blur' },
            // 校验邮箱格式，多个邮箱地址是用英文逗号隔开的
            {
              validator: (rule, value, callback) => {
                if (value) {
                  // 使用正则表达式来匹配邮箱格式
                  const emails = value ? value.split(',') : '' // 分割并去除空格
                  const emailRegex =
                    /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/ // 简单的邮箱正则表达式
                  const invalidEmails = emails.filter(
                    email => !emailRegex.test(email)
                  ) // 筛选出不符合格式的邮箱
                  if (invalidEmails.length > 0) {
                    callback(
                      new Error(
                        '请输入有效的邮箱地址，多个邮箱请用英文逗号隔开'
                      )
                    )
                  } else {
                    callback()
                  }
                } else {
                  callback(new Error('请输入收信邮箱'))
                }
              },
              trigger: 'blur'
            }
          ]
        }
      } else {
        return {}
      }
    })
    const getCommenterTemplateTabLabel = item => {
      return `${item.languageLabel} ${item.siteLangCode}`
    }
    const parseMultilingualCommenterTemplateList = value => {
      if (!value) {
        return []
      }

      let parsedList = null
      try {
        parsedList = JSON.parse(value)
      } catch (error) {
        ElMessage.error('多语言通知评论者模板配置格式无效')
        throw error
      }

      if (!Array.isArray(parsedList)) {
        ElMessage.error('多语言通知评论者模板配置必须是数组')
        throw new Error('multilingual commenter template config must be array')
      }

      const siteLangCodeSet = new Set()
      parsedList.forEach(item => {
        const isValidItem = item && typeof item === 'object'
        if (!isValidItem || Array.isArray(item)) {
          ElMessage.error('多语言通知评论者模板配置项格式无效')
          throw new Error('multilingual commenter template item invalid')
        }

        if (
          typeof item.siteLangCode !== 'string' ||
          !LANGUAGE_CODE_SET.has(item.siteLangCode)
        ) {
          ElMessage.error('多语言通知评论者模板语言 code 无效')
          throw new Error(
            'multilingual commenter template siteLangCode invalid'
          )
        }

        if (siteLangCodeSet.has(item.siteLangCode)) {
          ElMessage.error('多语言通知评论者模板语言 code 重复')
          throw new Error(
            'multilingual commenter template siteLangCode duplicated'
          )
        }
        siteLangCodeSet.add(item.siteLangCode)

        if (typeof item.template !== 'string') {
          ElMessage.error('多语言通知评论者模板内容格式无效')
          throw new Error('multilingual commenter template content invalid')
        }

        if (item.title !== undefined && typeof item.title !== 'string') {
          ElMessage.error('多语言通知评论者标题格式无效')
          throw new Error('multilingual commenter title invalid')
        }

        if (typeof item.templateIsRichMode !== 'boolean') {
          ElMessage.error('多语言通知评论者模板编辑模式格式无效')
          throw new Error(
            'multilingual commenter template rich mode value invalid'
          )
        }
      })

      return parsedList
    }
    const applyMultilingualCommenterTemplateList = value => {
      const savedList = parseMultilingualCommenterTemplateList(value)
      const savedMap = savedList.reduce((map, item) => {
        map[item.siteLangCode] = item
        return map
      }, {})

      multilingualCommenterTemplateList.value = LANGUAGE_CONFIG_LIST.map(
        languageConfig => {
          const templateItem = {
            siteLangCode: languageConfig.code,
            languageLabel: languageConfig.label,
            title: DEFAULT_COMMENTER_EMAIL_TITLE,
            template: '',
            templateIsRichMode: true
          }
          const savedItem = savedMap[languageConfig.code]
          if (savedItem) {
            if (typeof savedItem.title === 'string') {
              templateItem.title = savedItem.title
            }
            templateItem.template = savedItem.template
            templateItem.templateIsRichMode = savedItem.templateIsRichMode
          }
          return templateItem
        }
      )
    }
    const buildMultilingualCommenterTemplateOption = () => {
      const value = multilingualCommenterTemplateList.value.map(item => {
        return {
          siteLangCode: item.siteLangCode,
          title: item.title,
          template: item.template,
          templateIsRichMode: item.templateIsRichMode
        }
      })

      return {
        name: MULTILINGUAL_COMMENTER_TEMPLATE_OPTION_NAME,
        value: JSON.stringify(value)
      }
    }
    const emailSettingsSubmit = () => {
      emailSettingsFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(emailSettingsForm).forEach(key => {
            if (key === 'emailSendOptions') {
              // emailSendOptions 为数组，需要转换为字符串，以逗号分隔
              params.push({
                name: key,
                value: emailSettingsForm[key].join(',')
              })
            } else {
              params.push({
                name: key,
                value: emailSettingsForm[key]
              })
            }
          })
          params.push(buildMultilingualCommenterTemplateOption())

          authApi
            .updateOption({ optionList: params })
            .then(res => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(emailSettingsForm, obj)
              applyMultilingualCommenterTemplateList(
                obj[MULTILINGUAL_COMMENTER_TEMPLATE_OPTION_NAME]
              )
              store.dispatch('setOptions')
              emit('submitSuccess')

              ElMessage.success('更新成功')
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          // 弹窗
          fieldErrorNotice(fields)
          return false
        }
      })
    }
    const inited = ref(false)
    const getOptionList = () => {
      // 将emailSettingsForm的key转换为数组
      const params = {
        nameList: []
      }
      Object.keys(emailSettingsForm).forEach(key => {
        params.nameList.push(key)
      })
      params.nameList.push(MULTILINGUAL_COMMENTER_TEMPLATE_OPTION_NAME)
      authApi
        .getOptionList(params)
        .then(res => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(emailSettingsForm, obj)
          applyMultilingualCommenterTemplateList(
            obj[MULTILINGUAL_COMMENTER_TEMPLATE_OPTION_NAME]
          )
        })
        .finally(() => {
          inited.value = true
        })
    }
    onMounted(() => {
      getOptionList()
    })
    return {
      emailSettingsFormRef,
      emailSettingsForm,
      activeCommenterTemplateTab,
      multilingualCommenterTemplateList,
      emailSettingsRules,
      emailSendOptions,
      getCommenterTemplateTabLabel,
      emailSettingsSubmit,
      inited
    }
  }
}
</script>

<style scoped>
.config-email-commenter-template-tabs {
  width: 100%;
}

.config-email-commenter-template-tabs :deep(.el-tabs__nav-wrap) {
  max-width: 100%;
}

.config-email-commenter-template-tabs :deep(.el-tabs__item) {
  max-width: 180px;
  padding: 0 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-email-commenter-title-field {
  margin-bottom: 12px;
}

.config-email-commenter-title-label {
  margin-bottom: 6px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 1.4;
}

.config-email-template-vars {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 767px) {
  .config-email-settings-form :deep(.el-form-item) {
    display: block;
  }

  .config-email-settings-form :deep(.el-form-item__label) {
    justify-content: flex-start;
    width: 100% !important;
  }

  .config-email-settings-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .config-email-commenter-template-tabs :deep(.el-tabs__item) {
    max-width: 150px;
    padding: 0 10px;
  }
}
</style>
