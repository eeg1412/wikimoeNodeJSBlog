<template>
  <el-popover
    v-if="hasAvailableStickerGroups"
    :width="popoverWidth"
    placement="bottom-start"
    :popper-options="popperOptions"
    trigger="click"
    v-model:visible="popoverShow"
    @show="handlePopoverShow"
  >
    <template #reference>
      <el-button size="small" @click="stickerBtnClick">{{
        buttonText
      }}</el-button>
    </template>

    <div class="sticker-picker-panel">
      <div v-if="isLoading" class="empty-sticker-all">正在加载贴纸...</div>
      <template v-else-if="stickerGroupsCom.length > 0">
        <div class="sticker-picker-layout">
          <AdminImageTabs
            v-model="selectedGroupIndex"
            :items="tabItems"
            :is-visible="popoverShow"
          />

          <div
            :key="selectedGroupKey || selectedGroupIndex"
            class="sticker-picker-container custom-scroll scroll-not-hide"
          >
            <div
              v-if="activeGroup && activeGroup.stickers.length > 0"
              class="sticker-picker-grid"
            >
              <button
                v-for="sticker in activeGroup.stickers"
                :key="sticker._id"
                type="button"
                class="sticker-picker-item"
                :class="{
                  disabled: isDisabled(sticker)
                }"
                :title="sticker.description"
                @click="handleStickerClick(sticker)"
              >
                <span
                  v-if="getSelectedCount(sticker) > 0"
                  class="sticker-picker-badge"
                >
                  {{ getSelectedCount(sticker) }}
                </span>
                <img
                  :src="sticker.image"
                  :alt="sticker.description"
                  class="sticker-picker-img"
                  loading="lazy"
                />
              </button>
            </div>
            <div v-else class="empty-sticker">暂无贴纸</div>
          </div>
        </div>
      </template>
      <div v-else class="empty-sticker-all">暂无可用贴纸组</div>

      <div class="sticker-picker-footer">
        <button
          type="button"
          class="sticker-picker-refresh-btn"
          :class="{ 'is-loading': isLoading }"
          :disabled="isLoading"
          title="刷新贴纸"
          @click.stop="refreshStickers"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>刷新</span>
        </button>
        <div class="sticker-picker-hint" v-if="maxCount > 0">
          {{ currentCount }}/{{ maxCount }}
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RefreshRight } from '@element-plus/icons-vue'
import { authApi } from '@/api'
import {
  getAdminStickerPickerCache,
  requestAdminStickerPickerGroups,
  subscribeAdminStickerPickerCache
} from '@/utils/stickerPickerCache'
import AdminImageTabs from './AdminImageTabs.vue'

const MAX_USED_STICKERS = 50

function getGroupUsageIndex(group, usedIds) {
  const usageMap = new Map(usedIds.map((id, index) => [String(id), index]))
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

function sortStickerGroups(groups, usedIds) {
  return groups
    .map((group, index) => ({
      ...group,
      _sortIndex: index,
      _usageIndex: getGroupUsageIndex(group, usedIds)
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
    .map(group => {
      delete group._sortIndex
      delete group._usageIndex
      return group
    })
}

export default {
  name: 'AdminStickerPicker',
  components: {
    AdminImageTabs,
    RefreshRight
  },
  props: {
    buttonText: {
      type: String,
      default: '贴纸'
    },
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
  },
  emits: ['stickerClick', 'stickerBtnClick'],
  setup(props, { emit }) {
    const popoverShow = ref(false)
    const stickerGroups = ref(getAdminStickerPickerCache() || [])
    const displayUsedStickers = ref([])
    const selectedGroupKey = ref(null)
    const isLoading = ref(false)
    const popoverWidth = ref(640)
    let resizeTimer = null
    let unsubscribeStickerPickerCache = null

    const popperOptions = {
      strategy: 'fixed',
      modifiers: [
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top-start', 'bottom-start']
          }
        },
        {
          name: 'preventOverflow',
          options: {
            padding: 12,
            altAxis: true,
            tether: true
          }
        }
      ]
    }

    const updatePopoverWidth = () => {
      if (window.innerWidth < 768) {
        popoverWidth.value = Math.max(260, window.innerWidth - 20)
        return
      }
      popoverWidth.value = 640
    }

    const handleWindowResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
      resizeTimer = setTimeout(() => {
        resizeTimer = null
        updatePopoverWidth()
      }, 80)
    }

    const getStickerGroupKey = group => {
      const rawKey = group?.key ?? group?._id ?? group?.name ?? ''
      return String(rawKey)
    }

    const stickerGroupsCom = computed(() => {
      const sortedGroups = sortStickerGroups(
        stickerGroups.value,
        displayUsedStickers.value.map(item => item._id)
      )
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
      return groups.concat(sortedGroups)
    })

    const hasAvailableStickerGroups = computed(() => {
      return stickerGroups.value.length > 0
    })

    const tabItems = computed(() => {
      return stickerGroupsCom.value.map(group => {
        const shouldShowText = group.key === 'used' || group.showLabel === true
        const image = shouldShowText
          ? ''
          : group.stickers?.[0]?.thumbnail || group.stickers?.[0]?.image || ''
        return {
          key: group.key || group._id,
          label: group.label || group.name,
          title: group.title || group.name,
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
        const nextGroup =
          stickerGroupsCom.value[index] || stickerGroupsCom.value[0] || null
        selectedGroupKey.value = nextGroup
          ? getStickerGroupKey(nextGroup)
          : null
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

    const syncUsedStickers = () => {
      const stickerIdString = localStorage.getItem('adminUsedStickers')
      if (!stickerIdString) {
        displayUsedStickers.value = []
        return
      }
      try {
        const ids = JSON.parse(stickerIdString)
        const allStickers = stickerGroups.value.flatMap(
          group => group.stickers || []
        )
        const nextStickers = ids
          .map(id => allStickers.find(sticker => sticker._id === id))
          .filter(Boolean)
          .slice(0, MAX_USED_STICKERS)
        displayUsedStickers.value = nextStickers
        localStorage.setItem(
          'adminUsedStickers',
          JSON.stringify(nextStickers.map(item => item._id))
        )
      } catch (error) {
        displayUsedStickers.value = []
      }
    }

    const rememberSticker = sticker => {
      let ids = []
      try {
        ids = JSON.parse(localStorage.getItem('adminUsedStickers') || '[]')
      } catch (error) {
        ids = []
      }

      const nextIds = [
        sticker._id,
        ...ids.filter(id => String(id) !== String(sticker._id))
      ].slice(0, MAX_USED_STICKERS)

      localStorage.setItem('adminUsedStickers', JSON.stringify(nextIds))
    }

    const loadStickers = async (forceRefresh = false) => {
      const cachedGroups = getAdminStickerPickerCache()

      if (!forceRefresh && cachedGroups) {
        stickerGroups.value = cachedGroups
        syncUsedStickers()
        return cachedGroups
      }

      isLoading.value = true
      try {
        const groups = await requestAdminStickerPickerGroups(() => {
          return authApi
            .getStickerGroupsWithStickers(true)
            .then(res => res.data.data || [])
        }, forceRefresh)
        stickerGroups.value = groups
        syncUsedStickers()
        return groups
      } finally {
        isLoading.value = false
      }
    }

    const handleStickerClick = sticker => {
      if (isDisabled(sticker)) {
        return
      }
      emit('stickerClick', sticker)
      rememberSticker(sticker)
      popoverShow.value = false
    }

    const handlePopoverShow = async () => {
      updatePopoverWidth()
      if (!stickerGroups.value.length) {
        await loadStickers()
      }
    }

    const refreshStickers = async () => {
      if (isLoading.value) {
        return
      }
      await loadStickers(true)
      syncUsedStickers()
    }

    const stickerBtnClick = () => {
      updatePopoverWidth()
      syncUsedStickers()
      emit('stickerBtnClick')
    }

    watch(
      stickerGroupsCom,
      groups => {
        syncSelectedGroupKey(groups)
      },
      { immediate: true }
    )

    onMounted(() => {
      updatePopoverWidth()
      loadStickers()
      unsubscribeStickerPickerCache = subscribeAdminStickerPickerCache(() => {
        const cachedGroups = getAdminStickerPickerCache()

        if (popoverShow.value) {
          loadStickers(true)
          return
        }

        stickerGroups.value = cachedGroups || []
        syncUsedStickers()
      })
      window.addEventListener('resize', handleWindowResize)
    })

    onUnmounted(() => {
      if (unsubscribeStickerPickerCache) {
        unsubscribeStickerPickerCache()
        unsubscribeStickerPickerCache = null
      }

      window.removeEventListener('resize', handleWindowResize)
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
    })

    return {
      popoverShow,
      popoverWidth,
      popperOptions,
      selectedGroupKey,
      selectedGroupIndex,
      isLoading,
      hasAvailableStickerGroups,
      stickerGroupsCom,
      tabItems,
      activeGroup,
      getSelectedCount,
      isDisabled,
      refreshStickers,
      handleStickerClick,
      handlePopoverShow,
      stickerBtnClick
    }
  }
}
</script>

<style scoped>
.sticker-picker-panel {
  width: 100%;
  height: min(472px, calc(100vh - 24px));
  max-height: calc(100vh - 24px);
  max-width: 100%;
  /* padding: 10px; */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sticker-picker-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

.sticker-picker-container {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.sticker-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 10px;
}

@media (min-width: 640px) {
  .sticker-picker-grid {
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  }
}

.sticker-picker-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 18px;
  border: 1px solid transparent;
  cursor: pointer;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.88);
  transition: border-color 0.2s ease;
}

.sticker-picker-item:hover {
  border-color: var(--el-color-primary);
}

.sticker-picker-item.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.sticker-picker-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
}

.sticker-picker-item.disabled .sticker-picker-badge {
  opacity: 1;
}

.sticker-picker-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.sticker-picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}

.sticker-picker-refresh-btn {
  min-height: 28px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgb(107, 116, 128);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sticker-picker-refresh-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  color: rgb(17, 24, 39);
}

.sticker-picker-refresh-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.sticker-picker-refresh-btn.is-loading .el-icon {
  animation: sticker-picker-rotate 1s linear infinite;
}

@keyframes sticker-picker-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.sticker-picker-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: right;
}

.empty-sticker,
.empty-sticker-all {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
  color: var(--el-text-color-secondary);
}

.sticker-picker-panel > .empty-sticker-all {
  flex: 1;
}

.sticker-picker-container > .empty-sticker {
  height: 100%;
}

@media (max-width: 767px) {
  .sticker-picker-panel {
    height: min(396px, calc(100vh - 16px));
    max-height: calc(100vh - 16px);
    padding: 8px;
  }

  .sticker-picker-container {
    padding-right: 0;
  }
}
</style>
