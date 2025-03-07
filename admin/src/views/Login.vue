<template>
  <div class="login-body">
    <div class="we-login">
      <div class="we-login-theme-changer">
        <ThemeChanger />
      </div>
      <div class="login-logo">
        <div class="pt10">博客管理系统</div>
      </div>
      <div class="tc pb40 pt20">
        <el-form :model="form" label-width="0px">
          <el-form-item label="">
            <el-input v-model="form.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item label="">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="密码"
              @keydown.enter="login"
            />
          </el-form-item>
          <!-- 保持登录 -->
          <el-form-item label-width="0px">
            <el-checkbox v-model="form.remember">保持登录</el-checkbox>
          </el-form-item>
          <el-form-item label-width="0px">
            <div class="login-btn">
              <el-button type="primary" @click="login">登录</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive } from '@vue/reactivity'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import store from '@/store'
import ThemeChanger from '@/components/ThemeChanger.vue'

export default {
  components: {
    ThemeChanger,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const form = reactive({
      username: '',
      password: '',
      remember: false,
    })
    const login = () => {
      if (!form.username) {
        ElMessage.error('请输入用户名')
        return
      }
      if (!form.password) {
        ElMessage.error('请输入密码')
        return
      }
      authApi
        .login(form)
        .then((res) => {
          const { token } = res.data
          store.dispatch('setAdminToken', token)
          // 读取sessionStorage中的lastRoute,如果有信息则尝试跳转到lastRoute中的页面
          const lastRoute = sessionStorage.getItem('lastRoute')
          try {
            if (lastRoute) {
              const lastRouteObj = JSON.parse(lastRoute)
              router.push({
                name: lastRouteObj.name,
                params: lastRouteObj.params,
                query: lastRouteObj.query,
              })
            } else {
              // 需要一个默认跳转的页面
              router.push({
                name: 'Home',
              })
            }
          } catch (error) {
            // 需要一个默认跳转的页面
            console.warn(error)
            router.push({
              name: 'Home',
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
    return {
      form,
      login,
    }
  },
}
</script>
<style scoped>
.login-body {
  width: 100%;
  height: 100%;
  background: #ffffff;
}
.we-login {
  width: 300px;
  padding: 15px 45px 15px 45px;
  border-radius: 8px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  margin: auto;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.login-logo {
  margin: 50px auto 40px;
  text-align: center;
}
.login-logo img {
  width: 90px;
  height: auto;
}
.login-btn {
  width: 70%;
  margin: 20px auto 0 auto;
}
.we-login-theme-changer {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
}
.we-login-theme-changer-title {
  color: var(--el-text-color-regular);
  padding-right: 3px;
}
</style>
<style>
.login-btn .el-button {
  width: 100%;
}
.login-body .el-form-item__label {
  color: #ffffff;
}
.login-body .el-input__wrapper {
  background: rgba(255, 255, 255, 0.8);
}
</style>
