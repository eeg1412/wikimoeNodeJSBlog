<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'BookList' }"
          >书籍列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <!-- booktype 类型 -->
        <el-form-item label="类型" prop="booktype">
          <el-select
            v-model="form.booktype"
            clearable
            filterable
            remote
            :automatic-dropdown="true"
            :remote-method="queryBooktypeList"
            :loading="booktypeListIsLoading"
            placeholder="请选择"
            style="width: calc(100% - 100px)"
          >
            <el-option
              v-for="item in booktypeList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            ></el-option>
          </el-select>
          <!-- 追加按钮 -->
          <el-button type="primary" class="ml5" @click="open">追加 </el-button>
        </el-form-item>
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
        <!-- 简评用textarea -->
        <el-form-item label="简评" prop="summary">
          <el-input type="textarea" v-model="form.summary"></el-input>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-input-number
            v-model="form.rating"
            :min="0"
            :max="100"
            :precision="0"
          ></el-input-number>
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
        <!-- urlList 附加链接列表 -->
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
                      trigger: 'blur',
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
                      trigger: 'blur',
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
        <!-- 书籍开始时间 -->
        <el-form-item label="阅读开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <!-- 书籍结束时间 -->
        <el-form-item label="阅读结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <!-- 弃坑 -->
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
    <BooktypeEditor ref="BooktypeEditorRef" />
  </div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { authApi } from '@/api'
import BooktypeEditor from '@/components/BooktypeEditor.vue'
export default {
  components: {
    BooktypeEditor,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const form = reactive({
      __v: null,
      booktype: null,
      title: null,
      cover: null,
      summary: null,
      rating: null,
      label: [],
      urlList: [],
      startTime: null,
      endTime: null,
      giveUp: false,
      status: 0,
    })
    const rules = reactive({
      booktype: [{ required: true, message: '请选择类型', trigger: 'blur' }],
      // title
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      startTime: [
        {
          validator: (rule, value, callback) => {
            if (form.endTime && !value) {
              callback(new Error('请选择书籍结束时间'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ],
      endTime: [
        {
          validator: (rule, value, callback) => {
            if (
              value &&
              form.startTime &&
              new Date(value) < new Date(form.startTime)
            ) {
              callback(new Error('结束时间不能在开始时间之前'))
            } else {
              callback()
            }
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
        if (!data.booktype) {
          data.booktype = null
        }
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateBook(data)
            .then(() => {
              router.push({
                name: 'BookList',
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createBook(data)
            .then(() => {
              router.push({
                name: 'BookList',
              })
            })
            .catch(() => {})
        }
      })
    }

    const getBookDetail = () => {
      const params = {
        id: id.value,
      }
      authApi
        .getBookDetail(params)
        .then((res) => {
          form.__v = res.data.data.__v
          if (res.data.data.booktype) {
            form.booktype = res.data.data.booktype._id
            booktypeList.value = [res.data.data.booktype]
          }
          form.title = res.data.data.title
          form.cover = res.data.data.cover
          form.summary = res.data.data.summary
          form.rating = res.data.data.rating
          form.label = res.data.data.label

          form.urlList = res.data.data.urlList
          form.startTime = res.data.data.startTime
          form.endTime = res.data.data.endTime
          form.giveUp = res.data.data.giveUp
          form.status = res.data.data.status
        })
        .catch(() => {})
    }

    // tag
    const inputValue = ref('')
    const handleClose = (tag) => {
      form.label.splice(form.label.indexOf(tag), 1)
    }
    const handleInputConfirm = () => {
      if (inputValue.value) {
        form.label.push(inputValue.value)
      }
      inputValue.value = ''
    }
    const setCover = (data) => {
      form.cover = data
    }

    // 书籍类型列表
    const booktypeList = ref([])
    const booktypeListIsLoading = ref(false)
    const booktypeListTimer = null
    const queryBooktypeList = (query) => {
      if (booktypeListTimer) {
        clearTimeout(booktypeListTimer)
      }
      setTimeout(() => {
        booktypeListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50,
        }
        authApi
          .getBooktypeList(params, { noLoading: true })
          .then((res) => {
            booktypeList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            booktypeListIsLoading.value = false
          })
      }, 300)
    }
    const BooktypeEditorRef = ref(null)
    const open = () => {
      BooktypeEditorRef.value.open()
    }

    onMounted(() => {
      if (id.value) {
        getBookDetail()
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
      setCover,
      booktypeList,
      booktypeListIsLoading,
      queryBooktypeList,
      BooktypeEditorRef,
      open,
    }
  },
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
  border: 1px solid #eee;
  padding: 20px;
}
</style>
