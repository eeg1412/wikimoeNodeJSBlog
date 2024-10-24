<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'LinkList' }"
          >友链列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="网站图标" prop="icon">
          <Cropper
            :aspectRatio="1"
            :width="128"
            :height="128"
            @crop="setIcon"
            :src="form.icon"
          />
          <div class="w_10 mt5">
            <el-button
              v-if="form.icon"
              type="danger"
              size="mini"
              @click="form.icon = ''"
            >
              删除图标
            </el-button>
          </div>
          <!-- 删除图标按钮 -->
        </el-form-item>
        <el-form-item label="网站名称" prop="sitename">
          <el-input
            v-model="form.sitename"
            placeholder="请输入网站名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="网站URL" prop="siteurl">
          <el-input
            v-model="form.siteurl"
            placeholder="请输入网站URL"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item label="RSS地址" prop="rss">
          <el-input v-model="form.rss" placeholder="请输入RSS地址"></el-input>
        </el-form-item> -->
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="taxis">
          <el-input-number
            v-model="form.taxis"
            :min="0"
            :precision="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">不显示</el-radio>
            <el-radio :label="1">显示</el-radio>
          </el-radio-group>
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
import { onMounted, reactive, ref } from 'vue'
import { authApi } from '@/api'
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const form = reactive({
      icon: '',
      sitename: '',
      siteurl: '',
      rss: '',
      description: '',
      taxis: 0,
      status: 0,
      __v: null,
    })
    const rules = reactive({
      sitename: [
        { required: true, message: '请输入网站名称', trigger: 'blur' },
      ],
      siteurl: [{ required: true, message: '请输入网站URL', trigger: 'blur' }],
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
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateLink(data)
            .then(() => {
              router.push({
                name: 'LinkList',
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createLink(data)
            .then(() => {
              router.push({
                name: 'LinkList',
              })
            })
            .catch(() => {})
        }
      })
    }

    const getLinkDetail = () => {
      const params = {
        id: id.value,
      }
      authApi
        .getLinkDetail(params)
        .then((res) => {
          form.__v = res.data.data.__v
          form.icon = res.data.data.icon
          form.sitename = res.data.data.sitename
          form.siteurl = res.data.data.siteurl
          form.rss = res.data.data.rss
          form.description = res.data.data.description
          form.taxis = res.data.data.taxis
          form.status = res.data.data.status
        })
        .catch(() => {})
    }
    const setIcon = (base64) => {
      form.icon = base64
    }
    onMounted(() => {
      if (id.value) {
        getLinkDetail()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit,
      setIcon,
    }
  },
}
</script>
<style scoped></style>
