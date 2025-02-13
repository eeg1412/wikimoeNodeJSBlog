<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'UserList' }"
          >管理员列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="如需更改密码，请输入新密码"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="photo">
          <Cropper
            :aspectRatio="1"
            :width="256"
            :height="256"
            @crop="setPhoto"
            :src="form.photo"
          />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="form.description"
            placeholder="请输入简介"
            type="textarea"
          ></el-input>
        </el-form-item>
        <!-- 封面图 -->
        <el-form-item label="封面图" prop="cover">
          <div class="login-usercover-image-item" v-if="coverData">
            <el-image
              :src="`${
                coverData.thumfor || coverData.filepath
              }?s=${$formatTimestamp(coverData.updatedAt)}`"
              fit="contain"
              @click="openPreviewer"
              style="width: 100%; height: 100%"
            />
            <!-- 删除按钮 -->
            <div
              class="login-usercover-image-item-change"
              @click="coverData = null"
            >
              <el-icon><Close /></el-icon>
            </div>
          </div>
          <div
            class="login-usercover-image-item type-add"
            @click="openAttachmentsDialog"
            v-else
          >
            <div class="dflex flexCenter w_10 full-height">
              <el-icon size="32px"><Plus /></el-icon>
            </div>
          </div>
          <div class="w_10 mt5" v-if="coverData">
            <el-button type="primary" @click="openAttachmentsDialog">
              更换封面图
            </el-button>
          </div>
        </el-form-item>
        <!-- 禁用 -->
        <el-form-item label="禁用" prop="disabled">
          <el-switch v-model="form.disabled" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
    <AttachmentsDialog
      :shouldSelectOk="true"
      ref="attachmentsDialogRef"
      :selectLimit="1"
      :typeList="['image']"
      :hasDelete="false"
      @selectAttachments="selectAttachments"
    />
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
// ElMessage
import { ElMessage } from 'element-plus'
import AttachmentsDialog from '@/components/AttachmentsDialog'
import { loadAndOpenImg } from '@/utils/utils'
export default {
  components: {
    AttachmentsDialog,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const form = reactive({
      nickname: '',
      email: '',
      photo: '',
      description: '',
      password: '',
      cover: null,
      disabled: false,
      __v: 0,
    })
    const rules = computed(() => {
      const rules = {
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur',
          },
        ],
      }
      rules.password = [
        // { required: true, message: '请输入密码', trigger: 'blur' },
        {
          pattern:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/,
          message: '密码必须包含大小写字母、数字、特殊字符（!@#$%^&*）',
          trigger: 'blur',
        },
      ]
      return rules
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
        if (coverData.value) {
          data.cover = coverData.value._id
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          authApi
            .updateUser(data)
            .then(() => {
              ElMessage.success('修改成功')
              router.push({
                name: 'UserList',
              })
            })
            .catch(() => {})
        }
      })
    }

    const getUserDetail = () => {
      const params = {
        id: id.value,
      }
      authApi
        .getUserDetail(params)
        .then((res) => {
          const data = res.data.data
          form.nickname = data.nickname
          form.email = data.email
          form.photo = data.photo
          form.description = data.description
          form.disabled = data.disabled
          if (data.cover) {
            coverData.value = data.cover
          }
          form.__v = data.__v
        })
        .catch(() => {})
    }

    const coverData = ref(null)
    const setPhoto = (base64) => {
      form.photo = base64
    }
    // 附件
    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })
    const attachmentsDialogRef = ref(null)
    const openAttachmentsDialog = () => {
      attachmentsDialogRef.value.open()
    }
    const selectAttachments = (attachments) => {
      console.log(attachments)
      coverData.value = attachments[0]
    }
    const openPreviewer = () => {
      const item = coverData.value
      const mimetype = item.mimetype
      const { filepath, width, height } = item
      loadAndOpenImg(0, [
        {
          src: `${siteUrl.value}${filepath}`,
          width,
          height,
          mimetype,
        },
      ])
    }
    onMounted(() => {
      if (id.value) {
        getUserDetail()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit,
      setPhoto,
      coverData,
      siteUrl,
      attachmentsDialogRef,
      openAttachmentsDialog,
      selectAttachments,
      openPreviewer,
    }
  },
}
</script>
<style scoped></style>
