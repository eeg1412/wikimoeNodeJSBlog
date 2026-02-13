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
        v-for="(row, rowIndex) in data"
        :key="getRowKey(row, rowIndex)"
        class="responsive-table-card"
        :class="{
          'responsive-table-card--selected': isRowSelected(row)
        }"
        @click="handleCardClick(row, rowIndex, $event)"
      >
        <!-- 选择框 -->
        <div v-if="hasSelection" class="responsive-table-card__selection">
          <el-checkbox
            :model-value="isRowSelected(row)"
            @change="val => toggleRowSelect(row, val)"
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
                :row="row"
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
              :row="row"
              :row-index="rowIndex"
            />
          </template>
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

    // ========== 选择功能（移动端） ==========
    const selectedRows = ref([])

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
      set: () => {} // 由 handleSelectAll 控制
    })

    const isIndeterminate = computed(() => {
      if (!props.data || props.data.length === 0) return false
      const count = props.data.filter(row => isRowSelected(row)).length
      return count > 0 && count < props.data.length
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
    const mobileSortProp = ref('')
    const mobileSortOrder = ref('ascending')

    const handleMobileSortChange = () => {
      if (!mobileSortProp.value) {
        emit('sort-change', { column: null, prop: null, order: null })
        return
      }
      emit('sort-change', {
        column: { property: mobileSortProp.value },
        prop: mobileSortProp.value,
        order: mobileSortOrder.value
      })
    }

    const toggleMobileSortOrder = () => {
      mobileSortOrder.value =
        mobileSortOrder.value === 'ascending' ? 'descending' : 'ascending'
      handleMobileSortChange()
    }

    // ========== 事件处理 ==========
    const handleCardClick = (row, index, event) => {
      emit('row-click', row, null, event)
    }

    // 构建传递给 el-table 的事件监听器
    const tableListeners = computed(() => {
      const listeners = {}
      const events = [
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
      events.forEach(event => {
        const handlerName =
          'on' +
          event
            .split('-')
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join('')
        listeners[handlerName] = (...args) => emit(event, ...args)
      })
      return listeners
    })

    // 过滤掉自定义 props，其余传递给 el-table
    const tableAttrs = computed(() => {
      const { mobileBreakpoint, ...rest } = attrs
      return {
        ...rest,
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
        } else {
          mobileSortProp.value = ''
          mobileSortOrder.value = 'ascending'
        }
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
          handleMobileSortChange()
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
  gap: 10px;
}

/* ========== 单个卡片 ========== */
.responsive-table-card {
  position: relative;
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

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
