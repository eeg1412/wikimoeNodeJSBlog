<template>
  <div class="common-right-panel-form common-limit-width">
    <h3 class="common-title">设置</h3>
    <el-tabs v-model="activeName">
      <el-tab-pane label="网站设置" name="site">
        <el-form
          :model="siteSettingsForm"
          :rules="siteSettingsRules"
          ref="siteSettingsFormRef"
          label-width="120px"
        >
          <el-form-item label="站点标题" prop="siteTitle">
            <el-input v-model="siteSettingsForm.siteTitle"></el-input>
          </el-form-item>
          <el-form-item label="站点副标题" prop="siteSubTitle">
            <el-input v-model="siteSettingsForm.siteSubTitle"></el-input>
          </el-form-item>
          <el-form-item label="站点LOGO" prop="siteLogo">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="setSiteLogo"
              accept="image/*"
            >
              <img
                v-if="siteSettingsForm.siteLogo"
                :src="siteSettingsForm.siteLogo"
                class="avatar"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <!-- siteFavicon -->
          <el-form-item label="站点图标" prop="siteFavicon">
            <Cropper
              :aspectRatio="256 / 256"
              :width="256"
              :height="256"
              :src="siteSettingsForm.siteFavicon"
              @crop="setSiteFavicon"
            ></Cropper>
          </el-form-item>
          <!-- siteDefaultCover -->
          <el-form-item label="默认封面图" prop="siteDefaultCover">
            <Cropper
              :aspectRatio="1344 / 648"
              :width="1344"
              :height="648"
              :src="siteSettingsForm.siteDefaultCover"
              @crop="setSiteDefaultCover"
            ></Cropper>
          </el-form-item>
          <el-form-item label="站点描述" prop="siteDescription">
            <el-input v-model="siteSettingsForm.siteDescription"></el-input>
          </el-form-item>
          <el-form-item label="站点关键词" prop="siteKeywords">
            <el-input v-model="siteSettingsForm.siteKeywords"></el-input>
          </el-form-item>
          <el-form-item label="站点地址" prop="siteUrl">
            <el-input
              v-model="siteSettingsForm.siteUrl"
              @blur="onSiteUrlBlur"
            ></el-input>
          </el-form-item>
          <el-form-item label="每页显示" prop="sitePageSize">
            <!-- 数字 1-100 -->
            <el-input-number
              v-model="siteSettingsForm.sitePageSize"
              controls-position="right"
              :min="1"
              :max="100"
              :step="1"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="所在时区" prop="siteTimeZone">
            <el-select v-model="siteSettingsForm.siteTimeZone">
              <el-option
                v-for="item in timeZones"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="siteSettingsSubmit"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="评论设置" name="comment">
        <el-form
          :model="commentSettingsForm"
          :rules="commentSettingsRules"
          ref="commentSettingsFormRef"
          label-width="120px"
        >
          <!-- 评论设置 -->

          <el-form-item label="开启评论" prop="siteEnableComment">
            <el-switch
              v-model="commentSettingsForm.siteEnableComment"
            ></el-switch>
          </el-form-item>
          <el-form-item label="发表评论间隔" prop="siteCommentInterval">
            <!-- 数字 1-100 -->
            <el-input-number
              v-model="commentSettingsForm.siteCommentInterval"
              controls-position="right"
              :min="1"
              :max="100"
              :step="1"
            ></el-input-number
            ><span class="pl5">秒</span>
          </el-form-item>
          <el-form-item label="开启评论审核" prop="siteEnableCommentReview">
            <el-switch
              v-model="commentSettingsForm.siteEnableCommentReview"
            ></el-switch>
          </el-form-item>
          <el-form-item label="评论分页" prop="siteCommentPageSize">
            <!-- 数字 1-100 -->
            <el-input-number
              v-model="commentSettingsForm.siteCommentPageSize"
              controls-position="right"
              :min="1"
              :max="100"
              :step="1"
            ></el-input-number>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="commentSettingsSubmit"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="RSS设置" name="rss">
        <el-form
          :model="rssSettingsForm"
          :rules="rssSettingsRules"
          ref="rssSettingsFormRef"
          label-width="120px"
        >
          <!-- RSS -->

          <el-form-item label="开启RSS" prop="siteEnableRss">
            <el-switch v-model="rssSettingsForm.siteEnableRss"></el-switch>
          </el-form-item>
          <el-form-item label="RSS显示条数" prop="siteRssMaxCount">
            <!-- 数字 1-100 -->
            <el-input-number
              v-model="rssSettingsForm.siteRssMaxCount"
              controls-position="right"
              :min="1"
              :max="100"
              :step="1"
            ></el-input-number>
          </el-form-item>
          <!-- <el-form-item label="RSS输出全文" prop="siteRssFullText">
            <el-switch v-model="rssSettingsForm.siteRssFullText"></el-switch>
          </el-form-item> -->

          <el-form-item>
            <el-button type="primary" @click="rssSettingsSubmit"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="媒体设置" name="media">
        <el-form
          :model="mediaForm"
          :rules="mediaRules"
          ref="mediaFormRef"
          label-width="150px"
        >
          <el-form-item label="开启图片压缩" prop="imgSettingEnableImgCompress">
            <el-switch
              v-model="mediaForm.imgSettingEnableImgCompress"
            ></el-switch>
          </el-form-item>
          <div class="config-border-item">
            <div class="config-border-item-title">
              图片压缩设置<span class="config-border-item-tip"
                >※当开启图片压缩时生效</span
              >
            </div>

            <el-form-item
              label="压缩为webp格式"
              prop="imgSettingEnableImgCompressWebp"
            >
              <el-switch
                v-model="mediaForm.imgSettingEnableImgCompressWebp"
              ></el-switch>
            </el-form-item>
            <el-form-item label="图片压缩质量" prop="imgSettingCompressQuality">
              <!-- 数字 1-100 -->
              <el-input-number
                v-model="mediaForm.imgSettingCompressQuality"
                controls-position="right"
                :min="1"
                :max="100"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item
              label="图片压缩最长边"
              prop="imgSettingCompressMaxSize"
            >
              <!-- 数字 1-4096 -->
              <el-input-number
                v-model="mediaForm.imgSettingCompressMaxSize"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
          </div>
          <el-form-item
            label="开启图片缩略图"
            prop="imgSettingEnableImgThumbnail"
          >
            <el-switch
              v-model="mediaForm.imgSettingEnableImgThumbnail"
            ></el-switch>
          </el-form-item>
          <div class="config-border-item">
            <div class="config-border-item-title">
              缩略图设置<span class="config-border-item-tip"
                >※当开启缩略图时生效</span
              >
            </div>
            <el-form-item
              label="图片缩略图质量"
              prop="imgSettingThumbnailQuality"
            >
              <!-- 数字 1-100 -->
              <el-input-number
                v-model="mediaForm.imgSettingThumbnailQuality"
                controls-position="right"
                :min="1"
                :max="100"
                :step="1"
              ></el-input-number>
            </el-form-item>
            <el-form-item
              label="图片缩略图最长边"
              prop="imgSettingThumbnailMaxSize"
            >
              <!-- 数字 1-4096 -->
              <el-input-number
                v-model="mediaForm.imgSettingThumbnailMaxSize"
                controls-position="right"
                :min="1"
                :step="1"
              ></el-input-number>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" @click="mediaSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 邮件设置 -->
      <el-tab-pane label="邮件设置" name="email">
        <el-form
          :model="emailSettingsForm"
          :rules="emailSettingsRules"
          ref="emailSettingsFormRef"
          label-width="120px"
        >
          <el-form-item label="开启邮件通知" prop="emailEnable">
            <el-switch v-model="emailSettingsForm.emailEnable"></el-switch>
          </el-form-item>
          <div class="config-border-item">
            <div class="config-border-item-title">
              SMTP设置<span class="config-border-item-tip"
                >※当开启邮件通知时生效</span
              >
            </div>
            <el-form-item label="SMTP服务器" prop="emailSmtpHost">
              <el-input v-model="emailSettingsForm.emailSmtpHost"></el-input>
            </el-form-item>
            <el-form-item label="SMTP端口" prop="emailSmtpPort">
              <el-input v-model="emailSettingsForm.emailSmtpPort"></el-input>
            </el-form-item>
            <el-form-item label="发信邮箱" prop="emailSender">
              <el-input v-model="emailSettingsForm.emailSender"></el-input>
            </el-form-item>
            <el-form-item label="发信密码" prop="emailPassword">
              <el-input
                v-model="emailSettingsForm.emailPassword"
                type="password"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item label="收信邮箱" prop="emailReceiver">
              <el-input v-model="emailSettingsForm.emailReceiver"></el-input>
            </el-form-item>
            <!-- 通知自己模板 -->
            <el-form-item
              label="通知自己模板"
              prop="emailSendToMeTemplate"
              class="blok-form-item"
            >
              <RichEditor5
                v-model:content="emailSettingsForm.emailSendToMeTemplate"
                v-if="activeName === 'email'"
              />
              <!-- siteTitle -->
              <div>${siteTitle}为站点名称</div>
              <div>${title}为文章标题</div>
              <div>${nickname}为评论者昵称</div>
              <div>${comment}为评论内容</div>
            </el-form-item>
            <!-- 通知评论者模板 -->
            <el-form-item
              label="通知评论者模板"
              prop="emailSendToCommenterTemplate"
              class="blok-form-item"
            >
              <RichEditor5
                v-model:content="emailSettingsForm.emailSendToCommenterTemplate"
                v-if="activeName === 'email'"
              />
              <!-- siteTitle -->
              <div>${siteTitle}为站点名称</div>
              <div>${title}为文章标题</div>
              <!-- nickname -->
              <div>${nickname}为评论者昵称</div>
              <div>${comment}为评论内容</div>
              <div>${parentNickname}为被回复者昵称</div>
              <div>${parentComment}为被回复的内容</div>
            </el-form-item>

            <el-form-item label="发送选项" prop="emailSendOptions">
              <el-checkbox-group v-model="emailSettingsForm.emailSendOptions">
                <el-checkbox
                  v-for="item in emailSendOptions"
                  :key="item.value"
                  :label="item.value"
                  :name="item.value"
                  >{{ item.label }}</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" @click="emailSettingsSubmit"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import store from '@/store'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
// ElMessage
import { ElMessage, ElMessageBox } from 'element-plus'
import RichEditor5 from '@/components/RichEditor5'
import Cropper from '@/components/Cropper'

export default {
  components: {
    RichEditor5,
    Cropper,
  },
  setup() {
    const activeName = ref('site')
    const mediaFormRef = ref(null)
    // // 开启图片压缩
    // imgSettingEnableImgCompress: false,
    // // 图片压缩为webp格式
    // imgSettingEnableImgCompressWebp: false,
    // // 图片压缩质量
    // imgSettingCompressQuality: 80,
    // // 图片压缩最长边
    // imgSettingCompressMaxSize: 1920,
    // // 开启图片缩略图
    // imgSettingEnableImgThumbnail: false,
    // // 图片缩略图质量
    // imgSettingThumbnailQuality: 40,
    // // 图片缩略图最长边
    // imgSettingThumbnailMaxSize: 680,
    const mediaForm = reactive({
      imgSettingEnableImgCompress: false,
      imgSettingEnableImgCompressWebp: false,
      imgSettingCompressQuality: 80,
      imgSettingCompressMaxSize: 1920,
      imgSettingEnableImgThumbnail: false,
      imgSettingThumbnailQuality: 40,
      imgSettingThumbnailMaxSize: 680,
    })
    const mediaRules = {
      imgSettingCompressQuality: [
        { required: true, message: '请输入图片压缩质量', trigger: 'blur' },
      ],
      imgSettingCompressMaxSize: [
        { required: true, message: '请输入图片压缩最长边', trigger: 'blur' },
      ],
      imgSettingThumbnailQuality: [
        {
          required: true,
          message: '请输入图片缩略图质量',
          trigger: 'blur',
        },
      ],
      imgSettingThumbnailMaxSize: [
        {
          required: true,
          message: '请输入图片缩略图最长边',
          trigger: 'blur',
        },
      ],
    }

    const getOptionList = () => {
      authApi.getOptionList().then((res) => {
        // res.data.data是数组，需要转换为对象
        const obj = formatResToObj(res.data.data)
        formatResToForm(mediaForm, obj)
        formatResToForm(siteSettingsForm, obj)
        formatResToForm(commentSettingsForm, obj)
        formatResToForm(rssSettingsForm, obj)
        formatResToForm(emailSettingsForm, obj)
      })
    }
    // 写一个函数将res的data转换为obj
    const formatResToObj = (data) => {
      const obj = {}
      data.forEach((item) => {
        obj[item.name] = item.value
      })
      return obj
    }
    // 写一个函数，先判断原始类型，再将字符串转换为对应的类型
    const formatResToForm = (form, obj) => {
      Object.keys(form).forEach((key) => {
        if (obj[key]) {
          // 判断form[key]的类型，有数字，字符串，布尔，数组，但是value只有字符串，所以需要转换
          if (typeof form[key] === 'number') {
            form[key] = Number(obj[key])
          } else if (typeof form[key] === 'boolean') {
            form[key] = obj[key] === 'true'
          } else if (Array.isArray(form[key])) {
            form[key] = obj[key].split(',')
          } else {
            form[key] = obj[key]
          }
        }
      })
    }
    const mediaSubmit = () => {
      mediaFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(mediaForm).forEach((key) => {
            params.push({
              name: key,
              value: mediaForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(mediaForm, obj)
              store.dispatch('setOptions')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }

    // 网站设置
    const siteSettingsFormRef = ref(null)
    const siteSettingsForm = reactive({
      // 站点标题
      siteTitle: '',
      // 站点副标题
      siteSubTitle: '',
      // 站点LOGO
      siteLogo: '',
      // 站点图标
      siteFavicon: '',
      // 默认封面图
      siteDefaultCover: '',
      // 站点描述
      siteDescription: '',
      // 站点关键词
      siteKeywords: '',
      // 站点地址
      siteUrl: '',
      // 每页显示
      sitePageSize: 10,
      // 你所在时区
      siteTimeZone: '',
    })
    const onSiteUrlBlur = () => {
      // 去掉最末尾的斜杠
      siteSettingsForm.siteUrl = siteSettingsForm.siteUrl.replace(/\/$/, '')
    }
    const siteSettingsRules = {
      siteTitle: [
        { required: true, message: '请输入站点标题', trigger: 'blur' },
      ],
      // logo
      siteLogo: [
        { required: true, message: '请上传站点LOGO', trigger: 'blur' },
      ],
      siteFavicon: [
        { required: true, message: '请上传站点图标', trigger: 'blur' },
      ],
      // siteDefaultCover
      siteDefaultCover: [
        { required: true, message: '请上传默认封面图', trigger: 'blur' },
      ],
      siteUrl: [{ required: true, message: '请输入站点地址', trigger: 'blur' }],
      sitePageSize: [
        { required: true, message: '请输入每页显示', trigger: 'blur' },
      ],
      siteTimeZone: [
        { required: true, message: '请选择你所在时区', trigger: 'blur' },
      ],
    }
    const setSiteLogo = (file) => {
      // file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = (e) => {
        // base64转webp 0.8质量
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0, img.width, img.height)
          const base64 = canvas.toDataURL('image/webp', 0.8)
          siteSettingsForm.siteLogo = base64
        }
      }
    }
    const setSiteDefaultCover = (crop) => {
      siteSettingsForm.siteDefaultCover = crop
    }
    const setSiteFavicon = (crop) => {
      siteSettingsForm.siteFavicon = crop
    }
    const siteSettingsSubmit = () => {
      siteSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(siteSettingsForm).forEach((key) => {
            params.push({
              name: key,
              value: siteSettingsForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(siteSettingsForm, obj)
              store.dispatch('setOptions')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }

    // 评论设置
    const commentSettingsFormRef = ref(null)
    const commentSettingsForm = reactive({
      // 开启评论
      siteEnableComment: false,
      // 发表评论间隔
      siteCommentInterval: 10,
      // 开启评论审核
      siteEnableCommentReview: false,
      // 评论分页
      siteCommentPageSize: 10,
    })
    const commentSettingsRules = {
      siteCommentInterval: [
        { required: true, message: '请输入发表评论间隔', trigger: 'blur' },
      ],
      siteCommentPageSize: [
        { required: true, message: '请输入评论分页', trigger: 'blur' },
      ],
    }
    const commentSettingsSubmit = () => {
      commentSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(commentSettingsForm).forEach((key) => {
            params.push({
              name: key,
              value: commentSettingsForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(commentSettingsForm, obj)
              store.dispatch('setOptions')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }

    // RSS设置
    const rssSettingsFormRef = ref(null)
    const rssSettingsForm = reactive({
      // 开启RSS
      siteEnableRss: false,
      // RSS显示条数
      siteRssMaxCount: 10,
      // RSS输出全文
      // siteRssFullText: false,
    })
    const rssSettingsRules = {
      siteRssMaxCount: [
        { required: true, message: '请输入RSS显示条数', trigger: 'blur' },
      ],
    }
    const rssSettingsSubmit = () => {
      rssSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(rssSettingsForm).forEach((key) => {
            params.push({
              name: key,
              value: rssSettingsForm[key],
            })
          })
          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(rssSettingsForm, obj)
              store.dispatch('setOptions')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }
    // 邮件设置
    const emailSettingsFormRef = ref(null)
    const emailSettingsForm = reactive({
      // 开启邮件通知
      emailEnable: false,
      // smtp服务器
      emailSmtpHost: '',
      // smtp端口
      emailSmtpPort: '',
      // 发信邮箱
      emailSender: '',
      // 发信密码
      emailPassword: '',
      // 收信邮箱
      emailReceiver: '',
      // 发送选项
      // 收到评论时通知自己,回复评论时通知评论者
      emailSendOptions: [],
      // 通知自己模板
      emailSendToMeTemplate: '',
      // 通知评论者模板
      emailSendToCommenterTemplate: '',
    })
    const emailSendOptions = ref([
      {
        label: '收到评论时通知自己',
        value: 'receiveComment',
      },
      {
        label: '回复评论时通知评论者',
        value: 'replyComment',
      },
    ])
    const emailSettingsRules = computed(() => {
      if (emailSettingsForm.emailEnable) {
        return {
          emailSmtpHost: [
            { required: true, message: '请输入smtp服务器', trigger: 'blur' },
          ],
          emailSmtpPort: [
            { required: true, message: '请输入smtp端口', trigger: 'blur' },
          ],
          emailSender: [
            { required: true, message: '请输入发信邮箱', trigger: 'blur' },
          ],
          emailPassword: [
            { required: true, message: '请输入发信密码', trigger: 'blur' },
          ],
          emailReceiver: [
            { required: true, message: '请输入收信邮箱', trigger: 'blur' },
          ],
        }
      } else {
        return {}
      }
    })
    const emailSettingsSubmit = () => {
      emailSettingsFormRef.value.validate((valid) => {
        if (valid) {
          const params = []
          Object.keys(emailSettingsForm).forEach((key) => {
            if (key === 'emailSendOptions') {
              // emailSendOptions 为数组，需要转换为字符串，以逗号分隔
              params.push({
                name: key,
                value: emailSettingsForm[key].join(','),
              })
            } else {
              params.push({
                name: key,
                value: emailSettingsForm[key],
              })
            }
          })

          authApi
            .updateOption({ optionList: params })
            .then((res) => {
              const obj = formatResToObj(res.data.data)
              formatResToForm(emailSettingsForm, obj)
              store.dispatch('setOptions')

              ElMessage.success('更新成功')
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          return false
        }
      })
    }

    const timeZones = ref([
      // 时区列表
      {
        label: 'UTC-12:00 国际日期变更线西',
        value: 'Etc/GMT+12',
      },
      {
        label: 'UTC-11:00 美国萨摩亚群岛',
        value: 'Pacific/Pago_Pago',
      },
      {
        label: 'UTC-10:00 夏威夷',
        value: 'Pacific/Honolulu',
      },
      {
        label: 'UTC-09:00 美国阿拉斯加州',
        value: 'America/Anchorage',
      },
      {
        label: 'UTC-08:00 美国加利福尼亚州',
        value: 'America/Los_Angeles',
      },
      {
        label: 'UTC-07:00 美国科罗拉多州',
        value: 'America/Denver',
      },
      {
        label: 'UTC-06:00 美国德克萨斯州',
        value: 'America/Chicago',
      },
      {
        label: 'UTC-05:00 美国纽约州',
        value: 'America/New_York',
      },
      {
        label: 'UTC-04:00 加拿大魁北克省',
        value: 'America/Halifax',
      },
      {
        label: 'UTC-03:00 巴西利亚',
        value: 'America/Sao_Paulo',
      },
      {
        label: 'UTC-02:00 大西洋中部',
        value: 'Atlantic/South_Georgia',
      },
      {
        label: 'UTC-01:00 佛得角群岛',
        value: 'Atlantic/Cape_Verde',
      },
      {
        label: 'UTC+00:00 英国伦敦',
        value: 'Europe/London',
      },
      {
        label: 'UTC+01:00 德国柏林',
        value: 'Europe/Berlin',
      },
      {
        label: 'UTC+02:00 乌克兰基辅',
        value: 'Europe/Kiev',
      },
      {
        label: 'UTC+03:00 俄罗斯莫斯科',
        value: 'Europe/Moscow',
      },
      {
        label: 'UTC+04:00 亚美尼亚埃里温',
        value: 'Asia/Yerevan',
      },
      {
        label: 'UTC+05:00 乌兹别克斯坦塔什干',
        value: 'Asia/Tashkent',
      },
      {
        label: 'UTC+06:00 哈萨克斯坦阿拉木图',
        value: 'Asia/Almaty',
      },
      {
        label: 'UTC+07:00 越南河内',
        value: 'Asia/Bangkok',
      },
      {
        label: 'UTC+08:00 中国北京',
        value: 'Asia/Shanghai',
      },
      {
        label: 'UTC+09:00 日本东京',
        value: 'Asia/Tokyo',
      },
      {
        label: 'UTC+10:00 澳大利亚悉尼',
        value: 'Australia/Sydney',
      },
      {
        label: 'UTC+11:00 纽埃阿洛菲',
        value: 'Pacific/Niue',
      },
      {
        label: 'UTC+12:00 新西兰惠灵顿',
        value: 'Pacific/Auckland',
      },
    ])

    onMounted(() => {
      getOptionList()
    })
    return {
      activeName,
      mediaFormRef,
      mediaForm,
      mediaRules,
      mediaSubmit,
      // 网站设置
      siteSettingsFormRef,
      siteSettingsForm,
      onSiteUrlBlur,
      siteSettingsRules,
      siteSettingsSubmit,
      // 评论设置
      commentSettingsFormRef,
      commentSettingsForm,
      commentSettingsRules,
      setSiteLogo,
      setSiteDefaultCover,
      setSiteFavicon,
      commentSettingsSubmit,
      // RSS设置
      rssSettingsFormRef,
      rssSettingsForm,
      rssSettingsRules,
      rssSettingsSubmit,
      // 时区列表
      timeZones,
      // 邮件设置
      emailSettingsFormRef,
      emailSettingsForm,
      emailSettingsRules,
      emailSendOptions,
      emailSettingsSubmit,
    }
  },
}
</script>
<style scoped>
.config-border-item {
  border: 1px solid #ebeef5;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
}
.config-border-item-title {
  font-weight: 600;
  margin-bottom: 10px;
}
.config-border-item-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
  padding-left: 10px;
}
</style>
