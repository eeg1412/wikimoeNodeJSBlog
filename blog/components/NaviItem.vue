<template>
  <li>
    <template v-if="item.children && item.children.length > 0">
      <div
        class="blog-layout-sidebar-item pointer"
        @click="showChildren = !showChildren"
      >
        <span>{{ item.naviname }}</span>
        <UIcon
          class="ml5"
          :name="
            showChildren ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          v-if="!item.isdefault"
        />
      </div>
      <ul class="blog-layout-sidebar-item-children-body" v-show="showChildren">
        <template v-for="(item, index) in item.children" :key="index">
          <NaviItem :item="item" :currentPath="currentPath" />
        </template>
      </ul>
    </template>
    <template v-else-if="item.isdefault && !item.newtab">
      <nuxt-link
        class="blog-layout-sidebar-item"
        :class="{ active: item.url === currentPath }"
        :to="item.url"
      >
        <span>{{ item.naviname }}</span>
      </nuxt-link>
    </template>
    <template v-else>
      <!-- 非本站链接 -->
      <a
        class="blog-layout-sidebar-item"
        :class="{ active: item.url === currentPath }"
        :href="item.url"
        :target="item.newtab ? '_blank' : '_self'"
      >
        <span>{{ item.naviname }}</span>
        <UIcon
          class="ml5"
          name="i-heroicons-arrow-top-right-on-square"
          v-if="!item.isdefault"
        />
      </a>
    </template>
  </li>
</template>
<script setup>
// props
const { item } = defineProps({
  item: {
    type: Object,
    required: true,
  },
  currentPath: {
    type: String,
    required: true,
  },
})
const showChildren = ref(false)
</script>
<style scoped>
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
.blog-layout-sidebar-item-children-body .blog-layout-sidebar-item {
  padding-left: 35px;
}
</style>
