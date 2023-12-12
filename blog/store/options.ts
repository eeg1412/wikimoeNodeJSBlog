import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getOptionsApi } from '~/api/option'

export const useOptionStore = defineStore('options', () => {
  const options = ref(null)
  function getOptions() {
    getOptionsApi().then((res: any) => {
      const data = res.data.value.data
      // data是数组
      // 遍历数组，将数组转换为对象
      const optionsObj: any = {}
      data.forEach((item: any) => {
        optionsObj[item.name] = item.value
      })
      options.value = optionsObj
    })
  }
  return { options, getOptions }
})
