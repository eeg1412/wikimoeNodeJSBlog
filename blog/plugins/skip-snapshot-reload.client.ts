// plugins/skip-snapshot-reload.client.ts
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  // 如果域名为web.archive.org
  if (window.location.hostname === 'web.archive.org') {
    // 页面跳转前弹窗
    window.addEventListener('beforeunload', function (e: BeforeUnloadEvent) {
      console.log('捕获到 beforeunload 事件')
      const confirmationMessage = '页面正在尝试刷新或跳转，您确定要离开吗？'
      // 推荐写法：设置 returnValue 并调用 preventDefault
      e.preventDefault()
      e.returnValue = confirmationMessage
      // 某些旧浏览器仍会读取返回值
      return confirmationMessage
    })
  }
})
