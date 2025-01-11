<template>
  <el-form
    :model="siteSettingsForm"
    :rules="siteSettingsRules"
    ref="siteSettingsFormRef"
    label-width="150px"
    v-if="inited"
  >
    <el-form-item label="站点标题" prop="siteTitle">
      <el-input v-model="siteSettingsForm.siteTitle"></el-input>
    </el-form-item>
    <el-form-item label="站点副标题" prop="siteSubTitle">
      <el-input v-model="siteSettingsForm.siteSubTitle"></el-input>
    </el-form-item>
    <el-form-item label="站点LOGO" prop="siteLogo">
      <Cropper
        :maxWidth="1024"
        :maxHeight="1024"
        :src="siteSettingsForm.siteLogo"
        putImageType="image/webp"
        @crop="setSiteLogo"
      ></Cropper>
    </el-form-item>
    <!-- siteFavicon -->
    <el-form-item label="站点图标" prop="siteFavicon">
      <Cropper
        :aspectRatio="256 / 256"
        :width="256"
        :height="256"
        :src="siteSettingsForm.siteFavicon"
        putImageType="image/png"
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
        :precision="0"
      ></el-input-number
      ><span class="pl10">条内容</span>
    </el-form-item>
    <!-- 站点地图 -->
    <el-form-item label="站点地图" prop="siteEnableSitemap">
      <el-switch v-model="siteSettingsForm.siteEnableSitemap"></el-switch>
    </el-form-item>
    <!-- 底部显示站点地图 -->
    <el-form-item label="底部显示站点地图" prop="siteShowSitemapInFooter">
      <el-switch v-model="siteSettingsForm.siteShowSitemapInFooter"></el-switch>
    </el-form-item>
    <el-form-item label="轮播图切换时间" prop="siteTopSlideTime">
      <!-- 数字 1000-10000 -->
      <el-input-number
        v-model="siteSettingsForm.siteTopSlideTime"
        controls-position="right"
        :min="100"
        :step="100"
        :precision="0"
      ></el-input-number
      ><span class="pl10">毫秒</span>
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
    <!-- 页面底部信息 -->
    <el-form-item label="页面底部信息" prop="siteFooterInfo">
      <el-input
        type="textarea"
        v-model="siteSettingsForm.siteFooterInfo"
        :rows="6"
        placeholder="显示在页面底部，可以填写备案信息，支持HTML。"
      ></el-input>
    </el-form-item>
    <!-- siteExtraCss -->
    <el-form-item label="额外CSS样式" prop="siteExtraCss">
      <el-input
        type="textarea"
        v-model="siteSettingsForm.siteExtraCss"
        :rows="6"
        placeholder="自定义CSS样式，会插入到head标签内，覆盖时可能需要添加!important。"
      ></el-input>
    </el-form-item>
    <!-- Gravatar头像图源 -->
    <el-form-item label="Gravatar头像图源" prop="siteGravatarSource">
      <el-input
        v-model="siteSettingsForm.siteGravatarSource"
        @blur="onGravatarSourceBlur"
      ></el-input>
      <div>
        ※Gravatar头像图源，例如：<span class="word-break"
          >https://www.gravatar.com/avatar</span
        >
      </div>
    </el-form-item>
    <!-- 页面加载动画 -->
    <el-form-item label="页面加载动画" prop="siteShowLoading">
      <el-switch v-model="siteSettingsForm.siteShowLoading"></el-switch>
    </el-form-item>
    <!-- 加载动画文案 -->
    <el-form-item label="加载动画文案" prop="siteShowLoadingText">
      <el-input v-model="siteSettingsForm.siteShowLoadingText"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="siteSettingsSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { formatResToForm, formatResToObj } from '@/utils/utils'
import { ref, reactive, onMounted } from 'vue'
import { authApi } from '@/api'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import RichEditor5Switch from '@/components/RichEditor5Switch'
export default {
  components: {
    RichEditor5Switch,
  },
  setup(props, { emit }) {
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
      // 顶部幻灯片切换时间
      siteTopSlideTime: 8000,
      // 你所在时区
      siteTimeZone: '',
      // 页面底部信息
      siteFooterInfo: '',
      // 额外CSS样式
      siteExtraCss: '',
      // 显示站点地图
      siteEnableSitemap: false,
      // 底部站点地图
      siteShowSitemapInFooter: false,
      // Gravatar头像图源
      siteGravatarSource: '',
      // 页面加载动画
      siteShowLoading: true,
      // 加载动画文案
      siteShowLoadingText: '',
    })
    const onSiteUrlBlur = () => {
      // 去掉最末尾的斜杠
      siteSettingsForm.siteUrl = siteSettingsForm.siteUrl.replace(/\/$/, '')
    }
    const onGravatarSourceBlur = () => {
      // 去掉最末尾的斜杠
      siteSettingsForm.siteGravatarSource =
        siteSettingsForm.siteGravatarSource.replace(/\/$/, '')
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
      siteUrl: [
        { required: true, message: '请输入站点地址', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (!value.startsWith('http://') && !value.startsWith('https://')) {
              callback(new Error('站点地址必须以 http:// 或 https:// 开头'))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ],
      sitePageSize: [
        { required: true, message: '请输入每页显示', trigger: 'blur' },
      ],
      siteTopSlideTime: [
        { required: true, message: '请输入轮播图切换时间', trigger: 'blur' },
      ],
      siteTimeZone: [
        { required: true, message: '请选择你所在时区', trigger: 'blur' },
      ],
    }
    const setSiteLogo = (crop) => {
      // file to base64
      siteSettingsForm.siteLogo = crop
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
              emit('submitSuccess')
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

    const inited = ref(false)
    const getOptionList = () => {
      // 将siteSettingsForm的key转换为数组
      const params = {
        nameList: [],
      }
      Object.keys(siteSettingsForm).forEach((key) => {
        params.nameList.push(key)
      })
      authApi
        .getOptionList(params)
        .then((res) => {
          // res.data.data是数组，需要转换为对象
          const obj = formatResToObj(res.data.data)
          formatResToForm(siteSettingsForm, obj)
        })
        .finally(() => {
          inited.value = true
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
      siteSettingsFormRef,
      siteSettingsForm,
      siteSettingsRules,
      setSiteLogo,
      setSiteDefaultCover,
      setSiteFavicon,
      siteSettingsSubmit,
      onSiteUrlBlur,
      onGravatarSourceBlur,
      inited,
      timeZones,
    }
  },
}
</script>
<style lang=""></style>
