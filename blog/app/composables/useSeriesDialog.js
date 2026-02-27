/**
 * SeriesDialog 全局单例服务
 * 通过注册 open 回调，在整个应用中共享同一个 SeriesDialog 实例，
 * 避免在每个使用方（如 ACGNItem）中重复挂载组件实例。
 */

/** @type {((id: string) => void) | null} */
let _openFn = null

export function useSeriesDialog() {
  /**
   * 由挂载在布局中的单例组件调用，注册其 open 方法
   * @param {(id: string) => void} fn
   */
  function register(fn) {
    _openFn = fn
  }

  /**
   * 打开指定系列对话框
   * @param {string} seriesId
   */
  function openSeries(seriesId) {
    if (_openFn) {
      _openFn(seriesId)
    }
  }

  return { register, openSeries }
}
