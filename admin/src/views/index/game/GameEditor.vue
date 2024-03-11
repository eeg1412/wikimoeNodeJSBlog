<template>
  <div class="common-right-panel-form common-limit-width">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'GameList' }"
          >游戏列表</el-breadcrumb-item
        >
        <el-breadcrumb-item v-if="id">编辑</el-breadcrumb-item>
        <el-breadcrumb-item v-else>追加</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <!-- gamePlatform 平台 -->
        <el-form-item label="平台" prop="gamePlatform">
          <el-select
            v-model="form.gamePlatform"
            clearable
            filterable
            remote
            :automatic-dropdown="true"
            :remote-method="queryGamePlatformList"
            :loading="gamePlatformListIsLoading"
            placeholder="请选择"
          >
            <el-option
              v-for="item in gamePlatformList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <Cropper
            :maxWidth="1280"
            :maxHeight="1280"
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
        <!-- screenshotAlbum 截图相册 -->
        <el-form-item label="截图相册" prop="screenshotAlbum">
          <el-select
            v-model="form.screenshotAlbum"
            placeholder="请选择"
            clearable
            filterable
            remote
            :automatic-dropdown="true"
            :remote-method="queryScreenshotAlbumList"
            :loading="screenshotAlbumListIsLoading"
          >
            <el-option
              v-for="item in screenshotAlbumList"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            ></el-option>
          </el-select>
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
        <!-- 游戏开始时间 -->
        <el-form-item label="游戏开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <!-- 游戏结束时间 -->
        <el-form-item label="游戏结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
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
export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    //   gamePlatform: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'gamePlatform',
    // },
    // // 标题
    // title: {
    //   type: String,
    //   required: true
    // },
    // // 封面
    // cover: {
    //   type: String,
    // },
    // coverFolder: {
    //   type: String,
    //   default: null
    // },
    // coverFileName: {
    //   type: String,
    //   default: null
    // },
    // // 简评
    // summary: {
    //   type: String,
    // },
    // // 评分，神作，佳作，良作，劣作，烂作，迷
    // rating: {
    //   type: Number,
    // },
    // // label 字符串数组
    // label: {
    //   type: [String],
    //   default: []
    // },
    // screenshotAlbum: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'albums'
    // },
    // urlList: {
    //   type: [
    //   {
    //     text: String,
    //     url: String
    //   }
    // ],
    //   default: []
    // },
    // // 游玩开始时间
    // startTime: {
    //   type: Date,
    // },
    // // 游玩结束时间
    // endTime: {
    //   type: Date,
    // },
    // // 状态 0: 不显示 1: 显示
    // status: {
    //   type: Number,
    //   default: 0
    // },
    const form = reactive({
      __v: null,
      gamePlatform: null,
      title: null,
      cover: null,
      summary: null,
      rating: null,
      label: [],
      screenshotAlbum: null,
      urlList: [],
      startTime: null,
      endTime: null,
      status: 0,
    })
    const rules = reactive({
      // title
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      startTime: [
        {
          validator: (rule, value, callback) => {
            if (form.endTime && !value) {
              callback(new Error('请选择游戏结束时间'))
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
        if (id.value) {
          // 编辑
          data.id = id.value
          data.__v = form.__v
          authApi
            .updateGame(data)
            .then(() => {
              router.push({
                name: 'GameList',
              })
            })
            .catch(() => {})
        } else {
          // 追加
          authApi
            .createGame(data)
            .then(() => {
              router.push({
                name: 'GameList',
              })
            })
            .catch(() => {})
        }
      })
    }

    const getGameDetail = () => {
      const params = {
        id: id.value,
      }
      authApi
        .getGameDetail(params)
        .then((res) => {
          form.__v = res.data.data.__v
          if (res.data.data.gamePlatform) {
            form.gamePlatform = res.data.data.gamePlatform._id
            gamePlatformList.value = [res.data.data.gamePlatform]
          }
          form.title = res.data.data.title
          form.cover = res.data.data.cover
          form.summary = res.data.data.summary
          form.rating = res.data.data.rating
          form.label = res.data.data.label
          if (res.data.data.screenshotAlbum) {
            form.screenshotAlbum = res.data.data.screenshotAlbum._id
            screenshotAlbumList.value = [res.data.data.screenshotAlbum]
          }

          form.urlList = res.data.data.urlList
          form.startTime = res.data.data.startTime
          form.endTime = res.data.data.endTime
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

    // 游戏平台列表
    const gamePlatformList = ref([])
    const gamePlatformListIsLoading = ref(false)
    const gamePlatformListTimer = null
    const queryGamePlatformList = (query) => {
      if (gamePlatformListTimer) {
        clearTimeout(gamePlatformListTimer)
      }
      setTimeout(() => {
        gamePlatformListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50,
        }
        authApi
          .getGamePlatformList(params, { noLoading: true })
          .then((res) => {
            gamePlatformList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            gamePlatformListIsLoading.value = false
          })
      }, 300)
    }
    // 截图相册列表
    const screenshotAlbumList = ref([])
    const screenshotAlbumListIsLoading = ref(false)
    const screenshotAlbumListTimer = null
    const queryScreenshotAlbumList = (query) => {
      if (screenshotAlbumListTimer) {
        clearTimeout(screenshotAlbumListTimer)
      }
      setTimeout(() => {
        screenshotAlbumListIsLoading.value = true
        const params = {
          keyword: query,
          page: 1,
          size: 50,
        }
        authApi
          .getAlbumList(params, { noLoading: true })
          .then((res) => {
            screenshotAlbumList.value = res.data.list
          })
          .catch(() => {})
          .finally(() => {
            screenshotAlbumListIsLoading.value = false
          })
      }, 300)
    }

    onMounted(() => {
      if (id.value) {
        getGameDetail()
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
      gamePlatformList,
      gamePlatformListIsLoading,
      queryGamePlatformList,
      screenshotAlbumList,
      screenshotAlbumListIsLoading,
      queryScreenshotAlbumList,
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
