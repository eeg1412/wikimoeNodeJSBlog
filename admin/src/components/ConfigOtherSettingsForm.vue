<template>
  <el-form
    :model="otherSettingsForm"
    :rules="otherSettingsRules"
    ref="otherSettingsFormRef"
    label-width="160px"
    v-if="inited"
  >
    <el-form-item label="引用域名白名单" prop="siteReferrerWhiteList">
      <!-- <el-input
        type="textarea"
        v-model="otherSettingsForm.siteReferrerWhiteList"
        placeholder="英文逗号隔开"
      ></el-input> -->
      <TagsInput
        v-model="otherSettingsForm.siteReferrerWhiteList"
        placeholder="输入引用域名"
      />
    </el-form-item>

    <el-form-item label="敏感关键词" prop="siteBannedKeywordList">
      <!-- <el-input
        type="textarea"
        v-model="otherSettingsForm.siteBannedKeywordList"
        placeholder="英文逗号隔开"
      ></el-input> -->
      <TagsInput
        v-model="otherSettingsForm.siteBannedKeywordList"
        placeholder="输入敏感关键词"
      />
      <div class="w_10">※会检查评论中的内容、昵称、网址是否包含敏感关键词</div>
    </el-form-item>

    <el-form-item
      label="排名统计来源忽略域名"
      prop="siteRankIgnoreReferrerDomainList"
    >
      <!-- <el-input
        type="textarea"
        v-model="otherSettingsForm.siteRankIgnoreReferrerDomainList"
        placeholder="英文逗号隔开"
      ></el-input> -->
      <TagsInput
        v-model="otherSettingsForm.siteRankIgnoreReferrerDomainList"
        placeholder="输入忽略域名"
      />
    </el-form-item>

    <!-- 是否统计爬虫的文章查看数 -->
    <el-form-item label="爬虫增加文章查看数">
      <el-switch
        v-model="otherSettingsForm.siteSpiderPostVisitEnabled"
      ></el-switch>
      <div class="w_10">※开启后，爬虫访问文章时也会增加文章查看数</div>
    </el-form-item>

    <!-- 管理员尝试登录尝试限制 -->
    <el-form-item label="管理员尝试登录限制">
      每　
      <el-input-number
        v-model.number="otherSettingsForm.siteAdminLoginAttemptTime"
        type="number"
        placeholder="单位时间（分钟）"
        style="width: 150px"
        min="1"
        max="60"
      >
      </el-input-number>
      　分钟内，允许尝试登录　
      <el-input-number
        v-model.number="otherSettingsForm.siteAdminLoginMaxAttempts"
        type="number"
        placeholder="最大尝试次数"
        style="width: 150px"
        min="1"
        max="9999"
      >
      </el-input-number
      >　次
      <div class="w_10">
        ※在单位时间内，管理员登录失败超过最大尝试次数后，将禁止登录，直到单位时间结束
      </div>
    </el-form-item>

    <el-form-item label="刷新密钥" v-if="adminInfo.role === 999">
      <el-button type="danger" @click="handleFlushSecret"
        >刷新管理端密钥</el-button
      >
      <!-- 刷新博客端密钥 -->
      <el-button type="danger" @click="handleFlushSecretBlog"
        >刷新博客端密钥</el-button
      >
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="otherSettingsSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import {
  formatResToForm,
  formatResToObj,
  fieldErrorNotice
} from '@/utils/utils'
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

export default {
  setup(props, { emit }) {
    const router = useRouter()
    // 其他设置
    const otherSettingsFormRef = ref(null)
    const otherSettingsForm = reactive({
      // 引用白名单
      siteReferrerWhiteList: '',
      // 禁止评论关键词
      siteBannedKeywordList: '',
      // 排名统计来源忽略域名
      siteRankIgnoreReferrerDomainList: '',
      // 是否统计爬虫的文章查看数
      siteSpiderPostVisitEnabled: true,
      // 管理员尝试登录的单位时间（分钟）
      siteAdminLoginAttemptTime: 5,
      // 管理员尝试登录的最大次数
      siteAdminLoginMaxAttempts: 3
    })
    const otherSettingsRules = {}
    const otherSettingsSubmit = () => {
      otherSettingsFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(otherSettingsForm).forEach(key => {
            params.push({
              name: key,
              value: otherSettingsForm[key]
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then(res => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(otherSettingsForm, obj)
              store.dispatch('setOptions')
              emit('submitSuccess')

              ElMessage.success('更新成功')
            })
            .catch(err => {
              console.log(err)
            })
        } else {
          // 弹窗
          fieldErrorNotice(fields)
          return false
        }
      })
    }
    const inited = ref(false)
    const getOptionList = () => {
      // 将otherSettingsForm的key转换为数组
      const params = {
        nameList: []
      }
      Object.keys(otherSettingsForm).forEach(key => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then(res => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(otherSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }
    const logout = () => {
      router.replace({
        name: 'Login'
      })
      // 清除token
      localStorage.removeItem('adminToken')
      sessionStorage.removeItem('adminToken')
    }
    const handleFlushSecret = () => {
      ElMessageBox.confirm(
        '确定要刷新管理端密钥吗？刷新后将立即登出，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          authApi.flushJWTSecretAdmin().then(() => {
            ElMessage.success('密钥已刷新')
            logout()
          })
        })
        .catch(() => {})
    }
    const handleFlushSecretBlog = () => {
      ElMessageBox.confirm('确定要刷新博客端密钥吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          authApi.flushJWTSecretBlog().then(() => {
            ElMessage.success('密钥已刷新')
          })
        })
        .catch(() => {})
    }

    const adminInfo = computed(() => {
      return store.getters.adminInfo
    })

    onMounted(() => {
      getOptionList()
    })
    return {
      otherSettingsFormRef,
      otherSettingsForm,
      otherSettingsRules,
      otherSettingsSubmit,
      inited,
      handleFlushSecret,
      handleFlushSecretBlog,
      adminInfo
    }
  }
}
</script>
