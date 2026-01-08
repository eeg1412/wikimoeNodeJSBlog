<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'AlmanacList' }"
          >老黄历列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="如：写单元测试"></el-input>
          <div class="form-tip">
            <div>可使用占位符：</div>
            <div>• <code>%v</code> - 随机变量名（如：jieguo, pay, expire等）</div>
            <div>• <code>%t</code> - 随机工具（如：Eclipse, Linux, IE等）</div>
            <div>• <code>%l</code> - 随机行数（30-277之间）</div>
            <div class="form-tip-example">
              示例：命名变量"%v" → 命名变量"jieguo"
            </div>
          </div>
        </el-form-item>
        <el-form-item label="宜的说明" prop="good">
          <el-input
            type="textarea"
            :rows="3"
            v-model="form.good"
            placeholder="例如：写单元测试将减少出错"
          ></el-input>
        </el-form-item>
        <el-form-item label="不宜的说明" prop="bad">
          <el-input
            type="textarea"
            :rows="3"
            v-model="form.bad"
            placeholder="例如：写单元测试会降低你的开发效率"
          ></el-input>
        </el-form-item>
        <el-form-item label="仅周末显示" prop="weekend">
          <el-switch v-model="form.weekend"></el-switch>
          <div class="form-tip">
            开启后，该项目只在周六和周日显示
          </div>
        </el-form-item>
        <el-form-item label="生效日期" prop="effectiveDate">
          <el-input
            v-model="form.effectiveDate"
            type="number"
            placeholder="留空表示长期有效"
          ></el-input>
          <div class="form-tip">
            格式：YYYYMMDD（如：20260108），留空表示长期有效。<br />
            设置后该项目仅在指定日期显示，可用于特殊日期的自定义内容。
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">不显示</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const id = ref(route.params.id || null)
    const formRef = ref(null)

    const form = reactive({
      name: '',
      good: '',
      bad: '',
      weekend: false,
      effectiveDate: null,
      status: 1
    })

    const rules = {
      name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' }
      ]
    }

    const getDetail = () => {
      authApi.getAlmanacDetail({ id: id.value }).then(res => {
        Object.assign(form, res.data.data)
      })
    }

    const submitForm = () => {
      formRef.value.validate(valid => {
        if (valid) {
          const data = { ...form }
          // Convert effectiveDate to number or null
          if (data.effectiveDate) {
            data.effectiveDate = Number(data.effectiveDate)
          } else {
            data.effectiveDate = null
          }

          if (id.value) {
            data._id = id.value
            authApi
              .updateAlmanac(data)
              .then(() => {
                ElMessage.success('更新成功')
                goBack()
              })
              .catch(err => {
                console.log(err)
              })
          } else {
            authApi
              .createAlmanac(data)
              .then(() => {
                ElMessage.success('创建成功')
                goBack()
              })
              .catch(err => {
                console.log(err)
              })
          }
        }
      })
    }

    const goBack = () => {
      router.push({ name: 'AlmanacList' })
    }

    onMounted(() => {
      if (id.value) {
        getDetail()
      }
    })

    return {
      id,
      form,
      rules,
      formRef,
      submitForm,
      goBack
    }
  }
}
</script>
<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.6;
}
.form-tip code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e6a23c;
}
.form-tip-example {
  margin-top: 5px;
  padding: 5px;
  background: #f0f9ff;
  border-left: 3px solid #409eff;
  color: #606266;
}
</style>
