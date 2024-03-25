<template>
  <el-dialog
    v-model="dialogOpen"
    :destroy-on-close="true"
    :title="id ? '编辑' : '追加'"
    width="80%"
    :lock-scroll="false"
    :align-center="true"
    @closed="closeDialog"
    class="common-max-dialog"
  >
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <!-- 名称 -->
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <!-- 颜色 -->
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="form.color" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" @click="submit"> 提交 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, reactive, ref, watch } from 'vue'
import { authApi } from '@/api'
export default {
  props: {
    id: {
      type: String,
      default: '',
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    const dialogOpen = ref(false)
    const form = reactive({
      __v: null,
      name: '',
      color: '',
    })
    const rules = reactive({
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      color: [{ required: true, message: '请输入颜色', trigger: 'blur' }],
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
        if (props.id) {
          // 编辑
          data.id = props.id
          data.__v = form.__v
          authApi
            .updateEventtype(data)
            .then(() => {
              emit('update')
              dialogOpen.value = false
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createEventtype(data)
            .then(() => {
              emit('update')
              dialogOpen.value = false
            })
            .catch(() => {})
        }
      })
    }
    const closeDialog = () => {
      form.__v = null
      form.name = ''
      form.color = ''
      dialogOpen.value = false
    }

    const getEventtypeDetail = () => {
      const params = {
        id: props.id,
      }
      authApi
        .getEventtypeDetail(params)
        .then((res) => {
          form.__v = res.data.data.__v
          form.name = res.data.data.name
          form.color = res.data.data.color
        })
        .catch(() => {})
    }
    const open = () => {
      dialogOpen.value = true
      if (props.id) {
        getEventtypeDetail()
      }
    }
    return {
      dialogOpen,
      form,
      rules,
      formRef,
      submit,
      closeDialog,
      open,
    }
  },
}
</script>
<style scoped></style>
