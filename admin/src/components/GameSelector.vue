<template>
  <el-select
    v-model="selectedGames"
    multiple
    filterable
    remote
    :remote-method="queryGames"
    :automatic-dropdown="true"
    default-first-option
    :reserve-keyword="false"
    :loading="loading"
    :placeholder="placeholder"
    style="width: 100%"
  >
    <template #header>
      <el-radio-group
        v-model="statusFilter"
        @change="queryGames(lastKeyword)"
        :disabled="loading"
      >
        <el-radio :label="undefined" size="small">全部</el-radio>
        <el-radio :label="0" size="small">仅不显示</el-radio>
        <el-radio :label="1" size="small">仅显示</el-radio>
      </el-radio-group>
    </template>
    <el-option
      v-for="item in gameOptions"
      :key="item._id"
      :label="`${checkShowText(item)}${
        item.gamePlatform?.name ? `【${item.gamePlatform.name}】` : ''
      }${item.title}`"
      :value="item._id"
    ></el-option>
  </el-select>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authApi } from '@/api'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  gameList: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择游戏'
  }
})

const emit = defineEmits(['update:modelValue', 'update:gameList'])

// 本地状态
const loading = ref(false)
const gameOptions = computed(() => props.gameList)
const selectedGames = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 检查显示文本
const checkShowText = item => {
  if (item.status === 0) {
    return '【状态:不显示】'
  }
  return ''
}

const lastKeyword = ref(null)
const statusFilter = ref(undefined) // 0:不显示,1:显示

// 获取游戏列表
const getGameList = (keyword = null) => {
  if (loading.value) {
    return
  }
  loading.value = true
  lastKeyword.value = keyword
  authApi
    .getGameList(
      { keyword, status: statusFilter.value, size: 50, page: 1 },
      true
    )
    .then(res => {
      emit('update:gameList', res.data.list)
    })
    .finally(() => {
      loading.value = false
    })
}

// 搜索游戏
let queryGamesTimer = null
const queryGames = query => {
  if (queryGamesTimer) {
    clearTimeout(queryGamesTimer)
  }
  queryGamesTimer = setTimeout(() => {
    getGameList(query)
  }, 100)
}
</script>
