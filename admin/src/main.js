import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'cropperjs/dist/cropper.css'
import '@photo-sphere-viewer/core/index.css'
import '@/assets/css/common.css'
import 'photoswipe/style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Cropper from '@/components/Cropper.vue'
import IpInfoDisplay from '@/components/IpInfoDisplay.vue'
import TagsInput from '@/components/TagsInput.vue'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import ResponsiveTableColumn from '@/components/ResponsiveTableColumn.vue'
import { formatDate, limitStr } from '@/utils/utils'
import { initRichEditor } from '@/utils/richEditor'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { applyThemeToDom } from '@/utils/theme.js'

const renderStartupError = message => {
  const appElement = document.querySelector('#app')
  if (!appElement) return
  appElement.textContent = message
  appElement.style.padding = '24px'
  appElement.style.whiteSpace = 'pre-wrap'
}

const initTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme-preference')
    const savedFollowSystem = localStorage.getItem('theme-follow-system')
    if (savedFollowSystem === 'true') {
      const isDarkMode =
        window.matchMedia('(prefers-color-scheme: dark)')?.matches || false
      applyThemeToDom(isDarkMode ? 'dark' : 'light')
      return
    }
    applyThemeToDom(savedTheme || 'light')
  } catch (error) {
    console.error('初始化主题失败', error)
    applyThemeToDom('light')
  }
}

initTheme()

const app = createApp(App)
app.component('Cropper', Cropper)
app.component('IpInfoDisplay', IpInfoDisplay)
app.component('TagsInput', TagsInput)
app.component('ResponsiveTable', ResponsiveTable)
app.component('ResponsiveTableColumn', ResponsiveTableColumn)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.config.errorHandler = error => {
  console.error('后台应用运行异常', error)
}
try {
  app.use(ElementPlus, {
    locale: zhCn
  })
  app.use(store)
  app.use(router)
  app.mount('#app')
} catch (error) {
  console.error('后台应用启动失败', error)
  renderStartupError('后台加载失败，请刷新页面重试。')
}

try {
  initRichEditor()
} catch (error) {
  console.error('初始化编辑器失败', error)
}

// 时间转时间戳
const formatTimestamp = time => {
  return new Date(time).getTime()
}

app.config.globalProperties.$formatDate = formatDate
app.config.globalProperties.$formatTimestamp = formatTimestamp
app.config.globalProperties.$limitStr = limitStr
