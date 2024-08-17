<template>
  <el-dialog
    v-model="showDialog"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    title="相册幻灯片"
    @closed="resetData"
  >
    <div>
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="100px"
        @submit.prevent
      >
        <!-- 相册选择器 -->
        <el-form-item label="相册" prop="id">
          <AlbumSelect
            v-model="form.id"
            :defaultList="albumDefaultList"
            @albumChange="onAlbumChange"
          />
        </el-form-item>
        <!-- 宽高比 -->
        <el-form-item label="宽高比-宽度" prop="aspectWidth">
          <el-input-number
            v-model="form.aspectWidth"
            :min="1"
            label="宽度"
            placeholder="宽度"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="宽高比-高度" prop="aspectHeight">
          <el-input-number
            v-model="form.aspectHeight"
            :min="1"
            label="高度"
            placeholder="高度"
          ></el-input-number>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { computed, reactive, ref, nextTick, watch } from 'vue'
import AlbumSelect from './AlbumSelect.vue'
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
    name: {
      type: String,
      default: '',
    },
    aspectWidth: {
      type: Number,
      default: 16,
    },
    aspectHeight: {
      type: Number,
      default: 9,
    },
  },
  components: {
    AlbumSelect,
  },
  emits: ['update:show', 'ok'],
  setup(props, { emit }) {
    const showDialog = computed({
      get() {
        return props.show
      },
      set(val) {
        emit('update:show', val)
      },
    })
    watch(
      () => props.show,
      (newVal) => {
        if (newVal) {
          if (props.id) {
            form.id = props.id
            form.aspectWidth = props.aspectWidth
            form.aspectHeight = props.aspectHeight
            form.name = props.name
            getAlbumDetail()
          }
        }
      }
    )

    const form = reactive({
      id: null,
      aspectWidth: 16,
      aspectHeight: 9,
      name: '',
    })

    const rules = reactive({
      id: [{ required: true, message: '请选择相册', trigger: 'blur' }],
      aspectWidth: [{ required: true, message: '请输入宽度', trigger: 'blur' }],
      aspectHeight: [
        { required: true, message: '请输入高度', trigger: 'blur' },
      ],
    })

    const formRef = ref(null)

    const submit = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          showDialog.value = false
          nextTick(() => {
            emit('ok', form)
          })
        }
      })
    }

    const resetData = () => {
      form.id = null
      form.aspectWidth = 16
      form.aspectHeight = 9
      form.name = ''
      albumDefaultList.value = []
    }

    const onAlbumChange = (selectedAlbum) => {
      if (selectedAlbum) {
        form.name = selectedAlbum.name
      } else {
        form.name = ''
      }
    }

    const albumDefaultList = ref([])
    const getAlbumDetail = async () => {
      const params = {
        id: form.id,
      }
      await authApi.getAlbumDetail(params).then((res) => {
        form.name = res.data.data.name
        albumDefaultList.value = [
          {
            ...res.data.data,
          },
        ]
      })
    }

    return {
      showDialog,
      form,
      rules,
      formRef,
      submit,
      resetData,
      onAlbumChange,
      albumDefaultList,
    }
  },
}
</script>

<style scoped></style>
