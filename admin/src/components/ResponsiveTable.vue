<template>
  <!--
    ResponsiveTable - 响应式表格组件
    桌面端：渲染标准 el-table
    移动端：渲染卡片列表

    用法与 el-table 完全一致，只需将 el-table 替换为 ResponsiveTable，
    el-table-column 替换为 ResponsiveTableColumn。

    额外 props:
      - mobileBreakpoint: number (默认 768) 移动端断点
  -->

  <!-- 桌面端：标准 el-table -->
  <el-table
    v-if="!isMobile"
    ref="elTableRef"
    v-bind="tableAttrs"
    :data="data"
    v-on="tableListeners"
  >
    <slot />
  </el-table>

  <!-- 移动端：卡片布局 -->
  <div v-else class="responsive-table-mobile" ref="mobileContainerRef">
    <!-- 移动端顶部工具栏：全选 & 排序 -->
    <div
      v-if="hasSelection || sortableColumns.length > 0"
      class="responsive-table-mobile__toolbar"
    >
      <el-checkbox
        v-if="hasSelection"
        v-model="isAllSelected"
        :indeterminate="isIndeterminate"
        @change="handleSelectAll"
        class="responsive-table-mobile__select-all"
      >
        全选
      </el-checkbox>
      <div
        v-if="sortableColumns.length > 0"
        class="responsive-table-mobile__sort"
      >
        <el-select
          v-model="mobileSortProp"
          placeholder="排序字段"
          size="small"
          clearable
          style="width: 130px"
          @change="handleMobileSortChange"
        >
          <el-option
            v-for="col in sortableColumns"
            :key="col.columnId"
            :label="col.label"
            :value="col.prop"
          />
        </el-select>
        <el-button
          v-if="mobileSortProp"
          size="small"
          @click="toggleMobileSortOrder"
          class="responsive-table-mobile__sort-btn"
        >
          <i
            :class="
              mobileSortOrder === 'ascending'
                ? 'el-icon-sort-up'
                : 'el-icon-sort-down'
            "
          ></i>
          {{ mobileSortOrder === 'ascending' ? '升序' : '降序' }}
        </el-button>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="responsive-table-mobile__list">
      <div
        v-for="(row, rowIndex) in flattenedData"
        :key="getRowKey(row.row, rowIndex)"
        class="responsive-table-mobile__row-container"
      >
        <!-- 树形连接线 -->
        <div
          v-if="row.level > 0"
          class="responsive-table-mobile__tree-connector"
        >
          <div
            v-for="l in row.level"
            :key="l"
            class="responsive-table-mobile__tree-line"
            :style="{ left: `${(l - 1) * 20 + 8}px` }"
            :class="{ 'is-last-level': l === row.level }"
          ></div>
        </div>

        <div
          class="responsive-table-card"
          :class="{
            'responsive-table-card--selected': isRowSelected(row.row),
            'responsive-table-card--has-children': row.hasChildren
          }"
          :style="{
            marginLeft: row.level > 0 ? `${row.level * 20}px` : '0'
          }"
          @click="handleCardClick(row.row, rowIndex, $event)"
        >
          <!-- 选择框 -->
          <div v-if="hasSelection" class="responsive-table-card__selection">
            <el-checkbox
              :model-value="isRowSelected(row.row)"
              @change="val => toggleRowSelect(row.row, val)"
              @click.stop
            />
          </div>

          <!-- 卡片主体内容 -->
          <div class="responsive-table-card__body">
            <!-- 普通字段区域 -->
            <div
              v-for="col in normalColumns"
              :key="col.columnId"
              class="responsive-table-card__field"
            >
              <div class="responsive-table-card__label">{{ col.label }}</div>
              <div class="responsive-table-card__value">
                <!-- 使用列的自定义渲染 -->
                <ResponsiveTableCardCell
                  :column="col"
                  :row="row.row"
                  :row-index="rowIndex"
                />
              </div>
            </div>
          </div>

          <!-- 操作区域 -->
          <div
            v-if="actionColumns.length > 0"
            class="responsive-table-card__actions"
          >
            <template v-for="col in actionColumns" :key="col.columnId">
              <ResponsiveTableCardCell
                :column="col"
                :row="row.row"
                :row-index="rowIndex"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!data || data.length === 0"
        class="responsive-table-mobile__empty"
      >
        <slot name="empty">
          <el-empty description="暂无数据" />
        </slot>
      </div>
    </div>

    <!-- 隐藏区域：让 ResponsiveTableColumn 仍然挂载以完成注册 -->
    <div style="display: none">
      <slot />
    </div>
  </div>
</template>

<script>
import {
  ref,
  computed,
  provide,
  reactive,
  toRefs,
  useAttrs,
  onBeforeUnmount,
  nextTick,
  h,
  watch
} from 'vue'
import { useIsMobile } from '@/composables/useIsMobile'

/**
 * 辅助组件：渲染卡片中每个单元格的内容
 * 调用已注册列的 renderFn（即 el-table-column 的 #default slot）
 */
const ResponsiveTableCardCell = {
  name: 'ResponsiveTableCardCell',
  props: {
    column: { type: Object, required: true },
    row: { type: Object, required: true },
    rowIndex: { type: Number, required: true }
  },
  setup(props) {
    return () => {
      const { column, row, rowIndex } = props
      // 如果列注册了渲染函数（来自 #default slot）
      if (column.renderFn) {
        return column.renderFn({
          row,
          $index: rowIndex,
          column: { property: column.prop, label: column.label },
          cellIndex: 0,
          expanded: false
        })
      }
      // 如果没有自定义 slot，直接展示 prop 的值
      if (column.prop) {
        return h('span', getNestedValue(row, column.prop))
      }
      return null
    }
  }
}

/**
 * 根据点号路径获取嵌套属性值
 * 例如 getNestedValue(row, 'author.nickname') => row.author.nickname
 */
function getNestedValue(obj, path) {
  if (!path || !obj) return ''
  return path.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : ''
  }, obj)
}

export default {
  name: 'ResponsiveTable',
  components: {
    ResponsiveTableCardCell
  },
  inheritAttrs: false,
  props: {
    /** 表格数据，同 el-table 的 data */
    data: {
      type: Array,
      default: () => []
    },
    /** 行数据的 Key，同 el-table 的 row-key */
    rowKey: {
      type: [String, Function],
      default: ''
    },
    /** 移动端断点宽度，默认 768 */
    mobileBreakpoint: {
      type: Number,
      default: 768
    }
  },
  emits: [
    'selection-change',
    'sort-change',
    'row-click',
    'row-dblclick',
    'row-contextmenu',
    'cell-click',
    'cell-dblclick',
    'cell-contextmenu',
    'header-click',
    'header-contextmenu',
    'header-dragend',
    'expand-change',
    'current-change',
    'select',
    'select-all',
    'filter-change'
  ],
  setup(props, { emit, attrs, expose }) {
    const { isMobile } = useIsMobile(props.mobileBreakpoint)

    // ========== el-table ref 及方法代理 ==========
    const elTableRef = ref(null)
    const mobileContainerRef = ref(null)

    // ========== 事件名到监听器属性名的映射 ==========
    const eventToListenerMap = new Map()
    const emitEvents = [
      'selection-change',
      'sort-change',
      'row-click',
      'row-dblclick',
      'row-contextmenu',
      'cell-click',
      'cell-dblclick',
      'cell-contextmenu',
      'header-click',
      'header-contextmenu',
      'header-dragend',
      'expand-change',
      'current-change',
      'select',
      'select-all',
      'filter-change'
    ]
    emitEvents.forEach(event => {
      const listenerName =
        'on' +
        event
          .split('-')
          .map(s => s.charAt(0).toUpperCase() + s.slice(1))
          .join('')
      eventToListenerMap.set(listenerName, event)
    })

    // ========== 列注册系统 ==========
    // 已注册的列定义列表（由 ResponsiveTableColumn 子组件注册）
    const registeredColumns = reactive([])
    let columnOrderCounter = 0

    /**
     * 注册列定义（由 ResponsiveTableColumn 调用）
     * @param {Object} colDef 列定义对象
     * @returns {number} 列的排序序号
     */
    const registerColumn = colDef => {
      colDef._order = columnOrderCounter++
      registeredColumns.push(colDef)
      // 按注册顺序排序
      registeredColumns.sort((a, b) => a._order - b._order)
    }

    /**
     * 注销列定义（由 ResponsiveTableColumn 在卸载时调用）
     * @param {Symbol} columnId 列的唯一标识
     */
    const unregisterColumn = columnId => {
      const idx = registeredColumns.findIndex(c => c.columnId === columnId)
      if (idx > -1) {
        registeredColumns.splice(idx, 1)
      }
    }

    /**
     * 更新列的渲染函数（slot 变化时调用）
     * @param {Symbol} columnId 列的唯一标识
     * @param {Function} renderFn 新的渲染函数
     */
    const updateColumnRenderFn = (columnId, renderFn) => {
      const col = registeredColumns.find(c => c.columnId === columnId)
      if (col) {
        col.renderFn = renderFn
      }
    }

    // 向子组件提供注册接口和移动端状态
    provide('responsiveTable', {
      isMobile,
      registerColumn,
      unregisterColumn,
      updateColumnRenderFn,
      _getColumn: columnId =>
        registeredColumns.find(c => c.columnId === columnId) || null
    })

    // ========== 列分类 ==========

    /** 普通显示列（非操作、非选择、非隐藏） */
    const normalColumns = computed(() =>
      registeredColumns.filter(
        col =>
          !col.isAction &&
          !col.isSelection &&
          !col.cardHidden &&
          col.type !== 'selection' &&
          col.type !== 'index' &&
          col.type !== 'expand'
      )
    )

    /** 操作列（fixed="right" 或标记为 isAction 的列） */
    const actionColumns = computed(() =>
      registeredColumns.filter(col => col.isAction)
    )

    /** 是否存在选择列 */
    const hasSelection = computed(() =>
      registeredColumns.some(col => col.type === 'selection' || col.isSelection)
    )

    /** 可排序列 */
    const sortableColumns = computed(() =>
      registeredColumns.filter(col => col.sortable && col.prop)
    )

    // ========== 树状表格数据扁平化 ==========
    /**
     * 将树状数据扁平化，添加层级信息
     */
    const flattenedData = computed(() => {
      const result = []
      const flatten = (rows, level = 0) => {
        if (!rows) return
        rows.forEach(row => {
          result.push({
            row,
            level,
            hasChildren: row.children && row.children.length > 0
          })
          if (row.children && row.children.length > 0) {
            flatten(row.children, level + 1)
          }
        })
      }
      flatten(props.data)
      return result
    })

    // ========== 自动滚动到顶部（移动端） ==========
    watch(
      () => props.data,
      () => {
        if (isMobile.value) {
          // 延迟执行，确保DOM已更新
          nextTick(() => {
            // 滚动 .el-main 元素到顶部
            const appElement = document.querySelector('.el-main')
            if (appElement) {
              appElement.scrollTo({ top: 0 })
            }
          })
        }
      },
      { deep: false }
    )

    // ========== 状态定义 ==========
    const selectedRows = ref([])

    // 排序状态持久化
    const sortState = reactive({
      prop: '',
      order: null
    })

    // 移动端排序所需的 refs
    const mobileSortProp = ref('')
    const mobileSortOrder = ref('ascending')

    // 监听并通过父组件传入的初始排序更新状态
    watch(
      () => attrs['default-sort'],
      newVal => {
        if (newVal) {
          sortState.prop = newVal.prop || ''
          sortState.order = newVal.order || null
          mobileSortProp.value = sortState.prop
          mobileSortOrder.value = sortState.order || 'ascending'
        }
      },
      { immediate: true, deep: true }
    )

    // ========== 桌面端/移动端切换时状态同步 ==========
    watch(
      isMobile,
      (newIsMobile, oldIsMobile) => {
        if (newIsMobile === oldIsMobile) return

        nextTick(() => {
          if (newIsMobile) {
            // 桌面端 -> 移动端：同步选中状态
            if (hasSelection.value && elTableRef.value) {
              const tableSelection = elTableRef.value.getSelectionRows()
              selectedRows.value = [...tableSelection]
            }
          } else {
            // 移动端 -> 桌面端
            // 1. 恢复排序状态
            if (elTableRef.value && sortState.prop) {
              elTableRef.value.sort(sortState.prop, sortState.order)
            }
            // 2. 恢复选中状态（确保原子性：清空并重新勾选）
            if (hasSelection.value && elTableRef.value) {
              elTableRef.value.clearSelection()
              selectedRows.value.forEach(row => {
                elTableRef.value.toggleRowSelection(row, true)
              })
            }
          }
        })
      },
      { immediate: false }
    )

    // ========== 选择功能（移动端） ==========
    const getRowKey = (row, index) => {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(row)
      }
      if (props.rowKey && row[props.rowKey] !== undefined) {
        return row[props.rowKey]
      }
      return index
    }

    const isRowSelected = row => {
      const key = getRowKey(row, -1)
      return selectedRows.value.some(r => getRowKey(r, -1) === key)
    }

    const toggleRowSelect = (row, selected) => {
      const key = getRowKey(row, -1)
      if (selected) {
        if (!isRowSelected(row)) {
          selectedRows.value.push(row)
        }
      } else {
        selectedRows.value = selectedRows.value.filter(
          r => getRowKey(r, -1) !== key
        )
      }
      emit('selection-change', [...selectedRows.value])
      emit('select', [...selectedRows.value], row)
    }

    const isAllSelected = computed({
      get: () => {
        if (!props.data || props.data.length === 0) return false
        return props.data.every(row => isRowSelected(row))
      },
      set: val => handleSelectAll(val)
    })

    const isIndeterminate = computed(() => {
      // 修正逻辑：如果全选则不显示半选；否则如果 selectedRows 不为空，则显示半选
      if (isAllSelected.value) return false
      return selectedRows.value.length > 0
    })

    const handleSelectAll = val => {
      if (val) {
        // 合并选中，保留之前选中的（跨页保留）
        const currentKeys = new Set(props.data.map((r, i) => getRowKey(r, i)))
        const kept = selectedRows.value.filter(
          r => !currentKeys.has(getRowKey(r, -1))
        )
        selectedRows.value = [...kept, ...props.data]
      } else {
        const currentKeys = new Set(props.data.map((r, i) => getRowKey(r, i)))
        selectedRows.value = selectedRows.value.filter(
          r => !currentKeys.has(getRowKey(r, -1))
        )
      }
      emit('selection-change', [...selectedRows.value])
      emit('select-all', [...selectedRows.value])
    }

    // ========== 排序功能（移动端） ==========
    const handleMobileSortChange = val => {
      const prop = val || ''
      const order = prop ? mobileSortOrder.value : null

      // 同步到统一状态
      sortState.prop = prop
      sortState.order = order

      emit('sort-change', {
        column: prop ? { property: prop } : null,
        prop: prop || null,
        order: order
      })
    }

    const toggleMobileSortOrder = () => {
      mobileSortOrder.value =
        mobileSortOrder.value === 'ascending' ? 'descending' : 'ascending'
      handleMobileSortChange(mobileSortProp.value)
    }

    // ========== 事件处理 ==========
    const handleCardClick = (row, index, event) => {
      emit('row-click', row, null, event)
    }

    // 构建传递给 el-table 的事件监听器
    const tableListeners = computed(() => {
      const listeners = {}
      emitEvents.forEach(event => {
        if (event === 'selection-change') {
          // 拦截 selection-change 事件，同步选中状态
          listeners[event] = (...args) => {
            const [selection] = args
            // 同步到 selectedRows，保持状态一致
            selectedRows.value = [...selection]
            emit(event, ...args)
          }
        } else if (event === 'sort-change') {
          // 拦截 sort-change 事件，同步排序状态到统一对象和移动端 refs
          listeners[event] = (...args) => {
            const sortInfo = args[0] || {}
            const { prop, order } = sortInfo

            // 严谨同步：如果 order 为空（取消排序），则清空所有排序状态
            if (!order) {
              sortState.prop = ''
              sortState.order = null
              mobileSortProp.value = ''
            } else {
              sortState.prop = prop || ''
              sortState.order = order
              mobileSortProp.value = prop || ''
              mobileSortOrder.value = order || 'ascending'
            }
            emit(event, ...args)
          }
        } else {
          listeners[event] = (...args) => emit(event, ...args)
        }
      })
      return listeners
    })

    // 过滤掉自定义 props 和事件监听器，其余传递给 el-table
    const tableAttrs = computed(() => {
      console.log('attrs', attrs)
      const { mobileBreakpoint, ...rest } = attrs
      // 过滤掉已声明的事件监听器，事件由 tableListeners 统一处理
      const filtered = {}
      Object.keys(rest).forEach(key => {
        // 只过滤掉映射表中定义的事件监听器
        if (!eventToListenerMap.has(key)) {
          filtered[key] = rest[key]
        }
      })

      // 关键修复：动态覆盖 default-sort，解决桌面/移动模式切换时丢失排序箭头的问题
      // 当表格重新加载（v-if 切换）时，el-table 会读取最新的 default-sort
      filtered['default-sort'] = {
        prop: sortState.prop,
        order: sortState.order
      }

      return {
        ...filtered,
        rowKey: props.rowKey
      }
    })

    // ========== 暴露 el-table 方法 ==========
    const exposedMethods = {
      /** 滚动到指定位置 */
      scrollTo: (...args) => {
        if (elTableRef.value) {
          elTableRef.value.scrollTo(...args)
        } else if (mobileContainerRef.value) {
          mobileContainerRef.value.scrollTo(...args)
        }
      },
      /** 清空选择 */
      clearSelection: () => {
        if (elTableRef.value) {
          elTableRef.value.clearSelection()
        } else {
          selectedRows.value = []
          emit('selection-change', [])
        }
      },
      /** 切换行选中状态 */
      toggleRowSelection: (row, selected) => {
        if (elTableRef.value) {
          elTableRef.value.toggleRowSelection(row, selected)
        } else {
          toggleRowSelect(
            row,
            selected !== undefined ? selected : !isRowSelected(row)
          )
        }
      },
      /** 切换全选 */
      toggleAllSelection: () => {
        if (elTableRef.value) {
          elTableRef.value.toggleAllSelection()
        } else {
          handleSelectAll(!isAllSelected.value)
        }
      },
      /** 设置当前行 */
      setCurrentRow: row => {
        if (elTableRef.value) {
          elTableRef.value.setCurrentRow(row)
        }
      },
      /** 清空排序 */
      clearSort: () => {
        if (elTableRef.value) {
          elTableRef.value.clearSort()
        }
        sortState.prop = ''
        sortState.order = null
        mobileSortProp.value = ''
        mobileSortOrder.value = 'ascending'
      },
      /** 清空过滤 */
      clearFilter: columnKeys => {
        if (elTableRef.value) {
          elTableRef.value.clearFilter(columnKeys)
        }
      },
      /** 手动排序 */
      sort: (prop, order) => {
        if (elTableRef.value) {
          elTableRef.value.sort(prop, order)
        } else {
          mobileSortProp.value = prop
          mobileSortOrder.value = order || 'ascending'
          handleMobileSortChange(prop)
        }
      },
      /** 获取 el-table 原始 ref（桌面端） */
      getElTableRef: () => elTableRef.value,
      /** 当前是否为移动端 */
      isMobile
    }

    expose(exposedMethods)

    return {
      isMobile,
      elTableRef,
      mobileContainerRef,
      registeredColumns,
      normalColumns,
      actionColumns,
      hasSelection,
      sortableColumns,
      selectedRows,
      isAllSelected,
      isIndeterminate,
      mobileSortProp,
      mobileSortOrder,
      tableAttrs,
      tableListeners,
      flattenedData,
      getRowKey,
      isRowSelected,
      toggleRowSelect,
      handleSelectAll,
      handleMobileSortChange,
      toggleMobileSortOrder,
      handleCardClick
    }
  }
}
</script>

<style scoped>
/* ========== 移动端容器 ========== */
.responsive-table-mobile {
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ========== 工具栏 ========== */
.responsive-table-mobile__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--el-bg-color-page, #f5f7fa);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.responsive-table-mobile__sort {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ========== 卡片列表 ========== */
.responsive-table-mobile__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
}

.responsive-table-mobile__row-container {
  position: relative;
  display: flex;
  align-items: stretch;
}

/* 树形连接线 */
.responsive-table-mobile__tree-connector {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}

.responsive-table-mobile__tree-line {
  position: absolute;
  top: -12px; /* 向上延伸连接到上一个 Row 的 Gap */
  bottom: 0;
  width: 1px;
  background-color: var(--el-border-color-lighter, #ebeef5);
}

/* 第一行不需要向上连线 */
.responsive-table-mobile__row-container:first-child
  .responsive-table-mobile__tree-line {
  top: 24px;
}

.responsive-table-mobile__tree-line.is-last-level {
  background-color: var(--el-border-color-lighter, #a0cfff);
  width: 2px;
}

/* 最后一个层级的横向横线，形成 L 形 */
.responsive-table-mobile__tree-line.is-last-level::after {
  content: '';
  position: absolute;
  top: 24px;
  left: 0;
  width: 12px;
  height: 2px;
  background-color: var(--el-border-color-lighter, #a0cfff);
}

/* ========== 单个卡片 ========== */
.responsive-table-card {
  flex: 1;
  min-width: 0;
  position: relative;
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
}

/* 有子级的卡片 */
/* .responsive-table-card--has-children {
  border-left: 3px solid var(--el-border-color-lighter, #a0cfff);
} */

.responsive-table-card:hover {
  border-color: var(--el-color-primary-light-5, #a0cfff);
}

.responsive-table-card--selected {
  border-color: var(--el-color-primary, #409eff);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-7, #c6e2ff);
}

/* 选择框 */
.responsive-table-card__selection {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

/* 卡片主体 */
.responsive-table-card__body {
  padding: 12px 14px;
}

/* 单个字段行 */
.responsive-table-card__field {
  display: flex;
  padding: 6px 0;
  line-height: 1.5;
  border-bottom: 1px dashed var(--el-border-color-extra-light, #f0f0f0);
  gap: 8px;
}

.responsive-table-card__field:last-child {
  border-bottom: none;
}

/* 字段标签 */
.responsive-table-card__label {
  flex-shrink: 0;
  width: 80px;
  min-width: 80px;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
  /* word-break: keep-all; */
}

/* 字段值 */
.responsive-table-card__value {
  flex: 1;
  min-width: 0;
  color: var(--el-text-color-primary, #303133);
  font-size: 13px;
  word-break: break-all;
}

/* 操作区域 */
.responsive-table-card__actions {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-top: 1px solid var(--el-border-color-lighter, #e4e7ed);
  background: var(--el-bg-color-page, #fafafa);
  flex-wrap: wrap;
}

/* ========== 空状态 ========== */
.responsive-table-mobile__empty {
  padding: 40px 0;
  text-align: center;
}
</style>
