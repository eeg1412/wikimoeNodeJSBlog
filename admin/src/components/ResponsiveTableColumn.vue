<template>
  <!--
    ResponsiveTableColumn - 响应式表格列组件
    桌面端：渲染标准 el-table-column
    移动端：注册列定义供 ResponsiveTable 卡片渲染使用

    用法与 el-table-column 完全一致，额外支持：
      - cardHidden: boolean  在移动端卡片模式下隐藏该列
      - cardAction: boolean  在移动端卡片模式下作为操作列显示在卡片底部
                             （默认 fixed="right" 的列自动识别为操作列）
  -->

  <!-- 桌面端：标准 el-table-column -->
  <el-table-column v-if="!parentIsMobile" v-bind="columnProps">
    <!-- 传递 default slot -->
    <template v-if="$slots.default" #default="scope">
      <slot name="default" v-bind="scope" />
    </template>
    <!-- <template v-else #default="scope">
      {{ getNestedValue(scope.row, columnProps.prop) }}
    </template> -->
    <!-- 传递 header slot -->
    <template v-if="$slots.header" #header="scope">
      <slot name="header" v-bind="scope" />
    </template>
    <!-- 嵌套子列 slot -->
    <!-- <slot name="nested" /> -->
  </el-table-column>

  <!-- 移动端：不渲染可见内容，仅注册列定义 -->
  <!-- 保持组件挂载以便注册生效 -->
</template>

<script>
import {
  inject,
  onBeforeUnmount,
  useSlots,
  useAttrs,
  computed,
  watch,
  toRefs
} from 'vue'

// 全局自增ID生成器
let columnIdCounter = 0

/**
 * 根据点号路径获取嵌套属性值
 * 例如 getNestedValue(row, 'author.nickname') => row.author.nickname
 */
// function getNestedValue(obj, path) {
//   if (!path || !obj) return ''
//   return path.split('.').reduce((acc, key) => {
//     return acc && acc[key] !== undefined ? acc[key] : ''
//   }, obj)
// }

export default {
  name: 'ResponsiveTableColumn',
  inheritAttrs: false,
  props: {
    /** 列类型：selection / index / expand */
    type: { type: String, default: '' },
    /** 对应数据字段名 */
    prop: { type: String, default: '' },
    /** 列标题 */
    label: { type: String, default: '' },
    /** 列宽度 */
    width: { type: [String, Number], default: '' },
    /** 列最小宽度 */
    minWidth: { type: [String, Number], default: '' },
    /** 固定列方向 */
    fixed: { type: [String, Boolean], default: false },
    /** 是否可排序 */
    sortable: { type: [Boolean, String], default: false },
    /** 列对齐方式 */
    align: { type: String, default: '' },
    /** 表头对齐方式 */
    headerAlign: { type: String, default: '' },
    /** 格式化函数 */
    formatter: { type: Function, default: null },
    /** 是否显示 overflow tooltip */
    showOverflowTooltip: { type: Boolean, default: false },
    /** 自定义类名 */
    className: { type: String, default: '' },
    /** 自定义表头类名 */
    labelClassName: { type: String, default: '' },
    /** 是否可调整列宽 */
    resizable: { type: Boolean, default: true },
    /** 筛选数据 */
    filters: { type: Array, default: () => [] },
    /** 筛选方法 */
    filterMethod: { type: Function, default: null },
    /** 筛选值 */
    filteredValue: { type: Array, default: () => [] },
    /** 多选筛选 */
    filterMultiple: { type: Boolean, default: true },
    /** 筛选弹出框位置 */
    filterPlacement: { type: String, default: '' },
    /** 是否可选 */
    selectable: { type: Function, default: null },
    /** 翻页保持选中 */
    reserveSelection: { type: Boolean, default: false },

    // ===== 自定义扩展 props =====
    /** 在移动端卡片模式下隐藏该列 */
    cardHidden: { type: Boolean, default: false },
    /** 在移动端卡片模式下作为操作区显示在卡片底部 */
    cardAction: { type: Boolean, default: false }
  },
  setup(props) {
    const slots = useSlots()
    const attrs = useAttrs()
    const parentTable = inject('responsiveTable', null)

    // 生成唯一列 ID
    const columnId = Symbol(`col-${columnIdCounter++}`)

    // 计算当前是否为移动端
    const parentIsMobile = computed(() => parentTable?.isMobile?.value ?? false)

    // 判断是否为操作列：
    // 1. 显式设置了 cardAction
    // 2. fixed="right" 且没有 prop（常见操作列模式）
    const isAction = computed(() => {
      if (props.cardAction) return true
      if (props.fixed === 'right' && !props.prop && !props.type) return true
      return false
    })

    // 判断是否为选择列
    const isSelection = computed(() => props.type === 'selection')

    // 收集传递给 el-table-column 的 props（排除自定义扩展 props cardHidden / cardAction）
    const columnProps = computed(() => {
      // 以 $attrs 为基础（捕获未在 props 中声明的属性）
      const result = { ...attrs }
      // 将所有标准 el-table-column props 传入
      const standardPropKeys = [
        'type',
        'prop',
        'label',
        'width',
        'minWidth',
        'fixed',
        'sortable',
        'align',
        'headerAlign',
        'formatter',
        'showOverflowTooltip',
        'className',
        'labelClassName',
        'resizable',
        'filters',
        'filterMethod',
        'filteredValue',
        'filterMultiple',
        'filterPlacement',
        'selectable',
        'reserveSelection'
      ]
      standardPropKeys.forEach(key => {
        const val = props[key]
        // 跳过空默认值，避免覆盖 el-table-column 自身默认值
        if (
          val === '' ||
          val === null ||
          (Array.isArray(val) && val.length === 0)
        ) {
          return
        }
        result[key] = val
      })
      return result
    })

    // 向父组件注册列定义
    if (parentTable) {
      const colDef = {
        columnId,
        type: props.type,
        prop: props.prop,
        label: props.label,
        width: props.width,
        minWidth: props.minWidth,
        fixed: props.fixed,
        sortable: props.sortable,
        cardHidden: props.cardHidden,
        cardAction: props.cardAction,
        isAction: isAction.value,
        isSelection: isSelection.value,
        // 渲染函数：使用 #default slot
        renderFn: slots.default || null
      }

      parentTable.registerColumn(colDef)

      // 监听 slot 变化并更新渲染函数
      watch(
        () => slots.default,
        newSlot => {
          parentTable.updateColumnRenderFn(columnId, newSlot || null)
        }
      )

      // 监听关键 prop 变化，同步更新已注册的列定义
      watch(
        () => [
          props.label,
          props.prop,
          props.cardHidden,
          props.cardAction,
          isAction.value,
          isSelection.value
        ],
        ([
          newLabel,
          newProp,
          newCardHidden,
          newCardAction,
          newIsAction,
          newIsSelection
        ]) => {
          // 找到已注册的列定义并更新
          const existingCol = parentTable._getColumn?.(columnId)
          if (existingCol) {
            existingCol.label = newLabel
            existingCol.prop = newProp
            existingCol.cardHidden = newCardHidden
            existingCol.cardAction = newCardAction
            existingCol.isAction = newIsAction
            existingCol.isSelection = newIsSelection
          }
        }
      )

      onBeforeUnmount(() => {
        parentTable.unregisterColumn(columnId)
      })
    }

    return {
      parentIsMobile,
      columnProps
      // getNestedValue
    }
  }
}
</script>
