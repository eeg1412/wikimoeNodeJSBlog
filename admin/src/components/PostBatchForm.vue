<template>
  <div class="pb5">
    当前已选中 <span class="cRed pl5 pr5">{{ postList.length }}</span
    >个项目
  </div>
  <div class="common-top-search-form-body">
    <el-form
      :inline="true"
      :model="params"
      @submit.prevent
      @keypress.enter="doBatch()"
    >
      <!-- action -->
      <el-form-item>
        <el-select
          v-model="params.action"
          placeholder="请选择操作"
          style="width: 120px"
        >
          <el-option
            v-for="item in actionList"
            :key="item.value"
            :label="item.title"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 状态 -->
      <el-form-item v-if="params.action === 'changeStatus'">
        <el-select
          v-model="params.status"
          placeholder="请选择状态"
          style="width: 120px"
        >
          <el-option label="草稿" value="0"></el-option>
          <el-option label="发布" value="1"></el-option>
          <!-- <el-option label="回收站" value="99"></el-option> -->
        </el-select>
      </el-form-item>
      <!-- 分类 -->
      <el-form-item v-if="params.action === 'changeSort'">
        <SortSelector
          v-model="params.sortId"
          placeholder="请选择分类（为空则为清除分类）"
          width="270px"
          ref="SearchSortSelectorRef"
        />
      </el-form-item>
      <!-- tagIdList -->
      <el-form-item
        v-if="['addTag', 'setTag', 'removeTag'].includes(params.action)"
      >
        <TagSelector
          v-model="params.tagIdList"
          width="270px"
          :addNew="['addTag', 'setTag'].includes(params.action)"
          ref="SearchTagSelectorRef"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="tryBatch()">执行</el-button>
        <!-- 取消 -->
        <el-button @click="cancel()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
  <CheckDialog
    v-model:isOpen="dialogOpen"
    correctAnswer="是"
    @confirm="doBatch"
  >
    <!-- 针对不同的动作显示不同文案 -->
    <div>
      <div class="mb10">
        <div v-if="params.action === 'changeSort'">
          <template v-if="params.sortId">
            您确定要对
            <span class="cRed">{{ postList.length }}</span> 个项目进行
            <span class="cRed">更改分类为【{{ selectedSortName }}】</span>
            的操作吗？
          </template>
          <template v-else>
            您确定要对
            <span class="cRed">{{ postList.length }}</span> 个项目进行
            <span class="cRed">清除分类</span> 的操作吗？
          </template>
        </div>
        <div v-else-if="params.action === 'addTag'">
          您确定要对 <span class="cRed">{{ postList.length }}</span> 个项目进行
          <span class="cRed">添加标签</span> 的操作吗？
        </div>
        <div v-else-if="params.action === 'setTag'">
          您确定要对 <span class="cRed">{{ postList.length }}</span> 个项目进行
          <span class="cRed">设置标签</span> 的操作吗？
        </div>
        <div v-else-if="params.action === 'removeTag'">
          您确定要对 <span class="cRed">{{ postList.length }}</span> 个项目进行
          <span class="cRed">移除标签</span> 的操作吗？
        </div>
        <div v-else-if="params.action === 'changeStatus'">
          您确定要对 <span class="cRed">{{ postList.length }}</span> 个项目进行
          <span class="cRed">更改状态为【{{ statusMap[params.status] }}】</span>
          的操作吗？
        </div>
        <div v-else-if="params.action === 'delete'">
          您确定要对 <span class="cRed">{{ postList.length }}</span> 个项目进行
          <span class="cRed">删除</span> 的操作吗？<span class="cRed"
            >该操作不可恢复！</span
          >
        </div>
      </div>
      <div
        class="post-batch-border"
        v-if="['addTag', 'setTag', 'removeTag'].includes(params.action)"
      >
        <!-- selectedTagList -->
        <div>
          <div class="dib">已选标签：</div>
          <el-tag
            v-for="tag in selectedTagList"
            :key="tag._id"
            effect="plain"
            type="primary"
            class="post-batch-selected-tag-list"
          >
            {{ tag.currentLabel }}
          </el-tag>
        </div>
      </div>
      <div class="post-batch-border">
        <div class="mb5">已选文章：</div>
        <el-scrollbar class="post-batch-form-scroll">
          <ul class="post-batch-form-list">
            <li
              v-for="post in postList"
              :key="post._id"
              class="post-batch-form-item"
            >
              <el-tag v-if="post.type === 1" effect="plain" type="success"
                >博文</el-tag
              >
              <el-tag v-else-if="post.type === 2" effect="plain">推文</el-tag>
              <el-tag v-else-if="post.type === 3" effect="plain" type="info"
                >页面</el-tag
              >
              <span class="post-batch-form-title">{{
                post.title || post.excerpt || '未定义标题或内容'
              }}</span>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </div>
  </CheckDialog>
</template>

<script>
import { reactive, ref } from 'vue'
import SortSelector from '@/components/SortSelector.vue'
import TagSelector from '@/components/TagSelector.vue'
import CheckDialog from '@/components/CheckDialog.vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api'
export default {
  components: {
    SortSelector,
    TagSelector,
    CheckDialog
  },
  props: {
    // 选中的postList
    postList: {
      type: Array,
      default: () => []
    }
  },
  emits: ['success', 'cancel'],
  setup(props, { emit }) {
    const actionList = [
      { value: 'changeSort', title: '更改分类' },
      { value: 'addTag', title: '添加标签' },
      { value: 'setTag', title: '设置标签' },
      { value: 'removeTag', title: '移除标签' },
      { value: 'changeStatus', title: '更改状态' },
      { value: 'delete', title: '删除' }
    ]
    const params = reactive({
      action: null,
      status: null,
      sortId: null,
      tagIdList: []
    })

    const SearchTagSelectorRef = ref(null)
    const selectedTagList = ref([])

    const SearchSortSelectorRef = ref(null)
    const selectedSortName = ref('')
    const tryBatch = () => {
      console.log('tryBatch')
      // action为必填
      if (!params.action) {
        ElMessage.error('请选择操作')
        return
      }
      // 根据action执行不同的校验
      switch (params.action) {
        case 'addTag':
        case 'setTag':
        case 'removeTag':
          if (!params.tagIdList.length) {
            ElMessage.error('请选择标签')
            return
          }
          selectedTagList.value =
            SearchTagSelectorRef.value?.getSelectedList() || []
          break
        case 'changeStatus':
          if (!params.status) {
            ElMessage.error('请选择状态')
            return
          }
          break
        case 'changeSort':
          selectedSortName.value =
            SearchSortSelectorRef.value?.getOriginName() || ''
          break
        default:
          break
      }
      dialogOpen.value = true
    }

    const dialogOpen = ref(false)

    const doBatch = () => {
      console.log('doBatch')
      // 根据action执行不同的操作
      const form = {
        action: params.action,
        idList: props.postList.map(post => post._id)
      }
      switch (form.action) {
        case 'changeSort':
          form.sortId = params.sortId
          break
        case 'addTag':
        case 'setTag':
        case 'removeTag':
          form.tagIdList = params.tagIdList
          break
        case 'changeStatus':
          form.status = Number(params.status)
          break
        case 'delete':
          break
        default:
          break
      }
      authApi.putBatchPost(form).then(() => {
        ElMessage.success('操作成功')
        dialogOpen.value = false
        emit('success')
      })
    }

    const statusMap = {
      0: '草稿',
      1: '发布',
      99: '回收站'
    }

    const cancel = () => {
      emit('cancel')
    }

    return {
      actionList,
      params,
      SearchTagSelectorRef,
      selectedTagList,
      SearchSortSelectorRef,
      selectedSortName,
      tryBatch,

      dialogOpen,
      doBatch,
      cancel,
      statusMap
    }
  }
}
</script>

<style scoped>
.post-batch-form-scroll {
  max-height: calc(100dvh - 500px);
  min-height: 100px;
  height: 100dvh;
}
.post-batch-border {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin: 0px 0px 10px 0px;
}
.post-batch-selected-tag-list {
  margin: 2px 4px 2px 0;
}
.post-batch-form-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.post-batch-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.post-batch-form-item:last-child {
  margin-bottom: 0;
}
.post-batch-form-title {
  margin-left: 10px;
  /* 一行 超过... */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
