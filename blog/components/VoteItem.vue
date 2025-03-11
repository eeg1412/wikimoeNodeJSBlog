<template>
  <div
    class="rounded-lg border border-solid border-gray-300 dark:border-gray-600 p-4 mb-4 cursor-default bg-white dark:bg-gray-800"
    @click.stop
  >
    <!-- 标题 -->
    <h3 class="text-lg font-bold mb-2">{{ item.title }}</h3>

    <!-- 截止时间 -->
    <div class="text-sm text-gray-500 mb-4" v-if="item.endTime">
      截止时间: {{ formatDate(item.endTime) }}
    </div>

    <!-- 最大选择提示 -->
    <div class="text-xs text-gray-500 mb-3" v-if="item.maxSelect > 1">
      (最多可选择 {{ item.maxSelect }} 项)
    </div>

    <!-- 选项列表 -->
    <div class="space-y-2 mb-4">
      <div
        v-for="option in item.options"
        :key="option._id"
        class="flex items-center p-2 rounded-md border border-solid border-gray-300 dark:border-gray-600 hover:border-primary/80 dark:hover:border-primary/80 transition-colors"
      >
        <div class="flex-1">
          <label class="flex items-center cursor-pointer">
            <span>{{ option.title }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <UButton block>提交</UButton>

    <!-- 结果区域 (暂时隐藏) -->
    <div class="mt-4 pt-4 border-t border-gray-100 hidden">
      <div class="text-sm font-medium mb-2">投票结果</div>
      <div class="space-y-2">
        <div
          v-for="option in item.options"
          :key="`result-${option._id}`"
          class="mb-2"
        >
          <div class="flex justify-between text-sm mb-1">
            <span>{{ option.title }}</span>
            <span class="font-medium">0%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary h-2 rounded-full" style="width: 0%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// props
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped></style>
