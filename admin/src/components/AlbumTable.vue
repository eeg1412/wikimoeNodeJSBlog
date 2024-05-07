<template>
  <div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="getAlbumList(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入相册名称"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getAlbumList(true)"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- albums -->
    <div class="mb20 list-table-body">
      <el-table
        height="100%"
        :data="albumList"
        row-key="_id"
        border
        default-expand-all
        ref="tableRef"
      >
        <el-table-column prop="name" label="相册名称" />
        <el-table-column prop="count" label="媒体数" width="80" />

        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <!-- 查看 -->
            <el-button size="small" @click="openAttachementDialog(row._id)"
              >媒体</el-button
            >
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteAlbum(row._id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="clearfix">
      <el-pagination
        class="fr"
        background
        layout="total, prev, pager, next"
        :total="total"
        :pager-count="5"
        small
        v-model:current-page="params.page"
        v-model:page-size="params.size"
      />
    </div>
    <AlbumEditorDialog
      v-model:show="editorShow"
      :id="id"
      @success="onEditorSuccess"
    />
  </div>
  <AttachmentsDialog
    :albumIdProp="attachmentsAlbumId"
    @success="attachmentUploadSuccess"
    @onAttachmentsDelete="attachmentUploadSuccess"
    @onAttachmentsAlbumChange="attachmentUploadSuccess"
    @onDialogClose="attachmentUploadSuccess"
    ref="attachmentsDialogRef"
  />
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onBeforeMount, onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
import AlbumEditorDialog from '@/components/AlbumEditorDialog.vue'
import AttachmentsDialog from '@/components/AttachmentsDialog.vue'
export default {
  components: {
    AlbumEditorDialog,
    AttachmentsDialog,
  },
  props: {
    // params
    defaultParams: {
      type: Object,
      default: () => {
        return {
          page: 1,
          size: 50,
          keyword: '',
        }
      },
    },
  },
  emits: ['paramsChange'],
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const albumList = ref([])
    const id = ref(null)
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const getAlbumList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getAlbumList(params)
        .then((res) => {
          albumList.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          emit('paramsChange', params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const editorShow = ref(false)
    const handleAdd = () => {
      id.value = null
      editorShow.value = true
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        getAlbumList()
      }
    )

    const goEdit = (_id) => {
      id.value = _id
      editorShow.value = true
    }
    const deleteAlbum = (id) => {
      ElMessageBox.confirm('确定要删除吗？', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          const params = {
            id,
          }
          authApi
            .deleteAlbum(params)
            .then(() => {
              ElMessage.success('删除成功')
              getAlbumList()
            })
            .catch(() => {})
        })
        .catch(() => {})
    }
    const initParams = () => {
      // props.params
      if (props.defaultParams) {
        params.page = props.defaultParams.page
        params.size = props.defaultParams.size
        params.keyword = props.defaultParams.keyword
      }
    }

    const onEditorSuccess = () => {
      getAlbumList()
    }

    const attachmentsDialogRef = ref(null)
    const attachmentsAlbumId = ref(null)
    const openAttachementDialog = (_id) => {
      attachmentsAlbumId.value = _id
      nextTick(() => {
        attachmentsDialogRef.value.open()
      })
    }

    let getAlbumTimer = null
    const attachmentUploadSuccess = () => {
      clearTimeout(getAlbumTimer)
      getAlbumTimer = setTimeout(() => {
        getAlbumList()
      }, 1000)
    }
    onMounted(() => {
      initParams()
      getAlbumList()
    })
    onBeforeMount(() => {
      clearTimeout(getAlbumTimer)
    })
    return {
      albumList,
      id,
      params,
      total,
      tableRef,
      getAlbumList,
      editorShow,
      handleAdd,
      goEdit,
      deleteAlbum,
      onEditorSuccess,
      attachmentsDialogRef,
      attachmentsAlbumId,
      openAttachementDialog,
      attachmentUploadSuccess,
    }
  },
}
</script>
<style scoped></style>
