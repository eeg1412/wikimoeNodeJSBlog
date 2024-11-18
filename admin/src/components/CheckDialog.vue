<template>
  <el-dialog
    :model-value="isOpen"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    title="确认"
    @close="handleCancel"
    @closed="handleClosed"
    class="common-max-dialog w_10"
  >
    <slot></slot>
    <div v-if="content" v-html="content"></div>
    <el-form :model="form" :rules="rules" ref="formRef" @submit.native.prevent>
      <div>
        <p class="mb5">
          请输入 <span class="fb">{{ correctAnswer }}</span> ：
        </p>
        <el-form-item prop="inputAnswer">
          <el-input
            v-model="form.inputAnswer"
            placeholder="请输入上述内容"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

export default {
  components: {
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    success: {
      type: Function,
      default: null,
    },
  },
  setup(props, { emit }) {
    const form = ref({
      inputAnswer: '',
    })

    const rules = ref({
      inputAnswer: [
        { required: true, message: '请输入内容', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== props.correctAnswer) {
              callback(new Error('内容错误'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ],
    })

    const formRef = ref(null)

    const handleCancel = () => {
      if (props.isOpen) {
        emit('update:isOpen', false)
      }
    }

    const handleConfirm = () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          if (props.success) {
            try {
              await props.success()
              emit('confirm')
            } catch (error) {
              console.error(error)
            }
          } else {
            emit('confirm')
          }
        }
      })
    }

    const handleClosed = () => {
      emit('closed')
    }

    watch(
      () => props.isOpen,
      (newVal) => {
        console.log('isOpen changed:', newVal)
        if (!newVal) {
          form.value.inputAnswer = ''
          formRef.value.clearValidate()
        }
      }
    )

    return {
      form,
      rules,
      formRef,
      handleCancel,
      handleConfirm,
      handleClosed,
    }
  },
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
.mb5 {
  margin-bottom: 5px;
}
</style>
