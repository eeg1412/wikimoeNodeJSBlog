<template>
  <el-dialog
    v-model="showDialog"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
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
        <!-- 文本 -->
        <el-form-item label="文本" prop="text">
          <el-input v-model="form.text" placeholder="请输入文本"></el-input>
        </el-form-item>
        <!-- 活动选择器 -->
        <el-form-item label="活动" prop="id">
          <el-select
            v-model="form.id"
            placeholder="请选择活动"
            clearable
            filterable
            remote
            :automatic-dropdown="true"
            :remote-method="queryEventList"
            :loading="eventListIsLoading"
          >
            <el-option
              v-for="item in eventList"
              :key="item._id"
              :label="item.title"
              :value="item._id"
            ></el-option>
          </el-select>
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
import { nextTick } from 'vue'
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
    text: {
      type: String,
      default: '',
    },
  },
  emits: ['update:show', 'ok'],
  setup(props, { emit }) {
    const showDialog = computed({
      get() {
        if (props.id) {
          form.id = props.id
          getEventDetail(props.id)
        }
        if (props.text) {
          form.text = props.text
        }
        return props.show
      },
      set(val) {
        emit('update:show', val)
      },
    })

    const form = reactive({
      id: null,
      text: '',
    })
    const rules = reactive({
      id: [{ required: true, message: '请选择活动', trigger: 'blur' }],
      text: [{ required: true, message: '请输入文本', trigger: 'blur' }],
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) {
          return false
        }
        showDialog.value = false
        nextTick(() => {
          emit('ok', form)
        })
      })
    }

    const resetData = () => {
      form.id = null
      form.text = ''
    }

    // 活动
    const eventList = ref([])
    const eventListIsLoading = ref(false)
    const eventListTimer = null
    const getEventDetail = (id) => {
      authApi
        .getEventDetail({
          id,
        })
        .then((res) => {
          eventList.value = [res.data.data]
        })
        .catch(() => {})
    }
    const queryEventList = (query, options = {}) => {
      if (eventListTimer) {
        clearTimeout(eventListTimer)
      }
      setTimeout(() => {
        eventListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50,
          ...options,
        }
        authApi
          .getEventList(params, { noLoading: true })
          .then((res) => {
            eventList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            eventListIsLoading.value = false
          })
      }, 300)
    }
    return {
      showDialog,
      form,
      rules,
      formRef,
      submit,
      resetData,
      eventList,
      eventListIsLoading,
      queryEventList,
    }
  },
}
</script>
<style lang=""></style>
