<template>
  <div class="flex">
    <div class="w-1/3 p-2">
      <button
        class="post-list-type-btn block w-full rounded-md transition ease-in duration-200 text-gray-500"
        :class="{
          'text-white bg-primary-400': listType === 'all',
          'hover:text-primary-400 bg-gray-50 hover:bg-primary-50':
            listType !== 'all',
        }"
        @click="changeType('all')"
      >
        全部
      </button>
    </div>
    <div class="w-1/3 p-2">
      <button
        class="post-list-type-btn block w-full rounded-md transition ease-in duration-200 text-gray-500"
        :class="{
          'text-white bg-primary-400': listType === 'blogs',
          'hover:text-primary-400 bg-gray-50 hover:bg-primary-50':
            listType !== 'blogs',
        }"
        @click="changeType('blogs')"
      >
        博文
      </button>
    </div>
    <div class="w-1/3 p-2">
      <button
        class="post-list-type-btn block w-full rounded-md transition ease-in duration-200 text-gray-500"
        :class="{
          'text-white bg-primary-400': listType === 'tweets',
          'hover:text-primary-400 bg-gray-50 hover:bg-primary-50':
            listType !== 'tweets',
        }"
        @click="changeType('tweets')"
      >
        推文
      </button>
    </div>
  </div>
</template>
<script setup>
const route = useRoute()
const router = useRouter()
const listType = route.params.type || 'all'
const changeType = (type) => {
  if (type === listType) return
  let typePath = ''
  if (type === 'all') {
    typePath = ''
  } else {
    typePath = type
  }
  router.push({
    params: { type: typePath, page: 1 },
  })
}
</script>
<style scoped>
.post-list-type-btn {
  padding: 5px 0;
}
</style>
