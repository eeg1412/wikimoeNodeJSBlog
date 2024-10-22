<template>
  <div class="common-right-panel-form common-limit-width config-com-body">
    <h3 class="common-title">设置</h3>
    <el-tabs v-model="activeName">
      <el-tab-pane label="网站设置" name="site">
        <ConfigSiteSettingsForm v-if="activeName === 'site'" />
      </el-tab-pane>
      <!-- 文章页设置 -->
      <el-tab-pane label="文章页设置" name="post">
        <ConfigSitePostForm v-if="activeName === 'post'" />
      </el-tab-pane>
      <el-tab-pane label="评论设置" name="comment">
        <ConfigCommentSettingsForm v-if="activeName === 'comment'" />
      </el-tab-pane>
      <el-tab-pane label="RSS设置" name="rss">
        <ConfigRssSettingsForm v-if="activeName === 'rss'" />
      </el-tab-pane>
      <el-tab-pane label="媒体设置" name="media">
        <ConfigMediaForm v-if="activeName === 'media'" />
      </el-tab-pane>
      <!-- 邮件设置 -->
      <el-tab-pane label="邮件设置" name="email">
        <ConfigEmailSettingsForm v-if="activeName === 'email'" />
      </el-tab-pane>
      <!-- 其他设置 -->
      <el-tab-pane label="其他设置" name="other">
        <ConfigOtherSettingsForm v-if="activeName === 'other'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
// ElMessage
import { ElMessage, ElMessageBox } from 'element-plus'
import ConfigSiteSettingsForm from '@/components/ConfigSiteSettingsForm'
import ConfigCommentSettingsForm from '@/components/ConfigCommentSettingsForm'
import ConfigRssSettingsForm from '@/components/ConfigRssSettingsForm'
import ConfigMediaForm from '@/components/ConfigMediaForm'
import ConfigEmailSettingsForm from '@/components/ConfigEmailSettingsForm'
import ConfigOtherSettingsForm from '@/components/ConfigOtherSettingsForm'
import ConfigSitePostForm from '@/components/ConfigSitePostForm'
export default {
  components: {
    ConfigSiteSettingsForm,
    ConfigCommentSettingsForm,
    ConfigRssSettingsForm,
    ConfigMediaForm,
    ConfigEmailSettingsForm,
    ConfigOtherSettingsForm,
    ConfigSitePostForm,
  },
  setup() {
    const activeName = ref('site')

    onMounted(() => {})
    return {
      activeName,
    }
  },
}
</script>
<style scoped>
.config-border-item {
  border: 1px solid #ebeef5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
}
.config-border-item-title {
  font-weight: 600;
  margin-bottom: 10px;
}
.config-border-item-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
  padding-left: 10px;
}
</style>
