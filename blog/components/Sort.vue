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
            >
              {{ item.sortname }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { getSortListApi } from '@/api/sort'
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
  margin-top: 1px;
}
.sort-list-children-body {
  padding-left: 10px;
}
.sort-list-item-link {
  display: block;
  text-decoration: none;
  font-size: 12px;
  background: #fffdfd;
  color: #3c3c3c;
  padding: 0.5em;
  transition: all 0.25s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.sort-list-item-link:hover {
  background: #e8e8e8;
  background: #f8f8f8;
  padding-left: 10px;
}
</style>
