<template>
  <div class="common-right-panel-form common-limit-width">
    <h3 class="common-title">用户设置</h3>
    <div>
      <el-tabs v-model="activeName">
        <el-tab-pane label="资料修改" name="profile">
          <el-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-width="80px"
          >
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="form.nickname"
                placeholder="请输入昵称"
              ></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
              ></el-input>
            </el-form-item>
            <el-form-item label="头像" prop="photo">
              <Cropper
                :aspectRatio="1"
                :width="256"
                :height="256"
                @crop="setPhoto"
                :src="form.photo"
              />
            </el-form-item>
            <el-form-item label="简介" prop="description">
              <el-input
                v-model="form.description"
                placeholder="请输入简介"
                type="textarea"
              ></el-input>
            </el-form-item>
            <!-- 封面图 -->
            <el-form-item label="封面图" prop="cover">
              <div class="login-usercover-image-item" v-if="coverData">
                <el-image
                  :src="`${
                    coverData.thumfor || coverData.filepath
                  }?s=${$formatTimestamp(coverData.updatedAt)}`"
                  fit="contain"
                  @click="openPreviewer"
                  style="width: 100%; height: 100%"
                />
                <!-- 删除按钮 -->
                <div
                  class="login-usercover-image-item-change"
                  @click="coverData = null"
                >
                  <el-icon><Close /></el-icon>
                </div>
              </div>
              <div
                class="login-usercover-image-item type-add"
                @click="openAttachmentsDialog"
                v-else
              >
                <div class="dflex flexCenter w_10 full-height">
                  <el-icon size="32px"><Plus /></el-icon>
                </div>
              </div>
              <div class="w_10 mt5" v-if="coverData">
                <el-button type="primary" @click="openAttachmentsDialog">
                  更换封面图
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="密码修改" name="password">
          <el-form
            :model="formPassword"
            :rules="rulesPassword"
            ref="formRefPassword"
            label-width="80px"
          >
            <el-form-item label="原密码" prop="currentPassword">
              <el-input
                v-model="formPassword.currentPassword"
                placeholder="如需更改密码，请输入原密码"
                type="password"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formPassword.password"
                placeholder="如需更改密码，请输入新密码"
                type="password"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="formPassword.confirmPassword"
                placeholder="如需更改密码，请再次输入新密码"
                type="password"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitPassword">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <AttachmentsDialog
      :shouldSelectOk="true"
      ref="attachmentsDialogRef"
      :selectLimit="1"
      :typeList="['image']"
      @selectAttachments="selectAttachments"
    />
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
// ElMessage
import { ElMessage } from 'element-plus'
import AttachmentsDialog from '@/components/AttachmentsDialog'
import { loadAndOpenImg } from '@/utils/utils'

export default {
  components: {
    AttachmentsDialog,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const activeName = ref('profile')
    const formRef = ref(null)
    const formRefPassword = ref(null)
    const coverData = ref(null)
    const form = reactive({
      nickname: '',
      email: '',
      photo: '',
      description: '',
      cover: null,
    })
    const formPassword = reactive({
      currentPassword: '',
      password: '',
      confirmPassword: '',
    })
    const rules = computed(() => {
      const rules = {
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur',
          },
        ],
      }
      return rules
    })
    const rulesPassword = computed(() => {
      const passwordReg =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/
      const rules = {
        currentPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: passwordReg,
            message: '密码必须包含大小写字母、数字、特殊字符',
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== formPassword.password) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      }
      return rules
    })

    const setForm = () => {
      authApi
        .loginuserinfo()
        .then((res) => {
          const data = res.data.data
          form.nickname = data.nickname
          form.email = data.email
          form.photo = data.photo
          form.description = data.description
          if (data.cover) {
            coverData.value = data.cover
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }

    const submit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          const newForm = { ...form }
          if (coverData.value) {
            newForm.cover = coverData.value._id
          }
          authApi
            .updateLoginUserInfo(newForm)
            .then((res) => {
              setForm()
              store.dispatch('setAdminInfo')
              ElMessage.success('资料修改成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }

    const submitPassword = () => {
      formRefPassword.value.validate((valid) => {
        if (valid) {
          authApi
            .updateLoginUserInfo(formPassword)
            .then((res) => {
              // 清空密码
              formPassword.currentPassword = ''
              formPassword.password = ''
              formPassword.confirmPassword = ''
              // 清除token
              localStorage.removeItem('adminToken')
              store.dispatch('setAdminToken', '')
              // 登出
              router.replace({
                name: 'Login',
              })
              // 提示
              ElMessage.success('密码修改成功，请重新登录')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }

    const setPhoto = (base64) => {
      form.photo = base64
    }

    // 附件
    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })
    const attachmentsDialogRef = ref(null)
    const openAttachmentsDialog = () => {
      attachmentsDialogRef.value.open()
    }
    const selectAttachments = (attachments) => {
      console.log(attachments)
      coverData.value = attachments[0]
    }
    const openPreviewer = () => {
      const item = coverData.value
      const mimetype = item.mimetype
      const { filepath, width, height } = item
      loadAndOpenImg(0, [
        {
          src: `${siteUrl.value}${filepath}`,
          width,
          height,
          mimetype,
        },
      ])
    }

    onMounted(() => {
      setForm()
    })
    return {
      activeName,
      formRef,
      formRefPassword,
      coverData,
      form,
      formPassword,
      rules,
      rulesPassword,
      submit,
      submitPassword,
      setPhoto,
      // 附件
      attachmentsDialogRef,
      openAttachmentsDialog,
      selectAttachments,
      openPreviewer,
    }
  },
}
</script>
<style lang="less" scoped></style>
