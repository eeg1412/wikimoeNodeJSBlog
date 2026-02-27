/**
 * AlbumPhotoSwipe 全局单例服务
 * 通过注册 open 回调，在整个应用中共享同一个 AlbumPhotoSwipe 实例，
 * 避免在每个使用方（如 ACGNItem）中重复挂载组件实例。
 */

/** @type {((id: string) => void) | null} */
let _openFn = null

export function useAlbumPhotoSwipe() {
  /**
   * 由挂载在布局中的单例组件调用，注册其 open 方法
   * @param {(id: string) => void} fn
   */
  function register(fn) {
    _openFn = fn
  }

  /**
   * 打开指定相册
   * @param {string} albumId
   */
  function openAlbum(albumId) {
    if (_openFn) {
      _openFn(albumId)
    }
  }

  return { register, openAlbum }
}
