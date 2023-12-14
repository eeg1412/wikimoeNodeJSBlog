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
        <template v-for="(item, index) in naviList" :key="index">
          <NaviItem :item="item" :currentPath="currentPath" />
        </template>
      </ul>
    </div>
    <div class="blog-layout-content-body">
      <slot></slot>
    </div>
    <div class="blog-layout-right-body">{{ options }}{{ currentPath }}</div>
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
  console.log(newList)
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
  /* 撑开剩余空间 */
  flex: 1;
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
</style>
