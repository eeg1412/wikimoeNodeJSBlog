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
        <!-- 选项 -->
        <el-form-item label="投票选项" required>
          <!-- 遍历options -->
          <template v-for="(item, index) in form.options" :key="index">
            <div
              class="w_10 vote-option-row mb20"
              v-if="item.action !== 'delete'"
            >
              <el-row class="mb20">
                <el-col :span="24">
                  <div class="mb20">
                    <el-form-item
                      :prop="'options.' + index + '.title'"
                      :rules="{
                        required: true,
                        message: '请输入选项内容',
                        trigger: 'blur',
                      }"
                    >
                      <div class="w_10 required">内容</div>
                      <el-input
                        v-model="item.title"
                        @change="changeOption(index)"
                        placeholder="请输入选项内容"
                      ></el-input>
                    </el-form-item>
                  </div>
                </el-col>
                <el-col :span="24">
                  <div>
                    <el-form-item
                      :prop="'options.' + index + '.sort'"
                      :rules="{
                        required: true,
                        message: '请输入排序',
                        trigger: 'blur',
                      }"
                    >
                      <div class="w_10 required">排序</div>
                      <el-input-number
                        v-model="item.sort"
                        placeholder="请输入排序"
                        :min="1"
                        :max="999999999"
                        :precision="0"
                        @change="changeOption(index)"
                      ></el-input-number>
                    </el-form-item>
                  </div>
                </el-col>
              </el-row>
              <div class="vote-delete">
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  text
                  circle
                  @click="removeOption(index)"
                  icon="Close"
                ></el-button>
              </div>
            </div>
          </template>
          <!-- 添加按钮 -->
          <el-form-item class="w_10" prop="options">
            <el-button type="primary" @click="addOption">添加选项</el-button>
          </el-form-item>
        </el-form-item>
        <!-- maxSelect -->
        <el-form-item label="最多可选择的选项数" prop="maxSelect">
          <el-input-number
            v-model="form.maxSelect"
            :min="1"
            :max="form.options.length || 1"
          ></el-input-number>
        </el-form-item>
        <!-- showResultAfter -->
        <el-form-item label="投票后才显示结果" prop="showResultAfter">
          <el-switch v-model="form.showResultAfter"></el-switch>
          <div class="w_10">※仅限投票期间，时间结束后依然会显示投票结果</div>
        </el-form-item>
        <!-- 结束时间 -->
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
          <div class="w_10">※不填写则不限制</div>
        </el-form-item>
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
    // // 投票后才显示结果
    // showResultAfter: { type: Boolean, default: true },
    // // 状态 0 不显示 1 显示
    // status: { type: Number, default: 0 },
    const form = reactive({
      title: '',
      maxSelect: null,
      showResultAfter: false,
      endTime: null,
      options: [],
      status: 0,
      __v: null,
    })
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
            const notDeleteOptions = value.filter((item) => {
              return item.action !== 'delete'
            })
            if (notDeleteOptions.length < 2) {
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
        const data = {
          ...form,
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          const actionArr = ['add', 'delete', 'update']
          data.options = data.options.filter((item) => {
            return actionArr.includes(item.action)
          })

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
          form.title = res.data.data.title
          form.maxSelect = res.data.data.maxSelect
          form.showResultAfter = res.data.data.showResultAfter
          form.endTime = res.data.data.endTime
          form.status = res.data.data.status
          form.options = res.data.data.options
        })
        .catch(() => {})
    }
    const addOption = () => {
      form.options.push({
        title: '',
        sort: form.options.length + 1,
        action: 'add',
      })
    }
    const removeOption = (index) => {
      // 如果action为add，则直接删除
      if (form.options[index].action === 'add') {
        form.options.splice(index, 1)
      } else {
        // 否则将action改为delete
        form.options[index].action = 'delete'
      }
    }
    const changeOption = (index) => {
      if (form.options[index].action !== 'add') {
        form.options[index].action = 'update'
      }
    }
    onMounted(() => {
      if (id.value) {
        getVoteDetail()
      } else {
        addOption()
        addOption()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit,
      addOption,
      removeOption,
      changeOption,
    }
  },
}
</script>
<style scoped>
.vote-option-row {
  border: 1px solid var(--el-border-color);
  padding: 20px 20px 20px 20px;
  position: relative;
}
.vote-delete {
  position: absolute;
  right: 5px;
  top: 5px;
  z-index: 1;
}
</style>
