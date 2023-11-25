<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'CommentList' }"
          >评论列表</el-breadcrumb-item
        >
        <el-breadcrumb-item>编辑</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <template v-if="detailData.user">
          <el-form-item label="昵称">
            <div>{{ detailData.user.nickname }}（管理员）</div>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="form.nickname"
              placeholder="请输入昵称"
            ></el-input>
          </el-form-item>
          <el-form-item label="网址" prop="url">
            <el-input v-model="form.url" placeholder="请输入网址"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
        </template>

        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="请输入评论内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否置顶" prop="top">
          <el-switch v-model="form.top"></el-switch>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待审核" :value="0"></el-option>
            <el-option label="通过" :value="1"></el-option>
            <el-option label="未通过" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import { authApi } from '@/api'
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const form = reactive({
      // 后台接收如下数据content, top, nickname, url, email, status
      content: '',
      top: false,
      nickname: '',
      url: '',
      email: '',
      status: 0,
      __v: null,
    })
    const detailData = ref({})
    const rules = computed(() => {
      const ruleList = {
        content: [
          { required: true, message: '请输入评论内容', trigger: 'blur' },
        ],
      }
      if (!detailData.user) {
        ruleList.nickname = [
          { required: true, message: '请输入昵称', trigger: 'blur' },
        ]
        // 校验邮箱
        ruleList.email = [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ]
      }
      return ruleList
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) {
          return false
        }
        const data = {
          ...form,
        }
        // 编辑
        data.id = id.value
        data.__v = form.__v
        authApi
          .updateComment(data)
          .then(() => {
            router.push({
              name: 'CommentList',
            })
          })
          .catch(() => {})
      })
    }

    const getCommentDetail = () => {
      const params = {
        id: id.value,
      }
      authApi
        .getCommentDetail(params)
        .then((res) => {
          detailData.value = res.data.data
          form.content = res.data.data.content
          form.top = res.data.data.top
          form.nickname = res.data.data.nickname
          form.url = res.data.data.url
          form.email = res.data.data.email
          form.status = res.data.data.status
          form.__v = res.data.data.__v
        })
        .catch(() => {})
    }

    onMounted(() => {
      if (id.value) {
        getCommentDetail()
      }
    })
    return {
      id,
      form,
      detailData,
      rules,
      formRef,
      submit,
    }
  },
}
</script>
<style scoped></style>
