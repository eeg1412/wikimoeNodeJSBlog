<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'EventList' }"
          >活动列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <!-- eventtype 活动类型 -->
        <el-form-item label="活动类型" prop="eventtype">
          <el-select
            v-model="form.eventtype"
            clearable
            filterable
            remote
            :automatic-dropdown="true"
            :remote-method="queryEventtypeList"
            :loading="eventtypeListIsLoading"
            placeholder="请选择"
            style="width: calc(100% - 100px)"
          >
            <el-option
              v-for="item in eventtypeList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            ></el-option>
          </el-select>
          <el-button type="primary" class="ml5" @click="open">追加 </el-button>
        </el-form-item>
        <!-- title -->
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题"></el-input>
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
        <!-- 开始时间 -->
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <!-- 结束时间 -->
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <!-- content -->
        <el-form-item label="内容" prop="content">
          <RichEditor5 v-model:content="form.content" />
        </el-form-item>
        <!-- 专属颜色 -->
        <el-form-item label="专属颜色" prop="color">
          <el-color-picker v-model="form.color" />
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
    <EventtypeEditor ref="EventtypeEditorRef" />
  </div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { authApi } from '@/api'
import EventtypeEditor from '@/components/EventtypeEditor.vue'
import RichEditor5 from '@/components/RichEditor5'

export default {
  components: {
    EventtypeEditor,
    RichEditor5
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    // eventtype: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'eventtypes',
    // },
    // // 标题
    // title: {
    //   type: String,
    //   required: true
    // },
    // color: {
    //   type: String,
    //   default: null
    // },
    // urlList: {
    //   type: [
    //     {
    //       text: String,
    //       url: String
    //     }
    //   ],
    //   default: []
    // },
    // content: {
    //   type: String,
    //   default: ''
    // },
    // // 开始时间
    // startTime: {
    //   type: Date,
    //   required: true
    // },
    // // 结束时间
    // endTime: {
    //   type: Date,
    //   required: true
    // },
    // // 状态 0: 不显示 1: 显示
    // status: {
    //   type: Number,
    //   default: 0
    // },
    const form = reactive({
      eventtype: null,
      title: '',
      color: null,
      urlList: [],
      content: '',
      startTime: null,
      endTime: null,
      status: 0,
      __v: null
    })
    const rules = reactive({
      eventtype: [
        { required: true, message: '请选择活动类型', trigger: 'blur' }
      ],
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      startTime: [
        { required: true, message: '请选择开始时间', trigger: 'blur' },
        // 结束时间必须在开始时间之后
        {
          validator: (rule, value, callback) => {
            if (form.startTime && form.endTime) {
              if (form.endTime < form.startTime) {
                callback(new Error('结束时间必须在开始时间之后'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      endTime: [
        { required: true, message: '请选择结束时间', trigger: 'blur' },
        // 结束时间必须在开始时间之后
        {
          validator: (rule, value, callback) => {
            if (form.startTime && form.endTime) {
              if (form.endTime < form.startTime) {
                callback(new Error('结束时间必须在开始时间之后'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    })
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
          data.__v = form.__v
          authApi
            .updateEvent(data)
            .then(() => {
              router.push({
                name: 'EventList'
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createEvent(data)
            .then(() => {
              router.push({
                name: 'EventList'
              })
            })
            .catch(() => {})
        }
      })
    }

    const getEventDetail = () => {
      const params = {
        id: id.value
      }
      authApi
        .getEventDetail(params)
        .then(res => {
          form.__v = res.data.data.__v
          // form.eventtype = res.data.data.eventtype?._id || null
          if (res.data.data.eventtype) {
            form.eventtype = res.data.data.eventtype._id
            eventtypeList.value = [res.data.data.eventtype]
          }
          form.title = res.data.data.title
          form.color = res.data.data.color
          form.urlList = res.data.data.urlList || []
          form.content = res.data.data.content
          form.startTime = res.data.data.startTime
          form.endTime = res.data.data.endTime
          form.status = res.data.data.status
        })
        .catch(() => {})
    }

    // 活动类型列表
    const eventtypeList = ref([])
    const eventtypeListIsLoading = ref(false)
    const eventtypeListTimer = null
    const queryEventtypeList = query => {
      if (eventtypeListTimer) {
        clearTimeout(eventtypeListTimer)
      }
      setTimeout(() => {
        eventtypeListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50
        }
        authApi
          .getEventtypeList(params, { noLoading: true })
          .then(res => {
            eventtypeList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            eventtypeListIsLoading.value = false
          })
      }, 300)
    }
    const EventtypeEditorRef = ref(null)
    const open = () => {
      EventtypeEditorRef.value.open()
    }
    onMounted(() => {
      if (id.value) {
        getEventDetail()
      }
    })
    return {
      id,
      form,
      rules,
      formRef,
      submit,
      queryEventtypeList,
      eventtypeList,
      eventtypeListIsLoading,
      EventtypeEditorRef,
      open
    }
  }
}
</script>
<style scoped>
.url-link-row {
  border: 1px solid var(--el-border-color);
  padding: 20px;
}
</style>
