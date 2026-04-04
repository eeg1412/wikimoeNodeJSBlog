<template>
  <WUIPopover :popper="{ arrow: true }">
    <WUIButton
      color="white"
      size="xs"
      icon="i-fluent-sticker-12-regular"
      @click="stickerBtnClick"
      >贴纸</WUIButton
    >
    <template #panel="{ close }">
      <div class="sticker-popover-panel">
        <div v-if="isLoading" class="sticker-popover-empty">正在加载贴纸...</div>
        <template v-else-if="stickerGroupsCom.length > 0">
          <div class="sticker-popover-layout">
            <WUIImageTabs
              v-model="selectedGroupIndex"
              :items="tabItems"
            />

            <div
              :key="selectedGroupKey || selectedGroupIndex"
              class="sticker-popover-body custom-scroll scroll-not-hide"
            >
              <div
                v-if="activeGroup && activeGroup.stickers.length > 0"
                class="sticker-popover-grid"
              >
                <button
                  v-for="sticker in activeGroup.stickers"
                  :key="sticker._id"
                  type="button"
                  class="sticker-popover-item common-focus-visible-btn"
                  :class="{
                    disabled: isDisabled(sticker)
                  }"
                  :title="sticker.description"
                  @click="handleStickerClick(sticker, close)"
                >
                  <span
                    v-if="getSelectedCount(sticker) > 0"
                    class="sticker-popover-badge"
                  >
                    {{ getSelectedCount(sticker) }}
                  </span>
                  <img
                    :src="sticker.image"
                    :alt="sticker.description"
                    class="sticker-popover-image"
                    loading="lazy"
                  />
                </button>
              </div>
              <div v-else class="sticker-popover-empty">暂无贴纸</div>
            </div>
          </div>
        </template>
        <div v-else class="sticker-popover-empty">暂无可用贴纸组</div>
        <div
          v-if="maxCount > 0"
          class="sticker-popover-count"
        >
          {{ currentCount }}/{{ maxCount }}
        </div>
      </div>
    </template>
  </WUIPopover>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getStickerGroupsApi } from '@/api/sticker'

const MAX_USED_STICKERS = 50

const props = defineProps({
  maxCount: {
    type: Number,
    default: 3
  },
  currentCount: {
    type: Number,
    default: 0
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['stickerClick', 'stickerBtnClick'])

const stickerGroups = ref([])
const displayUsedStickers = ref([])
const selectedGroupKey = ref(null)
const isLoading = ref(false)

const getStickerGroupKey = group => {
  const rawKey = group?.key ?? group?._id ?? group?.name ?? ''
  return String(rawKey)
}

const getGroupUsageIndex = group => {
  const usageMap = new Map(
    displayUsedStickers.value.map((item, index) => [String(item._id), index])
  )
  let bestIndex = null
  ;(group.stickers || []).forEach(sticker => {
    const stickerIndex = usageMap.get(String(sticker._id))
    if (stickerIndex === undefined) {
      return
    }
    if (bestIndex === null || stickerIndex < bestIndex) {
      bestIndex = stickerIndex
    }
  })
  return bestIndex
}

const stickerGroupsCom = computed(() => {
  const groups = []
  if (displayUsedStickers.value.length > 0) {
    groups.push({
      key: 'used',
      label: '常用',
      title: '常用',
      showLabel: true,
      stickers: displayUsedStickers.value
    })
  }
  const sortedGroups = stickerGroups.value
    .map((group, index) => ({
      ...group,
      _sortIndex: index,
      _usageIndex: getGroupUsageIndex(group)
    }))
    .sort((a, b) => {
      const aUsed = a._usageIndex !== null
      const bUsed = b._usageIndex !== null
      if (aUsed && bUsed) {
        if (a._usageIndex !== b._usageIndex) {
          return a._usageIndex - b._usageIndex
        }
      } else if (aUsed) {
        return -1
      } else if (bUsed) {
        return 1
      }
      return a._sortIndex - b._sortIndex
    })

  sortedGroups.forEach(group => {
    groups.push({
      ...group,
      label: group.name,
      title: group.name,
      showLabel: false,
      image: group.stickers?.[0]?.thumbnail || group.stickers?.[0]?.image || ''
    })
  })
  return groups
})

const tabItems = computed(() => {
  return stickerGroupsCom.value.map(group => {
    const shouldShowText = group.key === 'used' || group.showLabel === true
    const image = shouldShowText ? '' : group.image
    return {
      key: group.key || group._id,
      label: group.label,
      title: group.title,
      image,
      showLabel: shouldShowText || !image
    }
  })
})

const selectedGroupIndex = computed({
  get() {
    if (stickerGroupsCom.value.length === 0) {
      return 0
    }

    const matchedIndex = stickerGroupsCom.value.findIndex(group => {
      return getStickerGroupKey(group) === selectedGroupKey.value
    })

    if (matchedIndex === -1) {
      return 0
    }

    return matchedIndex
  },
  set(index) {
    const nextGroup = stickerGroupsCom.value[index] || stickerGroupsCom.value[0] || null
    selectedGroupKey.value = nextGroup ? getStickerGroupKey(nextGroup) : null
  }
})

const activeGroup = computed(() => {
  if (stickerGroupsCom.value.length === 0) {
    return null
  }

  return (
    stickerGroupsCom.value.find(group => {
      return getStickerGroupKey(group) === selectedGroupKey.value
    }) || stickerGroupsCom.value[0]
  )
})

const syncSelectedGroupKey = groups => {
  if (!groups.length) {
    selectedGroupKey.value = null
    return
  }

  const hasMatchedGroup = groups.some(group => {
    return getStickerGroupKey(group) === selectedGroupKey.value
  })

  if (hasMatchedGroup) {
    return
  }

  selectedGroupKey.value = getStickerGroupKey(groups[0])
}

const selectedStickerCountMap = computed(() => {
  return props.selectedIds.reduce((map, id) => {
    const key = String(id)
    map.set(key, (map.get(key) || 0) + 1)
    return map
  }, new Map())
})

const getSelectedCount = sticker => {
  return selectedStickerCountMap.value.get(String(sticker._id)) || 0
}

const isDisabled = sticker => {
  if (props.maxCount > 0 && props.currentCount >= props.maxCount) {
    return true
  }
  return false
}

const handleStickerClick = (sticker, close) => {
  if (isDisabled(sticker)) return
  emits('stickerClick', sticker)
  setUsedSticker(sticker)
  close()
}

const ensureStickerGroupsLoaded = async () => {
  if (stickerGroups.value.length > 0) {
    return
  }
  isLoading.value = true
  try {
    const data = await getStickerGroupsApi()
    stickerGroups.value = data || []
  } catch (err) {
    console.log(err)
  } finally {
    isLoading.value = false
  }
}

const syncUsedStickers = () => {
  const str = localStorage.getItem('usedStickers')
  if (!str) {
    displayUsedStickers.value = []
    return
  }
  try {
    const ids = JSON.parse(str)
    const allStickers = stickerGroups.value.flatMap(group => group.stickers || [])
    const nextStickers = ids
      .map(id => allStickers.find(sticker => sticker._id === id))
      .filter(Boolean)
      .slice(0, MAX_USED_STICKERS)
    displayUsedStickers.value = nextStickers
    localStorage.setItem(
      'usedStickers',
      JSON.stringify(nextStickers.map(item => item._id))
    )
  } catch (e) {
    displayUsedStickers.value = []
  }
}

const setUsedSticker = sticker => {
  let ids = []
  try {
    ids = JSON.parse(localStorage.getItem('usedStickers') || '[]')
  } catch (error) {
    ids = []
  }

  const nextIds = [
    sticker._id,
    ...ids.filter(id => String(id) !== String(sticker._id))
  ].slice(0, MAX_USED_STICKERS)

  localStorage.setItem(
    'usedStickers',
    JSON.stringify(nextIds)
  )
}

const stickerBtnClick = () => {
  ensureStickerGroupsLoaded().then(() => {
    syncUsedStickers()
  })
  emits('stickerBtnClick')
}

onMounted(() => {
  ensureStickerGroupsLoaded()
})

watch(stickerGroupsCom, groups => {
  syncSelectedGroupKey(groups)
}, { immediate: true })
</script>
<style scoped>
.sticker-popover-panel {
  width: min(92vw, 640px);
  height: 472px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sticker-popover-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

.sticker-popover-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.sticker-popover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 10px;
}

@media (min-width: 640px) {
  .sticker-popover-grid {
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  }
}

.sticker-popover-item {
  position: relative;
  min-height: 78px;
  aspect-ratio: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 18px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.88);
  transition: border-color 0.2s ease;
}

.dark .sticker-popover-item {
  background: rgba(15, 23, 42, 0.88);
}

.sticker-popover-item:hover {
  border-color: rgb(var(--color-primary-500) / 1);
}

.dark .sticker-popover-item:hover {
  border-color: rgb(var(--color-primary-400) / 1);
}

.sticker-popover-item.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.sticker-popover-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgb(var(--color-primary-500) / 1);
  color: white;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
}

.dark .sticker-popover-badge {
  background: rgb(var(--color-primary-400) / 1);
  color: rgb(17 24 39 / 1);
}

.sticker-popover-item.disabled .sticker-popover-badge {
  opacity: 1;
}

.sticker-popover-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.sticker-popover-count {
  margin-top: 8px;
  padding-right: 4px;
  text-align: right;
  font-size: 12px;
  color: rgb(148, 163, 184);
}

.sticker-popover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  color: rgb(148, 163, 184);
}

.sticker-popover-panel > .sticker-popover-empty {
  flex: 1;
}

.sticker-popover-body > .sticker-popover-empty {
  height: 100%;
}

@media (max-width: 639px) {
  .sticker-popover-panel {
    height: 396px;
    padding: 8px;
  }

  .sticker-popover-body {
    padding-right: 0;
  }
}
</style>
