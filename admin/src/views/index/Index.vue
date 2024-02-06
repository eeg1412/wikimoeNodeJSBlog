<template>
  <div class="common-layout">
    <el-container>
      <el-aside
        class="common-aside custom-scroll scroll-not-hide"
        :class="{ isCollapse: isCollapse, phoneMenuOpen: phoneMenuOpen }"
      >
        <div class="common-aside-body">
          <div
            class="common-aside-collapse-btn dflex flexCenter"
            @click="switchCollapse"
          >
            <el-icon v-if="isCollapse"><ArrowRight /></el-icon>
            <el-icon v-else><ArrowLeft /></el-icon>
          </div>
          <div class="common-logo">
            <div>博客管理后台</div>
            <div class="common-logo-close-btn">
              <el-button text :icon="Close" @click="switchOpenMenu"></el-button>
            </div>
          </div>
          <el-menu
            :default-active="activeIndex"
            router
            class="admin-left-menu-body custom-scroll scroll-not-hide"
          >
            <el-menu-item
              index="Home"
              @click="removeParam(null)"
              @click.middle="openNewTab('Home')"
              :route="{ name: 'Home' }"
            >
              <i class="fas fa-home pr10"></i>
              <template #title>面板</template>
            </el-menu-item>
            <el-menu-item
              index="SortList"
              @click="removeParam('SortList')"
              @click.middle="openNewTab('SortList')"
              :route="{ name: 'SortList' }"
            >
              <i class="fas fa-folder pr10"></i>
              <template #title>分类</template>
            </el-menu-item>
            <!-- 标签 -->
            <el-menu-item
              index="TagList"
              @click="removeParam('TagList')"
              @click.middle="openNewTab('TagList')"
              :route="{ name: 'TagList' }"
            >
              <i class="fas fa-tags pr10"></i>
              <template #title>标签</template>
            </el-menu-item>
            <!-- 媒体库 -->
            <el-menu-item
              index="AlbumList"
              @click="removeParam('AlbumList')"
              @click.middle="openNewTab('AlbumList')"
              :route="{ name: 'AlbumList' }"
            >
              <i class="fas fa-images pr10"></i>
              <template #title>媒体库</template>
            </el-menu-item>
            <el-menu-item
              index="PostList"
              @click="removeParam('PostList')"
              @click.middle="openNewTab('PostList')"
              :route="{ name: 'PostList' }"
            >
              <i class="fas fa-newspaper pr10"></i>
              <template #title>文章</template>
            </el-menu-item>
            <!-- 评论 -->
            <el-menu-item
              index="CommentList"
              @click="removeParam('CommentList')"
              @click.middle="openNewTab('CommentList')"
              :route="{ name: 'CommentList' }"
            >
              <i class="fas fa-comments pr10"></i>
              <template #title>评论</template>
            </el-menu-item>
            <!-- 友链 -->
            <el-menu-item
              index="LinkList"
              @click="removeParam('LinkList')"
              @click.middle="openNewTab('LinkList')"
              :route="{ name: 'LinkList' }"
            >
              <i class="fas fa-link pr10"></i>
              <template #title>友链</template>
            </el-menu-item>
            <!-- 导航 -->
            <el-menu-item
              index="NaviList"
              @click="removeParam('NaviList')"
              @click.middle="openNewTab('NaviList')"
              :route="{ name: 'NaviList' }"
            >
              <i class="fas fa-compass pr10"></i>
              <template #title>导航</template>
            </el-menu-item>
            <!-- 侧边栏 -->
            <el-menu-item
              index="SidebarList"
              @click="removeParam('SidebarList')"
              @click.middle="openNewTab('SidebarList')"
              :route="{ name: 'SidebarList' }"
            >
              <i class="fas fa-columns pr10"></i>
              <template #title>侧边栏</template>
            </el-menu-item>
            <!-- 横幅 -->
            <el-menu-item
              index="BannerList"
              @click="removeParam('BannerList')"
              @click.middle="openNewTab('BannerList')"
              :route="{ name: 'BannerList' }"
            >
              <i class="fas fa-image pr10"></i>
              <template #title>横幅</template>
            </el-menu-item>
            <!-- 追番 BangumiList -->
            <el-menu-item
              index="BangumiList"
              @click="removeParam('BangumiList')"
              @click.middle="openNewTab('BangumiList')"
              :route="{ name: 'BangumiList' }"
            >
              <i class="fas fa-tv pr10"></i>
              <template #title>追番</template>
            </el-menu-item>
            <el-sub-menu index="history">
              <template #title>
                <!-- 日志图标 -->
                <i class="fas fa-book pr10"></i>日志
              </template>
              <!-- 文章点赞日志 PostLikeLogList -->
              <el-menu-item
                index="PostLikeLogList"
                @click="removeParam('PostLikeLogList')"
                @click.middle="openNewTab('PostLikeLogList')"
                :route="{ name: 'PostLikeLogList' }"
              >
                <i class="fas fa-thumbs-up pr10"></i>
                <template #title> 文章点赞日志</template>
              </el-menu-item>
              <!-- 评论点赞日志 CommentLikeLogList -->
              <el-menu-item
                index="CommentLikeLogList"
                @click="removeParam('CommentLikeLogList')"
                @click.middle="openNewTab('CommentLikeLogList')"
                :route="{ name: 'CommentLikeLogList' }"
              >
                <i class="fas fa-thumbs-up pr10"></i>
                <template #title>评论点赞日志</template>
              </el-menu-item>
              <!-- 读者访问日志 ReaderlogList -->
              <el-menu-item
                index="ReaderlogList"
                @click="removeParam('ReaderlogList')"
                @click.middle="openNewTab('ReaderlogList')"
                :route="{ name: 'ReaderlogList' }"
              >
                <i class="fas fa-user-clock pr10"></i>
                <template #title>读者访问日志</template>
              </el-menu-item>
              <!-- RSS访问日志 RsslogList -->
              <el-menu-item
                index="RsslogList"
                @click="removeParam('RsslogList')"
                @click.middle="openNewTab('RsslogList')"
                :route="{ name: 'RsslogList' }"
              >
                <i class="fas fa-rss pr10"></i>
                <template #title>RSS访问日志</template>
              </el-menu-item>
              <!-- 邮件发送日志  EmailSendHistoryList -->
              <el-menu-item
                index="EmailSendHistoryList"
                @click="removeParam('EmailSendHistoryList')"
                @click.middle="openNewTab('EmailSendHistoryList')"
                :route="{ name: 'EmailSendHistoryList' }"
              >
                <i class="fas fa-envelope pr10"></i>
                <template #title>邮件发送日志</template>
              </el-menu-item>
              <!-- 引用日志 ReferrerList -->
              <el-menu-item
                index="ReferrerList"
                @click="removeParam('ReferrerList')"
                @click.middle="openNewTab('ReferrerList')"
                :route="{ name: 'ReferrerList' }"
              >
                <i class="fas fa-external-link-alt pr10"></i>
                <template #title>引用日志</template>
              </el-menu-item>
            </el-sub-menu>
            <!-- 设置 -->
            <el-menu-item
              index="Config"
              @click="removeParam('Config')"
              @click.middle="openNewTab('Config')"
              :route="{ name: 'Config' }"
            >
              <i class="fas fa-cog pr10"></i>
              <template #title>设置</template>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      <el-container>
        <el-header class="common-header">
          <div class="clearfix">
            <div class="fl pt5 switch-btn-body-phone">
              <el-button
                type="primary"
                :icon="Grid"
                @click="switchOpenMenu"
              ></el-button>
            </div>
            <template v-if="adminInfo">
              <div class="fr pt5">
                <el-button type="primary" circle text @click="logout">
                  <i class="fas fa-sign-out-alt"></i>
                </el-button>
              </div>
              <div class="fr pt5">
                <el-button type="primary" circle text @click="goToBlog">
                  <i class="fas fa-home"></i>
                </el-button>
              </div>
              <div class="fr pt5">
                <el-button
                  type="primary"
                  circle
                  text
                  @click="goLoginUserEditor"
                >
                  <i class="fas fa-user-edit"></i>
                </el-button>
              </div>
              <div class="fr pt10 mr10 fb">
                {{ adminInfo.nickname }}
              </div>
            </template>
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
import {
  SwitchButton,
  Setting,
  Fold,
  Expand,
  DArrowRight,
  DArrowLeft,
  Grid,
  Close,
  HomeFilled,
} from '@element-plus/icons-vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    const activeIndex = computed(() => {
      return route.name
    })

    const removeParam = (key) => {
      if (key) {
        sessionStorage.removeItem(key)
      }
      phoneMenuOpen.value = false
    }
    const logout = () => {
      router.replace({
        name: 'Login',
      })
      // 清除token
      localStorage.removeItem('adminToken')
      sessionStorage.removeItem('adminToken')
    }

    const adminInfo = computed(() => {
      return store.getters.adminInfo
    })
    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const goToBlog = () => {
      // 如果没有设置站点地址，报错
      if (!siteUrl.value) {
        ElMessage.error('请先设置站点地址')
        return
      }
      window.open(siteUrl.value, '_blank')
    }

    const goLoginUserEditor = () => {
      router.push({
        name: 'LoginUserEditor',
      })
    }

    const isCollapse = ref(false)
    const switchCollapse = () => {
      isCollapse.value = !isCollapse.value
    }
    const phoneMenuOpen = ref(false)
    const switchOpenMenu = () => {
      phoneMenuOpen.value = !phoneMenuOpen.value
    }

    const openNewTab = (name) => {
      const routeData = router.resolve({
        name: name,
      })
      window.open(routeData.href, '_blank')
    }

    onMounted(() => {
      store.dispatch('setAdminInfo')
      store.dispatch('setOptions')
    })
    return {
      SwitchButton,
      Setting,
      Fold,
      Expand,
      DArrowRight,
      DArrowLeft,
      Grid,
      Close,
      HomeFilled,
      activeIndex,
      removeParam,
      logout,
      adminInfo,
      siteUrl,
      goToBlog,
      goLoginUserEditor,
      isCollapse,
      switchCollapse,
      phoneMenuOpen,
      switchOpenMenu,
      openNewTab,
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
  height: 45px;
}
.common-aside {
  width: 200px;
  border-right: 1px solid #dee2e6;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}
.common-aside.isCollapse {
  width: 8px;
}
.common-aside-body {
  width: 200px;
}
.common-layout .el-menu {
  border-right: 0px;
}
.common-logo {
  padding: 20px 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}
.common-logo img {
  width: 50%;
}
.switch-btn-body {
  display: block;
}
.switch-btn-body-phone {
  display: none;
}
.common-logo-close-btn {
  display: none;
}
.common-aside-collapse-btn {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 8px;
  cursor: pointer;
  background-color: #fdfdfd;
  color: #979797;
  font-size: 10px;
}
.common-aside-collapse-btn:hover {
  background-color: #f9f9f9;
}
.admin-left-menu-body {
  height: calc(100dvh - 62px);
  overflow: auto;
  margin-right: 10px;
}
/* 媒体查询 手机模式 */
@media (max-width: 767px) {
  /* 在手机模式下应用以下样式 */
  .switch-btn-body {
    display: none;
  }
  .switch-btn-body-phone {
    display: block;
  }
  .common-logo-close-btn {
    display: block;
  }
  .common-aside {
    width: 0px;
    display: none;
    border-right: none;
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    height: 100%;
    background: #fff;
  }
  .common-aside-body {
    width: 100%;
  }
  .common-logo {
    padding: 10px 0;
    font-size: 14px;
    position: relative;
  }
  .common-logo-close-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
  .common-aside-collapse-btn {
    display: none;
  }
  /* phoneMenuOpen */
  .common-aside.phoneMenuOpen {
    display: block;
    width: 100%;
  }
}
</style>
