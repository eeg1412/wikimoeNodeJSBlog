<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>相册</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <AlbumTable :defaultParams="params" @paramsChange="paramsChange" />
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
import AlbumTable from '@/components/AlbumTable.vue'
export default {
  components: {
    AlbumTable,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }

    initParams()

    const paramsChange = (params) => {
      setSessionParams(route.name, params)
    }

    onMounted(() => {})

    return {
      params,
      paramsChange,
    }
  },
}
</script>
<style lang=""></style>
