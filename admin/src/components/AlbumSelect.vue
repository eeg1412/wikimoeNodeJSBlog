<template>
  <el-select
    v-model="albumId"
    placeholder="请选择相册"
    filterable
    :clearable="clearable"
    remote
    :remote-method="searchAlbumsRemote"
    @change="onAlbumChange"
    :automatic-dropdown="true"
    class="attachments-form-item"
    :key="selectorKey"
  >
    <el-option
      v-for="item in albumList"
      :key="item._id"
      :label="item.name"
      :value="item._id"
    />
  </el-select>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { authApi } from '@/api'

export default {
  props: {
    modelValue: String,
    // 默认列表
    defaultList: {
      type: Array,
      default: () => [],
    },
    clearable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'albumChange'],
  setup(props, { emit }) {
    const albumId = ref(props.modelValue)
    const albumList = ref([...props.defaultList])
    const keyword = ref('')

    const selectorKey = ref(0)

    watch(
      () => props.defaultList,
      (newVal) => {
        albumList.value = newVal
        selectorKey.value++
      }
    )

    const getAlbumList = async () => {
      const params = {
        page: 1,
        size: 10,
        keyword: keyword.value,
      }
      await authApi.getAlbumList(params, { noLoading: true }).then((res) => {
        albumList.value = res.data.list
      })
    }

    let searchTimer = null
    const searchAlbumsRemote = (query) => {
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        keyword.value = query
        getAlbumList()
      }, 100)
    }

    const onAlbumChange = (value) => {
      const selectedAlbum = albumList.value.find((album) => album._id === value)
      emit('update:modelValue', value)
      emit('albumChange', selectedAlbum)
    }

    watch(
      () => props.modelValue,
      (newVal) => {
        albumId.value = newVal
      }
    )

    return {
      albumId,
      albumList,
      selectorKey,
      searchAlbumsRemote,
      onAlbumChange,
    }
  },
}
</script>
