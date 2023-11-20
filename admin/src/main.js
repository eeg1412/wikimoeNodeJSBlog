import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'cropperjs/dist/cropper.css';
import '@/assets/css/common.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Cropper from '@/components/Cropper.vue'
import { formatDate } from '@/utils/utils'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


const app = createApp(App)
app.component('Cropper', Cropper)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, {
  locale: zhCn,
}).use(store).use(router).mount('#app')

app.config.globalProperties.$formatDate = formatDate;

