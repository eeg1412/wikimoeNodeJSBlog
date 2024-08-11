import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'cropperjs/dist/cropper.css';
import '@/assets/css/common.css'
import 'photoswipe/style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Cropper from '@/components/Cropper.vue'
import IpInfoDisplay from '@/components/IpInfoDisplay.vue'
import { formatDate } from '@/utils/utils'
import { initRichEditor } from '@/utils/richEditor'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


const app = createApp(App)
app.component('Cropper', Cropper)
app.component('IpInfoDisplay', IpInfoDisplay)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, {
  locale: zhCn,
}).use(store).use(router).mount('#app')

initRichEditor()

// 时间转时间戳
const formatTimestamp = (time) => {
  return new Date(time).getTime()
}
app.config.globalProperties.$formatDate = formatDate;
app.config.globalProperties.$formatTimestamp = formatTimestamp;

