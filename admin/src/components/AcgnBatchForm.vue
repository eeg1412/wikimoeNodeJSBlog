<template>
  <div class="pb5">
    当前已选中 <span class="cRed pl5 pr5">{{ itemList.length }}</span
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
          style="width: 140px"
        >
          <el-option
            v-for="item in actionList"
            :key="item.value"
            :label="item.title"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- 系列选择 -->
      <el-form-item v-if="params.action === 'addSeries'">
        <SeriesSelector
          v-model="params.seriesId"
          width="200px"
          ref="seriesSelectorRef"
        />
      </el-form-item>
      <!-- 状态 -->
      <el-form-item v-if="params.action === 'changeStatus'">
        <el-select
          v-model="params.status"
          placeholder="请选择状态"
          style="width: 120px"
        >
          <el-option label="显示" :value="1"></el-option>
          <el-option label="不显示" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="tryBatch()">执行</el-button>
        <el-button @click="cancel()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
  <CheckDialog
    v-model:isOpen="dialogOpen"
    correctAnswer="是"
    @confirm="doBatch"
  >
    <div>
      <div class="mb10">
        <div v-if="params.action === 'addSeries'">
          您确定要对 <span class="cRed">{{ itemList.length }}</span> 个项目进行
          <span class="cRed">添加到系列</span> 的操作吗？
        </div>
        <div v-else-if="params.action === 'removeSeries'">
          您确定要对 <span class="cRed">{{ itemList.length }}</span> 个项目进行
          <span class="cRed">移除系列</span> 的操作吗？
        </div>
        <div v-else-if="params.action === 'changeStatus'">
          您确定要对 <span class="cRed">{{ itemList.length }}</span> 个项目进行
          <span class="cRed">更改状态为【{{ statusMap[params.status] }}】</span>
          的操作吗？
        </div>
        <div v-else-if="params.action === 'delete'">
          您确定要对 <span class="cRed">{{ itemList.length }}</span> 个项目进行
          <span class="cRed">删除</span> 的操作吗？<span class="cRed"
            >该操作不可恢复！</span
          >
        </div>
      </div>
      <div class="acgn-batch-border">
        <div class="mb5">已选项目：</div>
        <el-scrollbar class="acgn-batch-form-scroll">
          <ul class="acgn-batch-form-list">
            <li
              v-for="item in itemList"
              :key="item._id"
              class="acgn-batch-form-item"
            >
              <span class="acgn-batch-form-title">{{
                item.title || '未命名'
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
import SeriesSelector from '@/components/SeriesSelector.vue'
import CheckDialog from '@/components/CheckDialog.vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api'

export default {
  name: 'AcgnBatchForm',
  components: {
    SeriesSelector,
    CheckDialog
  },
  props: {
    itemList: {
      type: Array,
      default: () => []
    },
    /**
     * ACGN 类型: bangumi / movie / book / game
     */
    acgnType: {
      type: String,
      required: true
    }
  },
  emits: ['success', 'cancel'],
  setup(props, { emit }) {
    const actionList = [
      { value: 'addSeries', title: '添加到系列' },
      { value: 'removeSeries', title: '移除系列' },
      { value: 'changeStatus', title: '更改状态' },
      { value: 'delete', title: '删除' }
    ]
    const params = reactive({
      action: null,
      status: null,
      seriesId: null
    })

    const seriesSelectorRef = ref(null)

    const statusMap = {
      0: '不显示',
      1: '显示'
    }

    const batchApiMap = {
      bangumi: authApi.batchBangumi,
      movie: authApi.batchMovie,
      book: authApi.batchBook,
      game: authApi.batchGame
    }

    const tryBatch = () => {
      if (!params.action) {
        ElMessage.error('请选择操作')
        return
      }
      switch (params.action) {
        case 'addSeries':
          if (!params.seriesId) {
            ElMessage.error('请选择系列')
            return
          }
          break
        case 'changeStatus':
          if (params.status === null || params.status === undefined) {
            ElMessage.error('请选择状态')
            return
          }
          break
        default:
          break
      }
      dialogOpen.value = true
    }

    const dialogOpen = ref(false)

    const doBatch = () => {
      const form = {
        action: params.action,
        idList: props.itemList.map(item => item._id)
      }
      switch (form.action) {
        case 'addSeries':
          form.seriesId = params.seriesId
          break
        case 'changeStatus':
          form.status = Number(params.status)
          break
        default:
          break
      }
      const batchApi = batchApiMap[props.acgnType]
      if (!batchApi) {
        ElMessage.error('未知的ACGN类型')
        return
      }
      batchApi(form).then(() => {
        ElMessage.success('操作成功')
        dialogOpen.value = false
        emit('success')
      })
    }

    const cancel = () => {
      emit('cancel')
    }

    return {
      actionList,
      params,
      seriesSelectorRef,
      statusMap,
      tryBatch,
      dialogOpen,
      doBatch,
      cancel
    }
  }
}
</script>

<style scoped>
.acgn-batch-form-scroll {
  max-height: calc(100dvh - 500px);
  min-height: 100px;
  height: 100dvh;
}
.acgn-batch-border {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin: 0px 0px 10px 0px;
}
.acgn-batch-form-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.acgn-batch-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.acgn-batch-form-item:last-child {
  margin-bottom: 0;
}
.acgn-batch-form-title {
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
