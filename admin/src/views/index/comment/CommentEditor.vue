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
    <div v-if="showForm">
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
            <el-input
              v-model="form.email"
              @blur="
                () => {
                  // 小写
                  form.email = form.email.toLowerCase()
                }
              "
              placeholder="请输入邮箱"
            ></el-input>
          </el-form-item>
        </template>
        <!-- 父级评论内容 -->
        <el-form-item label="父级评论" v-if="detailData.parentId">
          <blockquote
            class="common-blockquote comment-detail-blockquote"
            v-if="detailData.parent && detailData.parent?.content"
          >
            <div class="fb">
              {{
                detailData.parent.user?.nickname || detailData.parent.nickname
              }}
            </div>
            <div>{{ $formatDate(detailData.date) }}</div>
            <div class="mt5 pre-wrap">{{ detailData.parent.content }}</div>
          </blockquote>
          <blockquote
            class="common-blockquote comment-detail-blockquote"
            v-else-if="!detailData.parent && detailData.parentId"
          >
            该评论审核暂未通过或已被删除
          </blockquote>
        </el-form-item>
        <el-form-item label="评论内容" prop="content">
          <EmojiTextarea
            v-model:value="form.content"
            placeholder="请输入评论内容"
          />
        </el-form-item>
        <el-form-item label="是否置顶" prop="top">
          <el-switch v-model="form.top"></el-switch>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">待审核</el-radio>
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">未通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.status === 1">
          <!-- replyFlag switch -->
          <el-form-item label="是否回复" prop="replyFlag">
            <el-switch v-model="replyFlag"></el-switch>
          </el-form-item>
          <!-- replyFlag -->
          <template v-if="replyFlag">
            <el-form-item label="回复内容" prop="reply.content">
              <EmojiTextarea
                v-model:value="form.reply.content"
                placeholder="请输入回复内容"
              />
            </el-form-item>
            <el-form-item label="是否置顶" prop="reply.top">
              <el-switch v-model="form.reply.top"></el-switch>
            </el-form-item>
          </template>
        </template>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { computed, onMounted, reactive, ref, nextTick } from 'vue'
import { authApi } from '@/api'
import EmojiTextarea from '@/components/EmojiTextarea.vue'
export default {
  components: {
    EmojiTextarea
  },
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
      reply: {
        post: '',
        content: '',
        parent: '',
        top: false
      },
      __v: null
    })
    // 回复Flag
    const replyFlag = ref(false)
    const detailData = ref({})
    const showForm = ref(false)
    const rules = computed(() => {
      const ruleList = {
        content: [
          { required: true, message: '请输入评论内容', trigger: 'blur' }
        ]
      }
      if (!detailData.user) {
        ruleList.nickname = [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ]
        // 校验邮箱
        ruleList.email = [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ]
      }
      if (replyFlag.value) {
        ruleList['reply.content'] = [
          { required: true, message: '请输入回复内容', trigger: 'blur' }
        ]
      }
      return ruleList
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        const data = JSON.parse(JSON.stringify(form))
        delete data.reply
        // 编辑
        data.id = id.value
        data.__v = form.__v
        // 如果有user，删除nickname, url, email
        if (detailData.value.user) {
          delete data.nickname
          delete data.url
          delete data.email
        }
        authApi
          .updateComment(data)
          .then(() => {
            if (replyFlag.value && data.status === 1) {
              // 回复
              const replyData = JSON.parse(JSON.stringify(form.reply))
              authApi.createComment(replyData).then(res => {
                router.push({
                  name: 'CommentList'
                })
              })
              return
            }
            router.push({
              name: 'CommentList'
            })
          })
          .catch(() => {})
      })
    }

    const getCommentDetail = () => {
      const params = {
        id: id.value
      }
      authApi
        .getCommentDetail(params)
        .then(res => {
          detailData.value = res.data.data
          form.content = res.data.data.content
          form.top = res.data.data.top
          form.nickname = res.data.data.nickname
          form.url = res.data.data.url
          form.email = res.data.data.email
          form.status = res.data.data.status
          form.__v = res.data.data.__v
          form.reply.post = res.data.data.post._id
          const user = res.data.data.user
          if (user) {
            form.reply.content = `@${user.nickname}：`
          } else {
            form.reply.content = `@${res.data.data.nickname}：`
          }
          form.reply.parent = res.data.data._id
        })
        .catch(() => {})
        .finally(() => {
          showForm.value = true
        })
    }

    onMounted(() => {
      if (id.value) {
        getCommentDetail()
      }
    })
    return {
      id,
      form,
      replyFlag,
      detailData,
      showForm,
      rules,
      formRef,
      submit
    }
  }
}
</script>
<style scoped>
.comment-detail-blockquote {
  line-height: 18px;
}
</style>
