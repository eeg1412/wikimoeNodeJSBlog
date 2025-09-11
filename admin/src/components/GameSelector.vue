<template>
  <div class="game-selector-container" style="width: 100%">
    <!-- 普通选择模式 -->
    <div v-show="!isSortMode" class="game-selector-wrapper">
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
        ref="gameSelectorRef"
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
          :label="item.label"
          :value="item._id"
        ></el-option>
      </el-select>

      <!-- 排序切换按钮 -->
      <el-button
        v-if="sortable"
        :disabled="selectedGames.length <= 1"
        type="primary"
        :icon="Sort"
        size="default"
        @click="toggleSortMode"
        title="调整顺序"
      />
    </div>

    <!-- 排序模式 -->
    <div v-if="isSortMode" class="game-sort-wrapper">
      <DraggableSelector
        v-model="selectedGames"
        :options="tagList"
        :placeholder="placeholder"
        :width="sortable ? 'calc(100% - 80px)' : '100%'"
        value-key="value"
        label-key="currentLabel"
        @change="handleSortChange"
      />

      <!-- 完成排序按钮 -->
      <div>
        <el-button
          type="success"
          :icon="Check"
          size="default"
          @click="toggleSortMode"
          title="完成排序"
        />
      </div>

      <div>
        <!-- 取消排序按钮 -->
        <el-button
          :icon="Close"
          size="default"
          @click="cancelSort"
          title="取消排序"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { Sort, Check, Close } from '@element-plus/icons-vue'
import { authApi } from '@/api'
import DraggableSelector from './DraggableSelector.vue'
import { formatDate, limitStr } from '@/utils/utils'

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
  },
  sortable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:gameList'])

// 本地状态
const loading = ref(false)
const isSortMode = ref(false)
const originalOrder = ref([])
const gameSelectorRef = ref(null)
const getSelectedList = () => {
  return gameSelectorRef.value?.showTagList || []
}
const gameOptions = computed(() => {
  if (props.gameList && Array.isArray(props.gameList)) {
    props.gameList.forEach(game => {
      let label = `${checkShowText(game)}${
        game.gamePlatform?.name ? `【${game.gamePlatform.name}】` : ''
      }${game.title}`
      game.label = label
    })
    return props.gameList
  } else {
    return []
  }
})
const selectedGames = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 获取已选择游戏的完整信息，用于排序组件
const selectedGameOptions = computed(() => {
  return props.modelValue.map(gameId => {
    const game = props.gameList.find(item => item._id === gameId)
    return game || { _id: gameId, title: gameId }
  })
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

// 切换排序模式
const tagList = ref([])
const toggleSortMode = () => {
  if (!isSortMode.value) {
    // 进入排序模式，保存原始顺序
    originalOrder.value = [...props.modelValue]
    tagList.value = getSelectedList()
  }
  isSortMode.value = !isSortMode.value
}

// 取消排序，恢复原始顺序
const cancelSort = () => {
  emit('update:modelValue', originalOrder.value)
  isSortMode.value = false
}

// 处理排序变化
const handleSortChange = newOrder => {
  emit('update:modelValue', newOrder)
}
</script>

<style scoped>
.game-selector-container {
  display: inline-block;
}

.game-selector-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.game-sort-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
</style>
