import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getOptionsApi } from '~/api/option'

export const useOptionStore = defineStore('options', () => {
  const options = ref(null)
  async function getOptions() {
    await getOptionsApi().then((res: any) => {
      options.value = res.data.value.data
    })
  }
  return { options, getOptions }
})
