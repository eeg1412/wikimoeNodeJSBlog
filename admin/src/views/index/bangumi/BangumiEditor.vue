<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'BangumiList' }"
          >番剧列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <!-- title: '',
      cover: '',
      summary: '',
      rating: 0,
      year: 0,
      season: 1,
      label: [],
      status: 0,
      __v: null, -->
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <Cropper
            :maxWidth="480"
            :maxHeight="480"
            :src="form.cover"
            @crop="setCover"
          ></Cropper>
          <div class="w_10 mt5">
            <el-button v-if="form.cover" type="danger" @click="form.cover = ''">
              删除封面
            </el-button>
          </div>
        </el-form-item>
        <!-- 介绍文/简评用textarea -->
        <el-form-item label="介绍文/简评" prop="summary">
          <el-input type="textarea" :rows="5" v-model="form.summary"></el-input>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-input-number
            v-model="form.rating"
            :min="0"
            :max="100"
            :precision="0"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="年" prop="year">
          <el-input-number
            v-model="form.year"
            :precision="0"
            :min="1"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="季度" prop="season">
          <!-- radio 分别对应 1 2 3 4 -->
          <el-radio-group v-model="form.season">
            <el-radio :label="1">冬季新番</el-radio>
            <el-radio :label="2">春季新番</el-radio>
            <el-radio :label="3">夏季新番</el-radio>
            <el-radio :label="4">秋季新番</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标记" prop="label">
          <!-- 可以添加删除的tag -->
          <el-tag
            class="mr5 mb5"
            v-for="(item, index) in form.label"
            :key="index"
            closable
            @close="handleClose(item)"
          >
            {{ item }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          ></el-input>
        </el-form-item>
        <el-form-item label="附加链接" prop="urlList">
          <!-- input循环urlList 有一个添加按钮和删除按钮 -->
          <div class="w_10">
            <el-row
              v-for="(item, index) in form.urlList"
              :key="index"
              class="mb20 url-link-row"
            >
              <el-col :span="24">
                <div class="mb20">
                  <el-form-item
                    :prop="'urlList.' + index + '.text'"
                    :rules="{
                      required: true,
                      message: '请输入链接名称',
                      trigger: 'blur'
                    }"
                  >
                    <el-input
                      v-model="form.urlList[index].text"
                      placeholder="链接名称"
                    >
                    </el-input>
                  </el-form-item>
                </div>

                <div>
                  <el-form-item
                    :prop="'urlList.' + index + '.url'"
                    :rules="{
                      required: true,
                      message: '请输入链接名称',
                      trigger: 'blur'
                    }"
                  >
                    <el-input
                      v-model="form.urlList[index].url"
                      placeholder="链接URL"
                    >
                      <template #append>
                        <el-button @click="form.urlList.splice(index, 1)"
                          ><el-icon><DeleteFilled /></el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </div>
              </el-col>
            </el-row>
            <el-button
              type="primary"
              @click="form.urlList.push({ text: '', url: '' })"
              >添加
            </el-button>
          </div>
        </el-form-item>
        <!-- giveUp -->
        <el-form-item label="弃坑" prop="giveUp">
          <el-switch v-model="form.giveUp"></el-switch>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <!-- radio 分别对应 0 1 不显示 显示 -->
          <el-radio-group v-model="form.status">
            <el-radio :label="0">不显示</el-radio>
            <el-radio :label="1">显示</el-radio>
          </el-radio-group>
        </el-form-item>
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
import Cropper from '@/components/Cropper'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const form = reactive({
      title: '',
      cover: '',
      summary: '',
      rating: 0,
      year: 0,
      season: 1,
      label: [],
      urlList: [],
      giveUp: false,
      status: 0,
      __v: null
    })
    // 获取今年
    const year = new Date().getFullYear()
    // 获取季度
    const quarter = Math.ceil((new Date().getMonth() + 1) / 3)
    // 覆盖form的年和季度
    form.year = year
    form.season = quarter
    const rules = reactive({})
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async valid => {
        if (!valid) {
          return false
        }
        const data = {
          ...form
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          authApi
            .updateBangumi(data)
            .then(() => {
              router.push({
                name: 'BangumiList'
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createBangumi(data)
            .then(() => {
              router.push({
                name: 'BangumiList'
              })
            })
            .catch(() => {})
        }
      })
    }

    const getBangumiDetail = () => {
      const params = {
        id: id.value
      }
      authApi
        .getBangumiDetail(params)
        .then(res => {
          Object.keys(form).forEach(key => {
            form[key] = res.data.data[key]
          })
        })
        .catch(() => {})
    }
    // tag
    const inputValue = ref('')
    const handleClose = tag => {
      form.label.splice(form.label.indexOf(tag), 1)
    }
    const handleInputConfirm = () => {
      if (inputValue.value) {
        form.label.push(inputValue.value)
      }
      inputValue.value = ''
    }
    const setCover = data => {
      form.cover = data
    }

    onMounted(() => {
      if (id.value) {
        getBangumiDetail()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit,
      inputValue,
      handleClose,
      handleInputConfirm,
      setCover
    }
  }
}
</script>
<style scoped>
.input-new-tag {
  width: 90px;
  margin-right: 5px;
  margin-bottom: 5px;
  vertical-align: bottom;
}
.url-link-row {
  border: 1px solid var(--el-border-color);
  padding: 20px;
}
</style>
