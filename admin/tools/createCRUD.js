const fs = require('fs')
const path = require('path')

// 获取node run creatCRUD 时的参数
const args = process.argv.slice(2)
// 0是表名，1是中文名
const tableName = args[0]
const chineseName = args[1]

const viewPath = path.join('./src/views/index')

// 创建tableName文件夹
const tableNamePath = path.join(viewPath, tableName)
if (!fs.existsSync(tableNamePath)) {
  fs.mkdirSync(tableNamePath)
}
// 将tableName首字母替换为大写
const tableNameFirstLetter = tableName.replace(
  tableName[0],
  tableName[0].toUpperCase()
)

const listTemplate = (tableName, chineseName) => {
  const template = `<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>${chineseName}列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body">
        <!-- 检索用 -->
        <el-form
          :inline="true"
          :model="params"
          @submit.prevent
          class="demo-form-inline"
          @keypress.enter="get${tableNameFirstLetter}List(true)"
        >
          <el-form-item>
            <el-input
              v-model="params.keyword"
              placeholder="请输入${chineseName}名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="get${tableNameFirstLetter}List(true)">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 追加 -->
        <el-button type="primary" @click="handleAdd">追加</el-button>
      </div>
    </div>
    <!-- ${chineseName} -->
    <div class="mb20 list-table-body">
      <el-table height="100%" :data="${tableName}List" row-key="_id" ref="tableRef" border>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="delete${tableNameFirstLetter}(row)"
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
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams, escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const ${tableName}List = ref([])
    const params = reactive({
      page: 1,
      size: 50,
      keyword: '',
    })
    const total = ref(0)
    const tableRef = ref(null)
    const get${tableNameFirstLetter}List = (resetPage) => {
      if (resetPage === true && params.page !== 1) {
        params.page = 1
        return
      }
      authApi
        .get${tableNameFirstLetter}List(params)
        .then((res) => {
          ${tableName}List.value = res.data.list
          total.value = res.data.total
          tableRef.value.scrollTo({ top: 0 })
          setSessionParams(route.name, params)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const handleAdd = () => {
      router.push({
        name: '${tableNameFirstLetter}Add',
      })
    }
    // 监听 params.page 的变化
    watch(
      () => params.page,
      (newVal, oldVal) => {
        get${tableNameFirstLetter}List()
      }
    )

    const goEdit = (id) => {
      router.push({
        name: '${tableNameFirstLetter}Edit',
        params: {
          id,
        },
      })
    }
    const delete${tableNameFirstLetter} = (row) => {
      const id = row._id
      const title = escapeHtml(row.title || '') || '未命名'

      CheckDialogService.open({
        correctAnswer: '是',
        content: \`此操作将<span class="cRed">永久删除活动：【\${title}】</span>, 是否继续?\`,
        success: () => {
          return authApi.delete${tableNameFirstLetter}({ id }).then(() => {
            ElMessage.success('删除成功')
            get${tableNameFirstLetter}List()
          })
        },
      })
        .then(() => {})
        .catch((error) => {
          console.log('Dialog closed:', error)
        })
    }

    const initParams = () => {
      const sessionParams = getSessionParams(route.name)
      if (sessionParams) {
        params.page = sessionParams.page
        params.size = sessionParams.size
        params.keyword = sessionParams.keyword
      }
    }
    onMounted(() => {
      initParams()
      get${tableNameFirstLetter}List()
    })
    return {
      ${tableName}List,
      params,
      total,
      tableRef,
      get${tableNameFirstLetter}List,
      handleAdd,
      goEdit,
      delete${tableNameFirstLetter},
    }
  },
}
</script>
<style lang=""></style>`
  // 写入文件
  const filePath = path.join(tableNamePath, `${tableNameFirstLetter}List.vue`)
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, err => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}

const editorTemplate = (tableName, chineseName) => {
  const template = `<template>
<div class="common-right-panel-form common-limit-width">
  <div class="pb20">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: '${tableNameFirstLetter}List' }"
        >${chineseName}列表</el-breadcrumb-item
      >
      <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
      <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
  <div>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item>
        <el-button type="primary" @click="submit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { authApi } from '@/api'
export default {
setup() {
  const router = useRouter()
  const route = useRoute()
  const id = ref(route.params.id)
  const form = reactive({
    __v: null,
  })
  const rules = reactive({
  })
  const formRef = ref(null)
  const submit = () => {
    formRef.value.validate(async (valid) => {
      if (!valid) {
        return false
      }
      const data = {
  
      }
      if (id.value) {
        // 编辑
        data.id = id.value
        data.__v = form.__v
        authApi
          .update${tableNameFirstLetter}(data)
          .then(() => {
            router.push({
              name: '${tableNameFirstLetter}List',
            })
          })
          .catch(() => {})
      } else {
        // 追加
        authApi
          .create${tableNameFirstLetter}(data)
          .then(() => {
            router.push({
              name: '${tableNameFirstLetter}List',
            })
          })
          .catch(() => {})
      }
    })
  }

  const get${tableNameFirstLetter}Detail = () => {
    const params = {
      id: id.value,
    }
    authApi
      .get${tableNameFirstLetter}Detail(params)
      .then((res) => {
        form.__v = res.data.data.__v
      })
      .catch(() => {})
  }
  onMounted(() => {
    if (id.value) {
      get${tableNameFirstLetter}Detail()
    }
  })
  return {
    id,
    form,
    rules,
    formRef,
    submit,
  }
},
}
</script>
<style scoped></style>`
  // 写入文件
  const filePath = path.join(tableNamePath, `${tableNameFirstLetter}Editor.vue`)
  // 文件存在就不创建
  if (fs.existsSync(filePath)) {
    console.log(`${tableName}s.js is exist`)
    return
  }
  fs.writeFile(filePath, template, err => {
    if (err) {
      console.log(err)
    } else {
      console.log(`create ${tableName} success`)
    }
  })
}

// 运行
listTemplate(tableName, chineseName)
editorTemplate(tableName, chineseName)
