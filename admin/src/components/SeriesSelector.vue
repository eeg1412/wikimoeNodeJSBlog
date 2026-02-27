<template>
  <el-select
    v-model="selectedId"
    placeholder="请选择系列"
    clearable
    filterable
    remote
    :remote-method="remoteSearch"
    :loading="loading"
    :style="{ width: width }"
    @change="handleChange"
  >
    <el-option
      v-for="item in seriesList"
      :key="item._id"
      :label="item.name"
      :value="item._id"
    ></el-option>
  </el-select>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { authApi } from '@/api'

export default {
  name: 'SeriesSelector',
  props: {
    modelValue: {
      type: String,
      default: null
    },
    width: {
      type: String,
      default: '200px'
    },
    placeholder: {
      type: String,
      default: '请选择系列'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedId = ref(props.modelValue)
    const seriesList = ref([])
    const loading = ref(false)
    let searchTimer = null

    const fetchSeriesList = keyword => {
      loading.value = true
      const params = {
        page: 1,
        size: 50,
        keyword: keyword || ''
      }
      authApi
        .getAcgnSeriesList(params, true)
        .then(res => {
          seriesList.value = res.data.list
        })
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    }

    const remoteSearch = query => {
      if (searchTimer) {
        clearTimeout(searchTimer)
      }
      searchTimer = setTimeout(() => {
        fetchSeriesList(query)
      }, 100)
    }

    const handleChange = val => {
      emit('update:modelValue', val || null)
    }

    watch(
      () => props.modelValue,
      newVal => {
        selectedId.value = newVal
      }
    )

    onMounted(() => {
      fetchSeriesList()
    })

    return {
      selectedId,
      seriesList,
      loading,
      remoteSearch,
      handleChange
    }
  }
}
</script>
