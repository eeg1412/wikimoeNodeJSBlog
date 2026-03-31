<template>
  <el-dialog
    v-model="showDialog"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    :title="dialogTitle"
    @closed="resetData"
  >
    <div>
      <el-input
        v-model="keyword"
        placeholder="请输入关键词搜索"
        clearable
        @input="onSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="content-block-selector-list" v-loading="isLoading">
        <div
          v-if="list.length === 0 && !isLoading"
          class="content-block-selector-empty"
        >
          暂无数据
        </div>
        <div
          v-for="item in list"
          :key="item._id"
          class="content-block-selector-item"
          @click="handleSelect(item)"
        >
          <span class="content-block-selector-item-title">{{ getItemLabel(item) }}</span>
          <el-icon class="content-block-selector-item-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { computed, ref, watch } from 'vue'
import { authApi } from '@/api'
import { Search, ArrowRight } from '@element-plus/icons-vue'

const TYPE_CONFIG = {
  bangumi: { title: '选择番剧', apiMethod: 'getBangumiList' },
  movie: { title: '选择电影', apiMethod: 'getMovieList' },
  book: { title: '选择书籍', apiMethod: 'getBookList' },
  game: { title: '选择游戏', apiMethod: 'getGameList' },
  vote: { title: '选择投票', apiMethod: 'getVoteList' }
}

export default {
  name: 'ContentBlockSelectorDialog',
  components: {
    Search,
    ArrowRight
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    blockType: {
      type: String,
      default: ''
    }
  },
  emits: ['update:show', 'select'],
  setup(props, { emit }) {
    const showDialog = computed({
      get() {
        return props.show
      },
      set(val) {
        emit('update:show', val)
      }
    })

    const keyword = ref('')
    const list = ref([])
    const isLoading = ref(false)
    let searchTimer = null

    const dialogTitle = computed(() => {
      const config = TYPE_CONFIG[props.blockType]
      return config ? config.title : '选择内容'
    })

    const fetchList = (query) => {
      const config = TYPE_CONFIG[props.blockType]
      if (!config) return

      isLoading.value = true
      const params = {
        keyword: query || '',
        page: 1,
        size: 50
      }
      authApi[config.apiMethod](params, true)
        .then(res => {
          list.value = res.data.list || []
        })
        .catch(() => {
          list.value = []
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    const onSearch = () => {
      if (searchTimer) {
        clearTimeout(searchTimer)
      }
      searchTimer = setTimeout(() => {
        fetchList(keyword.value)
      }, 300)
    }

    const getItemLabel = (item) => {
      return item.title || item.name || item._id
    }

    const handleSelect = (item) => {
      showDialog.value = false
      emit('select', {
        id: item._id,
        title: getItemLabel(item)
      })
    }

    const resetData = () => {
      keyword.value = ''
      list.value = []
    }

    watch(
      () => props.show,
      (val) => {
        if (val) {
          fetchList('')
        }
      }
    )

    return {
      showDialog,
      keyword,
      list,
      isLoading,
      dialogTitle,
      onSearch,
      getItemLabel,
      handleSelect,
      resetData
    }
  }
}
</script>
<style scoped>
.content-block-selector-list {
  margin-top: 12px;
  max-height: 400px;
  overflow-y: auto;
  min-height: 100px;
}
.content-block-selector-empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}
.content-block-selector-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.content-block-selector-item:hover {
  background: #f5f5f5;
}
.content-block-selector-item-title {
  font-size: 14px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.content-block-selector-item-arrow {
  color: #999;
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
