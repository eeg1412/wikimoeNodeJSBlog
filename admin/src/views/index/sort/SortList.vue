<template>
  <div class="common-right-panel-form">
    <h3 class="common-title">分类列表</h3>
    <div class="clearfix pb20 pt10">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { useRouter } from 'vue-router'
export default {
  setup() {
    const router = useRouter()
    const handleAdd = () => {
      router.push({
        name: 'SortAdd',
      })
    }
    return {
      handleAdd,
    }
  },
}
</script>
<style lang=""></style>
