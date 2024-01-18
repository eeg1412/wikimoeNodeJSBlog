<template>
  <el-form
    :model="emailSettingsForm"
    :rules="emailSettingsRules"
    ref="emailSettingsFormRef"
    label-width="120px"
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
      </el-form-item>
      <!-- 通知自己模板 -->
      <el-form-item
        label="通知自己模板"
        prop="emailSendToMeTemplate"
        class="blok-form-item"
      >
        <RichEditor5
          v-model:content="emailSettingsForm.emailSendToMeTemplate"
        />
        <!-- siteTitle -->
        <div>${siteTitle}为站点名称</div>
        <div>${title}为文章标题</div>
        <div>${nickname}为评论者昵称</div>
        <div>${comment}为评论内容</div>
      </el-form-item>
      <!-- 通知评论者模板 -->
      <el-form-item
        label="通知评论者模板"
        prop="emailSendToCommenterTemplate"
        class="blok-form-item"
      >
        <RichEditor5
          v-model:content="emailSettingsForm.emailSendToCommenterTemplate"
        />
        <!-- siteTitle -->
        <div>${siteTitle}为站点名称</div>
        <div>${title}为文章标题</div>
        <!-- nickname -->
        <div>${nickname}为评论者昵称</div>
        <div>${comment}为评论内容</div>
        <div>${parentNickname}为被回复者昵称</div>
        <div>${parentComment}为被回复的内容</div>
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
import RichEditor5 from '@/components/RichEditor5'
import { formatResToForm, formatResToObj } from '@/utils/utils'
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  components: {
    RichEditor5,
  },
  setup(props, { emit }) {
    // 邮件设置
    const emailSettingsFormRef = ref(null)
    const emailSettingsForm = reactive({
      // 开启邮件通知
      emailEnable: false,
      // smtp服务器
      emailSmtpHost: '',
      // smtp端口
      emailSmtpPort: '',
      // 发信邮箱
      emailSender: '',
      // 发信密码
      emailPassword: '',
      // 收信邮箱
      emailReceiver: '',
      // 发送选项
      // 收到评论时通知自己,回复评论时通知评论者
      emailSendOptions: [],
      // 通知自己模板
      emailSendToMeTemplate: '',
      // 通知评论者模板
      emailSendToCommenterTemplate: '',
    })
    const emailSendOptions = ref([
      {
        label: '收到评论时通知自己',
        value: 'receiveComment',
      },
      {
        label: '回复评论时通知评论者',
        value: 'replyComment',
      },
    ])
    const emailSettingsRules = computed(() => {
      if (emailSettingsForm.emailEnable) {
        return {
          emailSmtpHost: [
            { required: true, message: '请输入smtp服务器', trigger: 'blur' },
          ],
          emailSmtpPort: [
            { required: true, message: '请输入smtp端口', trigger: 'blur' },
          ],
          emailSender: [
            { required: true, message: '请输入发信邮箱', trigger: 'blur' },
          ],
          emailPassword: [
            { required: true, message: '请输入发信密码', trigger: 'blur' },
          ],
          emailReceiver: [
            { required: true, message: '请输入收信邮箱', trigger: 'blur' },
          ],
        }
      } else {
        return {}
      }
    })
    const emailSettingsSubmit = () => {
      emailSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(emailSettingsForm).forEach((key) => {
            if (key === 'emailSendOptions') {
              // emailSendOptions 为数组，需要转换为字符串，以逗号分隔
              params.push({
                name: key,
                value: emailSettingsForm[key].join(','),
              })
            } else {
              params.push({
                name: key,
                value: emailSettingsForm[key],
              })
            }
          })

          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(emailSettingsForm, obj)
              store.dispatch('setOptions')
              emit('submitSuccess')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }
    const getOptionList = () => {
      // 将emailSettingsForm的key转换为数组
      const params = {
        nameList: [],
      }
      Object.keys(emailSettingsForm).forEach((key) => {
        params.nameList.push(key)
      })
      authApi.getOptionList(params).then((res) => {
        // res.data.data是数组，需要转换为对象
        const obj = formatResToObj(res.data.data)
        formatResToForm(emailSettingsForm, obj)
      })
    }
    onMounted(() => {
      getOptionList()
    })
    return {
      emailSettingsFormRef,
      emailSettingsForm,
      emailSettingsRules,
      emailSendOptions,
      emailSettingsSubmit,
    }
  },
}
</script>
