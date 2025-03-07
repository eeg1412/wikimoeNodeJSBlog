<template>
  <div class="common-layout">
    <div>
      <!-- 主题切换控制 -->
      <div class="theme-controls">
        <!-- 系统支持主题检测时显示跟随系统选项 -->
        <label v-if="systemPreferenceSupported" class="theme-switch">
          <input
            type="checkbox"
            :checked="followSystem"
            @change="toggleFollowSystem(!followSystem)"
          />
          <span>跟随系统主题</span>
        </label>

        <!-- 手动主题切换 -->
        <div v-if="!followSystem || !systemPreferenceSupported">
          <button
            :class="{ active: theme === 'light' }"
            @click="setTheme('light')"
          >
            🌞 亮色
          </button>
          <button
            :class="{ active: theme === 'dark' }"
            @click="setTheme('dark')"
          >
            🌙 暗色
          </button>
        </div>
      </div>
    </div>
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
            <div class="common-aside-collapse-btn-icon">
              <el-icon v-if="isCollapse"><ArrowRight /></el-icon>
              <el-icon v-else><ArrowLeft /></el-icon>
            </div>
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
              <i class="fas fa-fw fa-home pr10"></i>
              <template #title>面板</template>
            </el-menu-item>
            <el-menu-item
              index="SortList"
              @click="removeParam('SortList')"
              @click.middle="openNewTab('SortList')"
              :route="{ name: 'SortList' }"
            >
              <i class="fas fa-fw fa-folder pr10"></i>
              <template #title>分类</template>
            </el-menu-item>
            <!-- 标签 -->
            <el-menu-item
              index="TagList"
              @click="removeParam('TagList')"
              @click.middle="openNewTab('TagList')"
              :route="{ name: 'TagList' }"
            >
              <i class="fas fa-fw fa-tags pr10"></i>
              <template #title>标签</template>
            </el-menu-item>
            <!-- 媒体库 -->
            <el-menu-item
              index="AlbumList"
              @click="removeParam('AlbumList')"
              @click.middle="openNewTab('AlbumList')"
              :route="{ name: 'AlbumList' }"
            >
              <i class="fas fa-fw fa-images pr10"></i>
              <template #title>媒体库</template>
            </el-menu-item>
            <el-menu-item
              index="PostList"
              @click="removeParam('PostList')"
              @click.middle="openNewTab('PostList')"
              :route="{ name: 'PostList' }"
            >
              <i class="fas fa-fw fa-newspaper pr10"></i>
              <template #title>文章</template>
            </el-menu-item>
            <!-- 评论 -->
            <el-menu-item
              index="CommentList"
              @click="removeParam('CommentList')"
              @click.middle="openNewTab('CommentList')"
              :route="{ name: 'CommentList' }"
            >
              <i class="fas fa-fw fa-comments pr10"></i>
              <template #title>评论</template>
            </el-menu-item>
            <!-- 友链 -->
            <el-menu-item
              index="LinkList"
              @click="removeParam('LinkList')"
              @click.middle="openNewTab('LinkList')"
              :route="{ name: 'LinkList' }"
            >
              <i class="fas fa-fw fa-link pr10"></i>
              <template #title>友链</template>
            </el-menu-item>
            <!-- 导航 -->
            <el-menu-item
              index="NaviList"
              @click="removeParam('NaviList')"
              @click.middle="openNewTab('NaviList')"
              :route="{ name: 'NaviList' }"
            >
              <i class="fas fa-fw fa-compass pr10"></i>
              <template #title>导航</template>
            </el-menu-item>
            <!-- 侧边栏 -->
            <el-menu-item
              index="SidebarList"
              @click="removeParam('SidebarList')"
              @click.middle="openNewTab('SidebarList')"
              :route="{ name: 'SidebarList' }"
            >
              <i class="fas fa-fw fa-columns pr10"></i>
              <template #title>侧边栏</template>
            </el-menu-item>
            <!-- 横幅 -->
            <el-menu-item
              index="BannerList"
              @click="removeParam('BannerList')"
              @click.middle="openNewTab('BannerList')"
              :route="{ name: 'BannerList' }"
            >
              <i class="fas fa-fw fa-image pr10"></i>
              <template #title>横幅</template>
            </el-menu-item>
            <!-- 番剧 BangumiList -->
            <el-menu-item
              index="BangumiList"
              @click="removeParam('BangumiList')"
              @click.middle="openNewTab('BangumiList')"
              :route="{ name: 'BangumiList' }"
            >
              <i class="fas fa-fw fa-tv pr10"></i>
              <template #title>番剧</template>
            </el-menu-item>
            <!-- 电影 MovieList -->
            <el-menu-item
              index="MovieList"
              @click="removeParam('MovieList')"
              @click.middle="openNewTab('MovieList')"
              :route="{ name: 'MovieList' }"
            >
              <i class="fas fa-fw fa-film pr10"></i>
              <template #title>电影</template>
            </el-menu-item>
            <el-sub-menu index="game">
              <template #title>
                <!-- 游戏 -->
                <i class="fas fa-fw fa-gamepad pr10"></i>游戏
              </template>
              <!-- 游戏平台 GamePlatformList -->
              <el-menu-item
                index="GamePlatformList"
                @click="removeParam('GamePlatformList')"
                @click.middle="openNewTab('GamePlatformList')"
                :route="{ name: 'GamePlatformList' }"
              >
                <i class="fas fa-fw fa-gamepad pr10"></i>
                <template #title>游戏平台</template>
              </el-menu-item>
              <!-- 游戏列表 GameList -->
              <el-menu-item
                index="GameList"
                @click="removeParam('GameList')"
                @click.middle="openNewTab('GameList')"
                :route="{ name: 'GameList' }"
              >
                <i class="fas fa-fw fa-gamepad pr10"></i>
                <template #title>游戏列表</template>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="book">
              <template #title>
                <!-- 书籍 -->
                <i class="fas fa-fw fa-book pr10"></i>书籍
              </template>
              <!-- 书籍类型 BooktypeList -->
              <el-menu-item
                index="BooktypeList"
                @click="removeParam('BooktypeList')"
                @click.middle="openNewTab('BooktypeList')"
                :route="{ name: 'BooktypeList' }"
              >
                <i class="fas fa-fw fa-book pr10"></i>
                <template #title>书籍类型</template>
              </el-menu-item>
              <!-- 书籍列表 BookList -->
              <el-menu-item
                index="BookList"
                @click="removeParam('BookList')"
                @click.middle="openNewTab('BookList')"
                :route="{ name: 'BookList' }"
              >
                <i class="fas fa-fw fa-book pr10"></i>
                <template #title>书籍列表</template>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="event">
              <template #title>
                <!-- 活动 -->
                <i class="fas fa-fw fa-calendar-alt pr10"></i>活动
              </template>
              <!-- 活动类型 -->
              <el-menu-item
                index="EventtypeList"
                @click="removeParam('EventtypeList')"
                @click.middle="openNewTab('EventtypeList')"
                :route="{ name: 'EventtypeList' }"
              >
                <i class="fas fa-fw fa-calendar-alt pr10"></i>
                <template #title>活动类型</template>
              </el-menu-item>
              <!-- 活动列表 EventList -->
              <el-menu-item
                index="EventList"
                @click="removeParam('EventList')"
                @click.middle="openNewTab('EventList')"
                :route="{ name: 'EventList' }"
              >
                <i class="fas fa-fw fa-calendar-alt pr10"></i>
                <template #title>活动列表</template>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="history">
              <template #title>
                <!-- 日志图标 -->
                <i class="fas fa-fw fa-book pr10"></i>日志
              </template>
              <!-- 文章点赞日志 PostLikeLogList -->
              <el-menu-item
                index="PostLikeLogList"
                @click="removeParam('PostLikeLogList')"
                @click.middle="openNewTab('PostLikeLogList')"
                :route="{ name: 'PostLikeLogList' }"
              >
                <i class="fas fa-fw fa-thumbs-up pr10"></i>
                <template #title> 文章点赞日志</template>
              </el-menu-item>
              <!-- 评论点赞日志 CommentLikeLogList -->
              <el-menu-item
                index="CommentLikeLogList"
                @click="removeParam('CommentLikeLogList')"
                @click.middle="openNewTab('CommentLikeLogList')"
                :route="{ name: 'CommentLikeLogList' }"
              >
                <i class="fas fa-fw fa-thumbs-up pr10"></i>
                <template #title>评论点赞日志</template>
              </el-menu-item>
              <!-- 读者操作日志 ReaderlogList -->
              <el-menu-item
                index="ReaderlogList"
                @click="removeParam('ReaderlogList')"
                @click.middle="openNewTab('ReaderlogList')"
                :route="{ name: 'ReaderlogList' }"
              >
                <i class="fas fa-fw fa-user-clock pr10"></i>
                <template #title>读者操作日志</template>
              </el-menu-item>
              <!-- RSS访问日志 RsslogList -->
              <el-menu-item
                index="RsslogList"
                @click="removeParam('RsslogList')"
                @click.middle="openNewTab('RsslogList')"
                :route="{ name: 'RsslogList' }"
              >
                <i class="fas fa-fw fa-rss pr10"></i>
                <template #title>RSS访问日志</template>
              </el-menu-item>
              <!-- 邮件发送日志  EmailSendHistoryList -->
              <el-menu-item
                index="EmailSendHistoryList"
                @click="removeParam('EmailSendHistoryList')"
                @click.middle="openNewTab('EmailSendHistoryList')"
                :route="{ name: 'EmailSendHistoryList' }"
              >
                <i class="fas fa-fw fa-envelope pr10"></i>
                <template #title>邮件发送日志</template>
              </el-menu-item>
              <!-- 引用日志 ReferrerList -->
              <el-menu-item
                index="ReferrerList"
                @click="removeParam('ReferrerList')"
                @click.middle="openNewTab('ReferrerList')"
                :route="{ name: 'ReferrerList' }"
              >
                <i class="fas fa-fw fa-external-link-alt pr10"></i>
                <template #title>引用日志</template>
              </el-menu-item>
            </el-sub-menu>
            <!-- UserList 管理员 -->
            <el-menu-item
              v-if="adminInfo?.role === 999"
              index="UserList"
              @click="removeParam('UserList')"
              @click.middle="openNewTab('UserList')"
              :route="{ name: 'UserList' }"
            >
              <i class="fas fa-fw fa-user pr10"></i>
              <template #title>管理员</template>
            </el-menu-item>
            <!-- BackupList 备份 -->
            <el-menu-item
              index="BackupList"
              @click="removeParam('BackupList')"
              @click.middle="openNewTab('BackupList')"
              :route="{ name: 'BackupList' }"
            >
              <i class="fas fa-fw fa-database pr10"></i>
              <template #title>备份</template>
            </el-menu-item>
            <!-- 设置 -->
            <el-menu-item
              index="Config"
              @click="removeParam('Config')"
              @click.middle="openNewTab('Config')"
              :route="{ name: 'Config' }"
            >
              <i class="fas fa-fw fa-cog pr10"></i>
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
                  <i class="fas fa-fw fa-sign-out-alt"></i>
                </el-button>
              </div>
              <div class="fr pt5">
                <el-button type="primary" circle text @click="goToBlog">
                  <i class="fas fa-fw fa-home"></i>
                </el-button>
              </div>
              <div class="fr pt5">
                <el-button
                  type="primary"
                  circle
                  text
                  @click="goLoginUserEditor"
                >
                  <i class="fas fa-fw fa-user-edit"></i>
                </el-button>
              </div>
              <!-- adminInfo.role 999为站长 990 为管理员 -->
              <div class="fr pt10 fb dflex">
                <div class="common-header-nickname">
                  {{ adminInfo.nickname }}
                </div>
                （<template v-if="adminInfo.role === 999">站长</template
                ><template v-else>管理员</template>）
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
import { useTheme } from '@/composables/useTheme'

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
      sessionStorage.setItem('LoginUserEditor-from', route.name)
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

    const {
      theme,
      systemTheme,
      followSystem,
      systemPreferenceSupported,
      setTheme,
      toggleFollowSystem,
    } = useTheme()

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

      // 主题相关状态
      theme,
      systemTheme,
      followSystem,
      systemPreferenceSupported,

      // 主题切换方法
      setTheme,
      toggleFollowSystem,
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
  width: 191px;
  margin-right: 9px;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
}
.common-aside.isCollapse {
  width: 8px;
  overflow: hidden;
  margin-right: 0px;
}
.common-aside-body {
  width: 100%;
  position: relative;
}
.common-layout .el-menu {
  border-right: 0px;
}
.common-logo {
  padding: 20px 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #ffffff;
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
  position: fixed;
  top: 0;
  left: 191px;
  bottom: 0;
  z-index: 2;
  width: 8px;
  cursor: pointer;
  background-color: #fdfdfd;
  color: #979797;
  font-size: 10px;
  border-right: 1px solid #dee2e6;
}
.common-aside-collapse-btn:hover {
  background-color: #f9f9f9;
}
.isCollapse .common-aside-collapse-btn {
  left: 0px;
}
.admin-left-menu-body {
  overflow: auto;
  /* margin-right: 10px; */
}
.common-header-nickname {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  /* .common-aside-body {
    width: 100%;
  } */
  .common-logo {
    padding: 10px 0;
    font-size: 14px;
    /* position: relative; */
  }
  .common-logo-close-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
  .admin-left-menu-body {
    margin-right: 0;
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
