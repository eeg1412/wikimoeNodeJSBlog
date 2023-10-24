<template>
  <div class="common-right-panel-form">
    <h3 class="common-title">用户设置</h3>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
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
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-divider />
    <h3 class="common-title">密码修改</h3>
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
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
// ElMessage
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    const formRef = ref(null)
    const formRefPassword = ref(null)
    const form = reactive({
      nickname: '',
      email: '',
      photo: '',
      description: '',
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
      const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{4,}$/
      const rules = {
        currentPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: passwordReg,
            message: '密码必须4位以上且包含大小写和数字',
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
        })
        .catch((err) => {
          console.log(err)
        })
    }

    const submit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          authApi
            .updateLoginUserInfo(form)
            .then((res) => {
              setForm()
              store.dispatch('setAdminInfo')
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

    onMounted(() => {
      setForm()
    })
    return {
      formRef,
      formRefPassword,
      form,
      formPassword,
      rules,
      rulesPassword,
      submit,
      submitPassword,
      setPhoto,
    }
  },
}
</script>
<style lang="less" scoped></style>
