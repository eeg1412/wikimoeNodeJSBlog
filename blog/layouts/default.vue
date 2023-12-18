<template>
  <div v-if="options">
    <!-- 小于1024宽度时出现的顶部栏 -->
    <div class="blog-top-bar">
      <div class="blog-top-bar-body">
        <div class="blog-top-bar-left-body">
          <nuxt-link to="/">
            <img class="blog-top-bar-sitelogo" :src="options.siteLogo" />
          </nuxt-link>
        </div>
        <div class="blog-top-bar-right-body">
          <div class="blog-top-bar-right-body-item">
            <UIcon name="i-heroicons-bars-3" />
          </div>
          <div class="blog-top-bar-right-body-item">
            <UIcon name="i-heroicons-squares-2x2" />
          </div>
        </div>
      </div>
    </div>
    <!-- 整体layout -->
    <div class="blog-layout-body">
      <div class="blog-layout-left-body">
        <div class="blog-layout-sticky custom-scroll blog-layout-info-menu">
          <!-- logo -->
          <div>
            <nuxt-link to="/">
              <img class="blog-layout-sitelogo" :src="options.siteLogo" />
            </nuxt-link>
          </div>
          <!-- siteDescription -->
          <div class="blog-layout-desc">
            <p>{{ options.siteDescription }}</p>
          </div>
          <!-- 导航 -->
          <ul class="blog-layout-sidebar-body">
            <template v-for="(item, index) in naviList" :key="index">
              <NaviItem :item="item" :currentPath="currentPath" />
            </template>
          </ul>
        </div>
      </div>
      <div class="blog-layout-content-body">
        <slot></slot>
      </div>
      <div class="blog-layout-right-body">
        <div class="blog-layout-right-top-body">
          <!-- 搜索 -->
          <div class="blog-search-body">
            <UInput
              v-model="keyword"
              placeholder="请输入关键词"
              size="lg"
              variant="none"
              @keydown.enter="goSearch"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing>
                <UButton
                  color="gray"
                  variant="link"
                  icon="i-heroicons-magnifying-glass-20-solid"
                  :padded="false"
                  @click="goSearch"
                />
              </template>
            </UInput>
          </div>
        </div>
        <div class="blog-layout-right-box">
          <div
            v-for="(item, index) in sidebarListData"
            :key="item._id"
            class="blog-layout-right-sidebar-item"
          >
            <!-- title -->
            <div class="blog-layout-right-title-body">
              {{ item.title }}
            </div>
            <template v-if="item.type === 3">
              <CommentLatest />
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- footer Powered by wikimoeBlog -->
    <div class="blog-footer-body">
      <div class="blog-footer-content-body">
        <span>Powered by </span>
        <a href="https://www.wikimoe.com/" target="_blank">wikimoeBlog</a>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'
import { getNaviListApi } from '@/api/navi'
import { getSidebarListApi } from '@/api/sidebar'
const route = useRoute()
const router = useRouter()
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
// sidebar
// const naviList = ref([
//   {
//     title: '首页',
//     path: '/',
//   },
// ])
const [naviData, sidebarData] = await Promise.all([
  getNaviListApi(),
  getSidebarListApi(),
])

const { data: naviListData } = naviData
const { data: sidebarListData } = sidebarData
const naviList = computed(() => {
  const list = naviListData.value.data
  const newList = [
    {
      naviname: '首页',
      url: '/',
      isdefault: true,
    },
    ...list,
  ]
  // console.log(newList)
  return newList
})
// 当前路由的path
const currentPath = computed(() => {
  return route.path
})

const keyword = ref('')
const goSearch = () => {
  router.push({
    path: `/post/list/keyword/${keyword.value}/1`,
  })
}
</script>
<style scoped>
/* flex布局 左边固定300px 右边固定300px margin10 */
.blog-layout-body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  margin: 10px;
  max-width: 1220px;
  width: 100%;
  margin: 0 auto;
  margin-bottom: 20px;
  margin-top: 15px;
  box-shadow: 0px 0px 10px 0px rgba(239, 144, 167, 0.08);
  border-radius: 20px;
}
.blog-layout-left-body {
  width: 300px;
  box-sizing: border-box;
  flex: 0 0 300px;
  background: #fffdfd;
  border-right: 2px solid #fff7f9;
  /* 左上角,左下角20px 圆角 */
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
.blog-layout-content-body {
  background-color: #ffffff;
  /* 撑开剩余空间 */
  flex: 1;
  overflow: hidden;
}
.blog-layout-right-body {
  width: 300px;
  box-sizing: border-box;
  flex: 0 0 300px;
  background: #fffdfd;
  border-left: 2px solid #fff7f9;
  /* 右上角,右下角20px 圆角 */
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}
.blog-layout-info-menu {
  padding: 20px;
  max-height: 100vh;
  max-height: 100dvh;
  overflow-y: auto;
}
.blog-layout-sticky {
  position: sticky;
  top: 0px;
}
.blog-layout-sitelogo {
  width: 100%;
}
.blog-layout-desc {
  padding: 15px 0;
  border-bottom: 1px solid #e2e2e2;
}
.blog-layout-sidebar-body {
  padding-top: 18px;
}
.blog-footer-body {
  width: 100%;
  height: 105px;
  background: #171717;
}
.blog-footer-content-body {
  max-width: 1220px;
  padding: 0 20px;
  padding-top: 35px;
  margin: 0 auto;
  color: #ffffff;
}
.blog-top-bar {
  display: none;
}
.blog-layout-right-box {
  padding: 0 20px 20px 20px;
}
.blog-search-body {
  border-radius: 10px;
  background: #f5f5f5;
}
.blog-layout-right-top-body {
  padding: 20px;
  position: sticky;
  top: 0px;
  background: #ffffff;
}
.blog-layout-right-title-body {
  font-size: 20px;
  font-weight: 400;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e2e2;
}
.blog-layout-right-sidebar-item {
  margin-bottom: 20px;
}
/* 小于1024时隐藏左右侧边栏 */
@media (max-width: 1024px) {
  .blog-layout-body {
    flex-direction: column;
  }
  .blog-layout-left-body {
    display: none;
  }
  .blog-layout-right-body {
    display: none;
  }
  /* 顶部导航栏 */
  .blog-top-bar {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    background: #ffffff;
    box-shadow: 0px 0px 10px 0px rgba(239, 144, 167, 0.08);
  }
  .blog-top-bar-body {
    max-width: 1220px;
    margin: 0 auto;
    padding: 0 10px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* 底部阴影 */
    box-shadow: 0px 0px 10px 0px rgba(239, 144, 167, 0.08);
  }
  .blog-top-bar-left-body {
    display: flex;
    align-items: center;
  }
  .blog-top-bar-sitelogo {
    height: 40px;
  }
  .blog-top-bar-right-body {
    display: flex;
    align-items: center;
  }
  .blog-top-bar-right-body-item {
    font-size: 20px;
    margin-left: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .blog-layout-body {
    margin-top: 60px;
  }
}
</style>
