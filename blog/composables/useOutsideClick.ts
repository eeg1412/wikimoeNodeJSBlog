import { onMounted, onUnmounted, type Ref } from 'vue'

interface UseOutsideClickOptions {
  enabled?: boolean
  ignore?: (string | Element | Ref<Element | null> | (() => Element | null))[]
}

/**
 * 检测元素外部点击的 composable
 * @param elementRef - 要监听的元素 ref
 * @param callback - 点击外部时的回调函数
 * @param options - 配置选项
 */
export const useOutsideClick = (
  elementRef: Ref<Element | null>,
  callback: (event: Event) => void,
  options: UseOutsideClickOptions = {}
) => {
  const { enabled = true, ignore = [] } = options

  const handleClick = (event: Event) => {
    if (!enabled) return

    const element = unref(elementRef)
    if (!element) return

    // 检查点击的元素是否在目标元素内部
    if (element.contains(event.target as Node)) return

    // 检查是否在忽略列表中
    const isIgnored = ignore.some(selector => {
      console.log('Checking ignore condition for:', selector)
      if (typeof selector === 'string') {
        return (event.target as Element).closest(selector)
      }
      // 处理 Element 类型
      if (
        selector &&
        'contains' in selector &&
        typeof selector.contains === 'function'
      ) {
        console.log('处理 Element 类型')
        return selector.contains(event.target as Node)
      }
      // 处理函数类型
      if (typeof selector === 'function') {
        console.log('处理函数类型')
        const element = selector()
        return element && element.contains(event.target as Node)
      }
      // 处理 Ref<Element> 类型
      if (selector && 'value' in selector) {
        console.log('处理 Ref<Element> 类型')
        const element = unref(selector as Ref<Element | null>)
        return element && element.contains(event.target as Node)
      }
      return false
    })

    if (isIgnored) return

    // 执行回调
    callback(event)
  }

  onMounted(() => {
    console.log('Adding event listeners for outside click')
    document.addEventListener('mousedown', handleClick, true)
    document.addEventListener('touchstart', handleClick, true)
  })

  onUnmounted(() => {
    console.log('Removing event listeners for outside click')
    document.removeEventListener('mousedown', handleClick, true)
    document.removeEventListener('touchstart', handleClick, true)
  })

  return {
    stop: () => {
      document.removeEventListener('mousedown', handleClick, true)
      document.removeEventListener('touchstart', handleClick, true)
    }
  }
}
