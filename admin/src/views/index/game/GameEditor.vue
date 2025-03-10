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
            style="width: calc(100% - 100px)"
          >
            <el-option
              v-for="item in gamePlatformList"
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
        <!-- 弃坑 -->
        <el-form-item label="弃坑" prop="giveUp">
          <el-switch v-model="form.giveUp"></el-switch>
        </el-form-item>
        <!-- 攻略状态 -->
        <el-form-item label="攻略状态">
          <div class="w_10">{{ playStatus }}</div>
          <!-- 提示是怎么产生阅读状态的原理 -->
          <div class="f12 cGray666">
            尚未攻略：无开始时间 无结束时间<br />
            攻略中：有开始时间 无结束时间<br />
            已通关：有开始时间 有结束时间<br />
            弃坑：弃坑状态
          </div>
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
    <GamePlatformEditor ref="GamePlatformEditorRef" />
  </div>
</template>
<script>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, reactive, ref, computed } from 'vue'
import { authApi } from '@/api'
import GamePlatformEditor from '@/components/GamePlatformEditor.vue'
export default {
  components: {
    GamePlatformEditor,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
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
      giveUp: false,
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
        // 如果平台和相册为空则改为null
        if (!data.gamePlatform) {
          data.gamePlatform = null
        }
        if (!data.screenshotAlbum) {
          data.screenshotAlbum = null
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

    const GamePlatformEditorRef = ref(null)
    const open = () => {
      GamePlatformEditorRef.value.open()
    }

    const playStatus = computed(() => {
      // giveUp 为true时 为弃坑
      if (form.giveUp) {
        return '弃坑'
      }
      // 有开始时间 无结束时间 攻略中
      if (form.startTime && !form.endTime) {
        return '攻略中'
      }
      // 结束时间和开始时间都没有 尚未攻略
      if (!form.startTime && !form.endTime) {
        return '尚未攻略'
      }
      // 有开始时间 有结束时间 已通关
      if (form.startTime && form.endTime) {
        return '已通关'
      }
      return '-'
    })

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
      GamePlatformEditorRef,
      open,
      playStatus,
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
  border: 1px solid var(--el-border-color);
  padding: 20px;
}
</style>
