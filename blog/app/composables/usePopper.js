import { ref, onMounted, watchEffect } from 'vue'
import {
  popperGenerator,
  defaultModifiers
} from '@popperjs/core/lib/popper-lite'
import flip from '@popperjs/core/lib/modifiers/flip'
import offset from '@popperjs/core/lib/modifiers/offset'
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow'
import computeStyles from '@popperjs/core/lib/modifiers/computeStyles'
import eventListeners from '@popperjs/core/lib/modifiers/eventListeners'
import arrowModifier from '@popperjs/core/lib/modifiers/arrow'

const createPopper = popperGenerator({
  defaultModifiers: [
    ...defaultModifiers,
    offset,
    flip,
    preventOverflow,
    computeStyles,
    eventListeners,
    arrowModifier
  ]
})

/**
 * 从 ref 中获取真实的 DOM 元素
 * 替代 @vueuse/core 的 unrefElement
 */
function unrefElement(elRef) {
  const plain = unref(elRef)
  if (!plain) return null
  // 如果是 Vue 组件实例，取 $el
  if (plain.$el) return plain.$el
  return plain
}

/**
 * usePopper composable — 基于 @popperjs/core 的弹出定位
 * 参照 ui-2 的实现，适配 blog 项目 (JS)
 *
 * @param {Object} options - PopperOptions
 * @param {boolean}  [options.locked=false]
 * @param {number}   [options.overflowPadding=8]
 * @param {number}   [options.offsetDistance=8]
 * @param {number}   [options.offsetSkid=0]
 * @param {boolean}  [options.gpuAcceleration=true]
 * @param {boolean}  [options.adaptive=true]
 * @param {boolean}  [options.scroll=true]
 * @param {boolean}  [options.resize=true]
 * @param {boolean}  [options.arrow=false]
 * @param {string}   [options.placement]
 * @param {string}   [options.strategy]
 * @returns {[Ref, Ref, Ref]} [referenceRef, popperRef, instanceRef]
 */
export function usePopper({
  locked = false,
  overflowPadding = 8,
  offsetDistance = 8,
  offsetSkid = 0,
  gpuAcceleration = true,
  adaptive = true,
  scroll = true,
  resize = true,
  arrow = false,
  placement,
  strategy
} = {}) {
  const reference = ref(null)
  const popper = ref(null)
  const instance = ref(null)

  onMounted(() => {
    watchEffect(onInvalidate => {
      const popperEl = unrefElement(popper)
      const referenceEl = unrefElement(reference)

      if (!popperEl || !(popperEl instanceof HTMLElement)) return
      if (!referenceEl) return

      const config = {
        modifiers: [
          {
            name: 'flip',
            enabled: !locked
          },
          {
            name: 'preventOverflow',
            options: {
              padding: overflowPadding
            }
          },
          {
            name: 'offset',
            options: {
              offset: [offsetSkid, offsetDistance]
            }
          },
          {
            name: 'computeStyles',
            options: {
              adaptive,
              gpuAcceleration
            }
          },
          {
            name: 'eventListeners',
            options: {
              scroll,
              resize
            }
          },
          {
            name: 'arrow',
            enabled: arrow
          }
        ]
      }

      if (placement) {
        config.placement = placement
      }
      if (strategy) {
        config.strategy = strategy
      }

      instance.value = createPopper(referenceEl, popperEl, config)

      onInvalidate(() => {
        if (instance.value) {
          instance.value.destroy()
          instance.value = null
        }
      })
    })
  })

  return [reference, popper, instance]
}
