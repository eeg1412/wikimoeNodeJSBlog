<template>
  <div class="sidebar-sort-body">
    <!-- 遍历 sortListData ul li 以及 children-->
    <ul class="sort-list-body">
      <li
        v-for="(item, index) in sortListData"
        :key="item._id"
        class="sort-list-item"
      >
        <NuxtLink
          :to="{
            name: 'postListSort',
            params: { sortid: item.alias || item._id, page: 1 },
          }"
          class="sort-list-item-link"
          :class="{ active: sortid === item.alias || sortid === item._id }"
        >
          {{ item.sortname }}
        </NuxtLink>

        <ul class="sort-list-children-body">
          <li
            v-for="(item, index) in item.children"
            :key="item._id"
            class="sort-list-item"
          >
            <NuxtLink
              :to="{
                name: 'postListSort',
                params: { sortid: item.alias || item._id, page: 1 },
              }"
              class="sort-list-item-link"
              :class="{ active: sortid === item.alias || sortid === item._id }"
            >
              {{ item.sortname }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="text-center py-4 text-gray-500"
      v-if="sortListData.length === 0"
    >
      <div>暂无内容</div>
    </div>
  </div>
</template>
<script setup>
import { getSortListApi } from '@/api/sort'
const route = useRoute()
const sortid = computed(() => route.params.sortid)
const [sortData] = await Promise.all([getSortListApi()])
const { data: sortListData } = sortData
</script>
<style scoped>
.sidebar-sort-body {
  padding-top: 10px;
}
.sort-list-body,
.sort-list-children-body {
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 100%;
  line-height: 1.5em;
}
.sort-list-item {
  margin-top: 5px;
}
.sort-list-children-body {
  padding-left: 10px;
}
.sort-list-item-link {
  display: block;
  text-decoration: none;
  font-size: 14px;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0);
  color: #3c3c3c;
  padding: 5px 10px;
  transition: all 0.25s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  border-radius: 5px;
}
.sort-list-item-link:hover {
  @apply border border-solid border-primary-500 text-primary-500;
  padding-left: 18px;
}
.sort-list-item-link.active {
  @apply bg-primary-500 text-white dark:bg-primary-500/90 dark:text-gray-900;
}
</style>
