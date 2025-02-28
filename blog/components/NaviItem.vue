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
      <Transition
        name="collapse"
        @enter="enter"
        @after-enter="afterEnter"
        @leave="leave"
        @after-leave="afterLeave"
      >
        <ul
          class="blog-layout-sidebar-item-children-body"
          v-show="showChildren"
        >
          <template v-for="(item, index) in item.children" :key="index">
            <NaviItem :item="item" :currentPath="currentPath" />
          </template>
        </ul>
      </Transition>
    </template>
    <template v-else-if="item.isdefault && !item.newtab">
      <div
        class="blog-layout-sidebar-item active"
        v-if="item.url === currentPath"
      >
        <span>{{ item.naviname }}</span>
      </div>
      <nuxt-link
        class="blog-layout-sidebar-item"
        v-else
        :to="item.url + (item.query || '')"
      >
        <span>{{ item.naviname }}</span>
      </nuxt-link>
    </template>
    <template v-else>
      <!-- 非本站链接 -->
      <a
        class="blog-layout-sidebar-item"
        :class="{ active: item.url === currentPath }"
        :href="item.url + (item.query || '')"
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
const props = defineProps({
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

const enter = (el) => {
  el.style.overflow = 'hidden'
  el.style.height = '0'

  nextFrame(() => {
    el.style.height = `${el.scrollHeight}px`
  })
}

const leave = (el) => {
  el.style.overflow = 'hidden'
  el.style.height = `${el.scrollHeight}px`

  nextFrame(() => {
    el.style.height = '0'
  })
}

const afterEnter = (el) => {
  el.style.height = ''
  el.style.overflow = ''
}

const afterLeave = (el) => {
  el.style.height = ''
  el.style.overflow = ''
}
</script>
<style scoped>
.blog-layout-sidebar-item {
  width: 100%;
  height: 40px;
  padding: 0 18px;
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
  border: 1px solid rgba(255, 255, 255, 0);
}
.blog-layout-sidebar-item.active {
  @apply bg-primary-500 text-white;
}

.blog-layout-sidebar-item:hover {
  @apply border border-primary-500 text-primary-500;
}

.blog-layout-sidebar-item.active:hover {
  @apply border border-primary-500 text-white;
}
.blog-layout-sidebar-item-children-body .blog-layout-sidebar-item {
  padding-left: 35px;
}
</style>
