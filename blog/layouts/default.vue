<template>
  <div class="blog-layout-body" v-if="options">
    <div class="blog-layout-left-body">
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
        <li v-for="(item, index) in naviList" :key="index">
          <nuxt-link
            class="blog-layout-sidebar-item"
            :class="{ active: item.url === currentPath }"
            :to="item.url"
          >
            <span>{{ item.naviname }}</span>
          </nuxt-link>
        </li>
      </ul>
    </div>
    <div class="blog-layout-content-body">
      {{ options }}
      <slot></slot>
    </div>
    <div class="blog-layout-right-body">{{ currentPath }}</div>
  </div>
</template>
<script setup>
import { useOptionStore } from '@/store/options'
import { storeToRefs } from 'pinia'
import { getNaviListApi } from '@/api/navi'
const route = useRoute()
const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)
// sidebar
// const naviList = ref([
//   {
//     title: '首页',
//     path: '/',
//   },
// ])
const { data: naviListData } = await getNaviListApi()
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
  return newList
})
// 当前路由的path
const currentPath = computed(() => {
  return route.path
})
</script>
<style scoped>
/* flex布局 左边固定300px 右边固定300px margin10 */
.blog-layout-body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin: 10px;
  width: 1220px;
  margin: 0 auto;
  padding-top: 15px;
}
.blog-layout-left-body {
  width: 300px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 20px;
  margin-right: 10px;
  box-sizing: border-box;
  flex: 0 0 300px;
}
.blog-layout-content-body {
  background-color: #ffffff;
  border-radius: 20px;
}
.blog-layout-right-body {
  width: 300px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 20px;
  margin-left: 10px;
  box-sizing: border-box;
  flex: 0 0 300px;
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
.blog-layout-sidebar-item {
  width: 100%;
  height: 40px;
  padding: 0 20px;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  color: #171717;
  display: flex;
  box-sizing: border-box;
  border-radius: 40px;
  margin-bottom: 10px;
  /* 垂直居中 */
  align-items: center;
  /* 动画 */
  transition: all 0.3s;
}
.blog-layout-sidebar-item.active {
  color: #ef90a7;
  /* font-weight: 700; */
}

.blog-layout-sidebar-item:hover {
  background: #ef90a7;
  color: #ffffff;
}
</style>
