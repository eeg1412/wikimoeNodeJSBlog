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
    <div class="mb20">
      <el-table :data="albumList" row-key="_id" border default-expand-all>
        <el-table-column prop="name" label="相册名称" />

        <el-table-column label="操作" width="140">
          <template #default="{ row }">
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
        layout="prev, pager, next"
        :total="total"
        v-model:current-page="params.page"
      />
    </div>
    <AlbumEditorDialog
      v-model:show="editorShow"
      :id="id"
      @success="onEditorSuccess"
    />
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
import AlbumEditorDialog from '@/components/AlbumEditorDialog.vue'

export default {
  components: {
    AlbumEditorDialog,
  },
  props: {
    // params
    defaultParams: {
      type: Object,
      default: () => {
        return {
          page: 1,
          size: 10,
          keyword: '',
        }
      },
    },
  },
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const albumList = ref([])
    const id = ref(null)
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const getAlbumList = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .getAlbumList(params)
        .then((res) => {
          albumList.value = res.data.list
          total.value = res.data.total
          emit('paramsChange', params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const editorShow = ref(false)
    const handleAdd = () => {
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
    onMounted(() => {
      initParams()
      getAlbumList()
    })
    return {
      albumList,
      id,
      params,
      total,
      getAlbumList,
      editorShow,
      handleAdd,
      goEdit,
      deleteAlbum,
      onEditorSuccess,
    }
  },
}
</script>
<style scoped></style>
