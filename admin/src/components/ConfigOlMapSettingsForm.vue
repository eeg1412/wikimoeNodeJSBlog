<template>
  <el-form
    :model="olMapSettingsForm"
    :rules="olMapSettingsRules"
    ref="olMapSettingsFormRef"
    label-width="160px"
    v-if="inited"
  >
    <!-- 地图设置 -->
    <el-form-item label="地图精度" prop="olMapMapPrecision">
      <!-- radio -->
      <el-radio-group v-model="olMapSettingsForm.olMapMapPrecision">
        <el-radio :label="1">低</el-radio>
        <el-radio :label="2">普通</el-radio>
      </el-radio-group>
      <div class="w_10">※低精度地图文件约965KB,普通精度地图文件约4.3MB</div>
    </el-form-item>

    <!-- 默认中心坐标 - 经度 -->
    <el-form-item label="默认中心经度" prop="longitude">
      <el-input-number
        v-model="centerLongitude"
        :precision="6"
        :min="-180"
        :max="180"
        :step="0.000001"
        placeholder="请输入经度"
        style="width: 200px"
      ></el-input-number>
    </el-form-item>

    <!-- 默认中心坐标 - 纬度 -->
    <el-form-item label="默认中心纬度" prop="latitude">
      <el-input-number
        v-model="centerLatitude"
        :precision="6"
        :min="-90"
        :max="90"
        :step="0.000001"
        placeholder="请输入纬度"
        style="width: 200px"
      ></el-input-number>
    </el-form-item>

    <!-- 默认缩放级别 -->
    <el-form-item label="默认缩放级别" prop="olMapDefaultZoom">
      <el-input-number
        v-model="olMapSettingsForm.olMapDefaultZoom"
        controls-position="right"
        :min="1"
        :max="18"
        :step="1"
        :precision="0"
      ></el-input-number>
    </el-form-item>

    <!-- 显示标记点文字 -->
    <el-form-item label="标记点上方文字" prop="olMapShowMappointText">
      <el-switch v-model="olMapSettingsForm.olMapShowMappointText"></el-switch>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="olMapSettingsSubmit">提交</el-button>
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
import { ElMessage } from 'element-plus'

export default {
  setup(props, { emit }) {
    // 地图设置
    const olMapSettingsFormRef = ref(null)
    const olMapSettingsForm = reactive({
      // 地图精度 1为低 2为普通
      olMapMapPrecision: 2,
      // 默认中心坐标（存储为字符串数组格式）
      olMapDefaultCenter: '0,0',
      // 默认缩放级别
      olMapDefaultZoom: 4,
      // 显示标记点文字
      olMapShowMappointText: true
    })

    // 使用 computed 处理经纬度的转换
    const centerLongitude = computed({
      get() {
        const center = olMapSettingsForm.olMapDefaultCenter
        if (typeof center === 'string' && center.includes(',')) {
          const coords = center.split(',')
          return parseFloat(coords[0]) || 0
        }
        return 0
      },
      set(value) {
        const currentCenter = olMapSettingsForm.olMapDefaultCenter
        let latitude = 0
        if (typeof currentCenter === 'string' && currentCenter.includes(',')) {
          const coords = currentCenter.split(',')
          latitude = parseFloat(coords[1]) || 0
        }
        olMapSettingsForm.olMapDefaultCenter = `${value || 0},${latitude}`
      }
    })

    const centerLatitude = computed({
      get() {
        const center = olMapSettingsForm.olMapDefaultCenter
        if (typeof center === 'string' && center.includes(',')) {
          const coords = center.split(',')
          return parseFloat(coords[1]) || 0
        }
        return 0
      },
      set(value) {
        const currentCenter = olMapSettingsForm.olMapDefaultCenter
        let longitude = 0
        if (typeof currentCenter === 'string' && currentCenter.includes(',')) {
          const coords = currentCenter.split(',')
          longitude = parseFloat(coords[0]) || 0
        }
        olMapSettingsForm.olMapDefaultCenter = `${longitude},${value || 0}`
      }
    })

    // 表单验证规则
    const olMapSettingsRules = computed(() => ({
      olMapDefaultZoom: [
        { required: true, message: '请输入默认缩放级别', trigger: 'blur' },
        {
          type: 'number',
          min: 1,
          max: 18,
          message: '缩放级别必须在1到18之间',
          trigger: 'blur'
        }
      ],
      longitude: [
        {
          type: 'number',
          min: -180,
          max: 180,
          message: '经度必须在-180到180之间',
          trigger: 'blur'
        }
      ],
      latitude: [
        {
          type: 'number',
          min: -90,
          max: 90,
          message: '纬度必须在-90到90之间',
          trigger: 'blur'
        }
      ]
    }))

    const olMapSettingsSubmit = () => {
      olMapSettingsFormRef.value.validate((valid, fields) => {
        if (valid) {
          const params = []
          Object.keys(olMapSettingsForm).forEach(key => {
            params.push({
              name: key,
              value: olMapSettingsForm[key]
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then(res => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(olMapSettingsForm, obj)
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
      const params = {
        nameList: Object.keys(olMapSettingsForm)
      }
      authApi
        .getOptionList(params)
        .then(res => {
          const obj = formatResToObj(res.data.data)
          formatResToForm(olMapSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
        })
    }

    onMounted(() => {
      getOptionList()
    })

    return {
      olMapSettingsFormRef,
      olMapSettingsForm,
      olMapSettingsRules,
      olMapSettingsSubmit,
      centerLongitude,
      centerLatitude,
      inited
    }
  }
}
</script>
<style></style>
