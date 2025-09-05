<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'MappointList' }"
          >地点列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="地点名称" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入地点名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入简介（可选）"
          ></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input-number
            v-model="form.longitude"
            :precision="6"
            :min="-180"
            :max="180"
            :step="0.000001"
            placeholder="请输入经度"
            style="width: 200px"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input-number
            v-model="form.latitude"
            :precision="6"
            :min="-90"
            :max="90"
            :step="0.000001"
            placeholder="请输入纬度"
            style="width: 200px"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="层叠顺序" prop="zIndex">
          <el-input-number
            v-model="form.zIndex"
            :min="0"
            :step="1"
            placeholder="请输入层叠顺序"
            style="width: 200px"
          ></el-input-number>
          <div class="w_10">※数值越大，标记点在地图上的层级就越高</div>
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
      title: '',
      summary: '',
      longitude: null,
      latitude: null,
      // 层叠顺序
      zIndex: 0,
      status: 0,
      __v: null
    })
    const rules = reactive({
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      longitude: [
        { required: true, message: '请输入经度', trigger: 'blur' },
        {
          type: 'number',
          min: -180,
          max: 180,
          message: '经度必须在-180到180之间',
          trigger: 'blur'
        }
      ],
      latitude: [
        { required: true, message: '请输入纬度', trigger: 'blur' },
        {
          type: 'number',
          min: -90,
          max: 90,
          message: '纬度必须在-90到90之间',
          trigger: 'blur'
        }
      ],
      zIndex: [
        { required: true, message: '请输入层叠顺序', trigger: 'blur' },
        {
          type: 'number',
          min: 0,
          message: '层叠顺序必须大于等于0',
          trigger: 'blur'
        }
      ],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }]
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        const data = {
          title: form.title,
          summary: form.summary,
          longitude: form.longitude,
          latitude: form.latitude,
          zIndex: form.zIndex,
          status: form.status
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateMappoint(data)
            .then(() => {
              router.push({
                name: 'MappointList'
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createMappoint(data)
            .then(() => {
              router.push({
                name: 'MappointList'
              })
            })
            .catch(() => {})
        }
      })
    }

    const getMappointDetail = () => {
      const params = {
        id: id.value
      }
      authApi
        .getMappointDetail(params)
        .then(res => {
          const data = res.data.data
          form.title = data.title
          form.summary = data.summary || ''
          form.longitude = data.longitude
          form.latitude = data.latitude
          form.status = data.status
          form.zIndex = data.zIndex || 0
          form.__v = data.__v
        })
        .catch(() => {})
    }
    onMounted(() => {
      if (id.value) {
        getMappointDetail()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit
    }
  }
}
</script>
<style scoped></style>
