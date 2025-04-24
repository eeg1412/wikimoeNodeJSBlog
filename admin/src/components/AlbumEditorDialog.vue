<template>
  <el-dialog
    v-model="showDialog"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    :title="id ? '编辑相册' : '新增相册'"
    @closed="resetData"
  >
    <div>
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="相册名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入相册名称"></el-input>
        </el-form-item>
        <el-form-item>
          <!-- 这里插入功能性按钮 -->
          <el-button @click="fillCurrentDate" type="primary" size="small"
            >填入当前日期</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submit"> 提交 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { computed, reactive, ref, watch } from 'vue'
import { authApi } from '@/api'
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const showDialog = computed({
      get() {
        return props.show
      },
      set(val) {
        emit('update:show', val)
      },
    })

    const form = reactive({
      name: '',
      __v: null,
    })
    const rules = reactive({
      name: [{ required: true, message: '请输入相册名称', trigger: 'blur' }],
    })
    const formRef = ref(null)

    // 填入当前日期的方法
    const fillCurrentDate = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      form.name = `${year}-${month}-${day}`
    }

    const submit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) {
          return false
        }
        const data = {
          name: form.name,
        }
        if (props.id) {
          // 编辑
          data.id = props.id
          data.__v = form.__v
          authApi
            .updateAlbum(data)
            .then(() => {
              showDialog.value = false
              emit('success')
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createAlbum(data)
            .then(() => {
              showDialog.value = false
              emit('success')
            })
            .catch(() => {})
        }
      })
    }

    const getAlbumDetail = () => {
      const params = {
        id: props.id,
      }
      authApi
        .getAlbumDetail(params)
        .then((res) => {
          form.name = res.data.data.name
          form.__v = res.data.data.__v
        })
        .catch(() => {})
    }
    const resetData = () => {
      form.name = ''
      form.__v = null
    }
    // watch show
    watch(
      () => props.show,
      (newVal, oldVal) => {
        if (newVal) {
          if (props.id) {
            getAlbumDetail()
          }
        }
      }
    )
    return {
      showDialog,
      form,
      rules,
      formRef,
      submit,
      resetData,
      fillCurrentDate,
    }
  },
}
</script>
<style lang=""></style>
