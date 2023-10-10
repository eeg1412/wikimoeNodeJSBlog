<template>
  <div class="common-layout">
    <el-container>
      <el-aside class="common-aside">
        <div class="common-logo">
          <div>博客管理后台</div>
        </div>
        <el-menu :default-active="activeIndex" router>
          <el-menu-item index="Home" :route="{ name: 'Home' }">
            <i class="fas fa-home pr10"></i>
            <template #title>面板</template>
          </el-menu-item>
          <el-menu-item
            index="PostList"
            @click="removeParam('PostList')"
            :route="{ name: 'PostList' }"
          >
            <i class="fas fa-newspaper pr10"></i>
            <template #title>文章</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="common-header">
          <div class="clearfix" v-if="adminInfo">
            <div class="fr pt15">
              <el-button
                type="primary"
                circle
                text
                :icon="SwitchButton"
                @click="logout"
              ></el-button>
            </div>
            <div class="fr pt15">
              <el-button
                type="primary"
                circle
                text
                :icon="Setting"
                @click="goAdminEdit"
              ></el-button>
            </div>
            <div class="fr pt20 mr10">
              {{ adminInfo.nickname }}
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import { ref } from '@vue/reactivity'
import { computed, onMounted } from '@vue/runtime-core'
import { useRoute, useRouter } from 'vue-router'
import { SwitchButton, Setting } from '@element-plus/icons-vue'
import { authApi } from '@/api'
import store from '@/store'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    const activeIndex = computed(() => {
      return route.name
    })

    const removeParam = (key) => {
      sessionStorage.removeItem(key)
    }
    const logout = () => {
      router.replace({
        name: 'Login',
      })
      // 清除token
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
    }

    const adminInfo = computed(() => {
      return store.getters.adminInfo
    })

    const goAdminEdit = () => {
      router.push({
        name: 'AdminEdit',
      })
    }

    onMounted(() => {
      // store.dispatch('setAdminInfo')
    })
    return {
      SwitchButton,
      Setting,
      activeIndex,
      removeParam,
      logout,
      adminInfo,
      goAdminEdit,
    }
  },
}
</script>
<style>
.common-layout,
.common-layout .el-container {
  height: 100%;
}
.common-header {
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}
.common-aside {
  width: 200px;
  border-right: 1px solid #dee2e6;
}
.common-layout .el-menu {
  border-right: 0px;
}
.common-logo {
  padding: 20px 0;
  text-align: center;
}
.common-logo img {
  width: 50%;
}
</style>
