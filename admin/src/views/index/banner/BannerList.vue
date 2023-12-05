<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>横幅列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body"></div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- 横幅 -->
    <div class="mb20"></div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const bannerList = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getBannerList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getBannerList(params)
        .then((res) => {
          bannerList.value = res.data.list
          total.value = res.data.total
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: 'BannerAdd',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getBannerList()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: 'BannerEdit',
        params: {
          id,
        },
      })
    }
    const deleteBanner = (id) => {
      ElMessageBox.confirm('确定要删除吗？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          const params = {
            id,
          }
          authApi
            .deleteBanner(params)
            .then(() => {
              ElMessage.success('删除成功')
              getBannerList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }
    onMounted(() => {
      initParams()
      getBannerList()
    })
    return {
      bannerList,
      params,
      total,
      getBannerList,
      handleAdd,
      goEdit,
      deleteBanner,
    }
  },
}
</script>
<style lang=""></style>
