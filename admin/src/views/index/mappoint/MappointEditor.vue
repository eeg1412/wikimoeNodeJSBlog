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
            placeholder="请输入简介"
          ></el-input>
        </el-form-item>
        <!-- 快速坐标输入 -->
        <el-form-item label="坐标转换">
          <div class="latlng-quick-input-row">
            <el-input
              v-model="quickCoordInput"
              placeholder="请输入：维度,经度"
              class="latlng-quick-input-field"
            >
              <template #append>
                <el-button @click="parseQuickCoordinate">转换</el-button>
              </template>
            </el-input>
          </div>
          <div class="w_10">※仅支持 WGS84 坐标系</div>
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
        <el-form-item label="层叠顺序" prop="zIndex">
          <el-input-number
            v-model="form.zIndex"
            :min="0"
            :max="99999999"
            :step="1"
            placeholder="请输入层叠顺序"
            style="width: 200px"
          ></el-input-number>
          <div class="w_10">※数值越大，标记点在地图上的层级就越高，0为默认</div>
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
import { ElMessage } from 'element-plus'
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
    const quickCoordInput = ref('')

    // 解析快速坐标输入
    const parseQuickCoordinate = () => {
      const input = quickCoordInput.value.trim()
      if (!input) {
        ElMessage.warning('请输入坐标数据')
        return
      }

      try {
        if (input.includes(',')) {
          // 包含逗号，按照 纬度,经度 格式解析
          const coords = input.split(',').map(coord => parseFloat(coord.trim()))
          if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            // 验证纬度和经度范围
            if (
              coords[0] >= -90 &&
              coords[0] <= 90 &&
              coords[1] >= -180 &&
              coords[1] <= 180
            ) {
              // 保留最多6位小数
              const lat = Number(coords[0].toFixed(6))
              const lon = Number(coords[1].toFixed(6))
              form.latitude = lat
              form.longitude = lon
              ElMessage.success('坐标已填入')
              quickCoordInput.value = ''
            } else {
              ElMessage.error(
                '坐标范围错误：纬度应在-90到90之间，经度应在-180到180之间'
              )
            }
          } else {
            ElMessage.error('坐标格式错误，请输入有效的格式')
          }
        } else {
          ElMessage.error('请输入有效的格式')
        }
      } catch (error) {
        ElMessage.error('坐标解析失败，请检查输入格式')
      }
    }

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
      quickCoordInput,
      parseQuickCoordinate,
      submit
    }
  }
}
</script>
<style scoped></style>
