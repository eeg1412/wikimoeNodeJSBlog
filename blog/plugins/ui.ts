export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()

    let timer: ReturnType<typeof setTimeout> | null = null

    if (import.meta.client) {
      watch(appConfig.ui, () => {
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          const el = document.querySelector('style#nuxt-ui-colors')
          window.localStorage.setItem('nuxt-ui-root', el?.innerHTML || '')
          timer = null
        }, 200)
      })

      appConfig.ui.primary =
        window.localStorage.getItem('nuxt-ui-primary') || appConfig.ui.primary
    }

    if (import.meta.server) {
      useHead({
        script: [
          {
            innerHTML: `
                if (localStorage.getItem('nuxt-ui-root')) {
                  document.querySelector('style#nuxt-ui-colors').innerHTML = localStorage.getItem('nuxt-ui-root')
                }`.replace(/\s+/g, ' '),
            type: 'text/javascript',
            tagPriority: -1
          }
        ]
      })
    }
  }
})
