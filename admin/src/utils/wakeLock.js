/**
 * 屏幕常亮（Screen Wake Lock）管理工具。
 * 使用引用计数支持多个并发操作（图片上传、视频上传、视频编码）同时持有；
 * 当且仅当所有操作都结束后才真正释放，避免手机在上传/编码过程中息屏。
 */

let wakeLockSentinel = null
let activeCount = 0
let visibilityListenerBound = false

function isWakeLockSupported() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

async function acquireSentinel() {
  if (!isWakeLockSupported() || wakeLockSentinel) {
    return
  }
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen')
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null
    })
  } catch (error) {
    // 部分浏览器或非安全上下文会拒绝申请，静默降级
    wakeLockSentinel = null
  }
}

async function releaseSentinel() {
  if (!wakeLockSentinel) {
    return
  }
  try {
    await wakeLockSentinel.release()
  } catch (error) {
    // 释放异常忽略
  }
  wakeLockSentinel = null
}

function bindVisibilityListener() {
  if (visibilityListenerBound || typeof document === 'undefined') {
    return
  }
  visibilityListenerBound = true
  // 页面切回前台时，如果仍有进行中的操作则重新申请（Wake Lock 在页面隐藏时会自动释放）
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && activeCount > 0) {
      acquireSentinel()
    }
  })
}

/**
 * 申请一次屏幕常亮（引用计数 +1）
 */
export async function requestScreenWakeLock() {
  bindVisibilityListener()
  activeCount++
  if (activeCount === 1) {
    await acquireSentinel()
  }
}

/**
 * 释放一次屏幕常亮（引用计数 -1），计数归零时真正释放
 */
export async function releaseScreenWakeLock() {
  if (activeCount > 0) {
    activeCount--
  }
  if (activeCount === 0) {
    await releaseSentinel()
  }
}
