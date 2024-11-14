<template>
  <el-select
    v-model="selectedSort"
    :placeholder="placeholder"
    clearable
    :style="{ width: width }"
  >
    <el-option
      v-for="item in sortList"
      :key="item._id"
      :label="item.sortname"
      :value="item._id"
    ></el-option>
  </el-select>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { authApi } from '@/api'

export default {
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请选择分类',
    },
    width: {
      type: String,
      default: '120px',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const sortList = ref([])

    const getSortList = () => {
      authApi.getSortList().then((res) => {
        const list = res.data.data
        const newlist = []
        list.forEach((item) => {
          newlist.push(item)
          if (item.children && item.children.length) {
            item.children.forEach((child) => {
              child.sortname = '└─ ' + child.sortname
            })
            newlist.push(...item.children)
          }
        })
        sortList.value = newlist
      })
    }

    const selectedSort = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    onMounted(() => {
      getSortList()
    })

    return {
      sortList,
      selectedSort,
    }
  },
}
</script>
