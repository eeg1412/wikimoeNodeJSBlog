const fs = require('fs')
const path = require('path');

// 获取node run creatCRUD 时的参数
const args = process.argv.slice(2);
// 0是表名，1是中文名
const tableName = args[0];
const chineseName = args[1];

const viewPath = path.join('./src/views/index')

// 创建tableName文件夹
const tableNamePath = path.join(viewPath, tableName)
if (!fs.existsSync(tableNamePath)) {
  fs.mkdirSync(tableNamePath)
}
// 将tableName首字母大写
const tableNameFirstLetter = tableName.slice(0, 1).toUpperCase()

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
    <!-- ${chineseName}s -->
    <div class="mb20">
      <el-table :data="${chineseName}List" row-key="_id" border default-expand-all>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goEdit(row._id)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="delete${tableNameFirstLetter}(row._id)"
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
        v-model:current-page="params.page"
      />
    </div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import { setSessionParams, getSessionParams } from '@/utils/utils'
export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const ${chineseName}List = ref([])
    const params = reactive({
      page: 1,
      size: 10,
      keyword: '',
    })
    const total = ref(0)
    const get${tableNameFirstLetter}List = (resetPage) => {
      if (resetPage) {
        params.page = 1
      }
      authApi
        .get${tableNameFirstLetter}List(params)
        .then((res) => {
          ${chineseName}List.value = res.data.list
          total.value = res.data.total
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
    const delete${tableNameFirstLetter} = (id) => {
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
            .delete${tableNameFirstLetter}(params)
            .then(() => {
              ElMessage.success('删除成功')
              get${tableNameFirstLetter}List()
            })
            .catch(() => {})
        })
        .catch(() => {})
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
      ${chineseName}List,
      params,
      total,
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
  fs.writeFile(filePath, template, (err) => {
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
}

// 运行
listTemplate(tableName, chineseName)
editorTemplate(tableName, chineseName)