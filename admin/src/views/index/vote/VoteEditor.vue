<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'VoteList' }"
          >投票列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="160px">
        <!-- title -->
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <!-- maxSelect -->
        <el-form-item label="最多可选择的选项数" prop="maxSelect">
          <el-input-number
            v-model="form.maxSelect"
            :min="1"
            :max="options.length || 1"
          ></el-input-number>
        </el-form-item>
        <!-- showResult -->
        <el-form-item label="是否投票后显示结果" prop="showResult">
          <el-switch v-model="form.showResult"></el-switch>
        </el-form-item>
        <!-- 结束时间 -->
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <!-- 选项 -->
        <el-form-item label="投票选项" prop="options"> </el-form-item>
        <!-- status -->
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
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    //    // 标题
    // title: { type: String, required: true },
    // // 最多可选择的选项数
    // maxSelect: { type: Number, default: 1 },
    // // 是否投票后显示结果
    // showResult: { type: Boolean, default: true },
    // // 状态 0 不显示 1 显示
    // status: { type: Number, default: 0 },
    const form = reactive({
      title: '',
      maxSelect: 1,
      showResult: true,
      endTime: null,
      status: 0,
      __v: null,
    })
    const options = ref([])
    const rules = reactive({
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      maxSelect: [
        {
          required: true,
          message: '请输入最多可选择的选项数',
          trigger: 'blur',
        },
      ],
      // options 检查 options.value.length 是否大于等于 2
      options: [
        {
          validator: (rule, value) => {
            if (options.value.length < 2) {
              return Promise.reject('至少需要2个选项')
            }
            return Promise.resolve()
          },
          trigger: 'blur',
        },
      ],
    })
    const formRef = ref(null)
    const submit = () => {
      formRef.value.validate(async (valid) => {
        if (!valid) {
          return false
        }
        const data = {}
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateVote(data)
            .then(() => {
              router.push({
                name: 'VoteList',
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createVote(data)
            .then(() => {
              router.push({
                name: 'VoteList',
              })
            })
            .catch(() => {})
        }
      })
    }

    const getVoteDetail = () => {
      const params = {
        id: id.value,
      }
      authApi
        .getVoteDetail(params)
        .then((res) => {
          form.__v = res.data.data.__v
        })
        .catch(() => {})
    }
    onMounted(() => {
      if (id.value) {
        getVoteDetail()
      }
    })
    return {
      id,
      form,
      options,
      rules,
      formRef,
      submit,
    }
  },
}
</script>
<style scoped></style>
