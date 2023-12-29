<template>
  <div class="common-right-panel-form banner-list-body">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>横幅</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body"></div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 排序 -->
        <el-button @click="onDragBtnClick">{{
          canDrag ? '完成排序' : '排序'
        }}</el-button>
        <!-- 追加 -->
        <el-button type="primary" @click="handleBanner">追加</el-button>
      </div>
    </div>
    <!-- 横幅 -->
    <div class="mb20" v-if="bannerSettingsForm.length > 0">
      <draggable
        v-model="bannerSettingsForm"
        group="bannerSettings"
        item-key="_id"
        handle=".handle"
      >
        <template #item="{ element }">
          <div>
            <div class="config-border-item">
              <div
                class="config-border-item-title clearfix"
                :class="{ handle: canDrag }"
                v-show="canDrag"
              >
                <div class="fl pr10">
                  <!-- up-down-left-right -->
                  <i class="fas fa-arrows-alt-v"></i>
                  <span class="pl5 dib">拖动排序</span>
                </div>
              </div>
              <el-row :gutter="10">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                  <div>
                    <!-- 图片 -->
                    <div class="banner-image-body">
                      <div>
                        <!-- 添加图片按钮 -->
                        <Cropper
                          :aspectRatio="880 / 350"
                          :width="880"
                          :height="350"
                          :src="element.img"
                          @crop="(crop) => setBanner(crop, element)"
                        ></Cropper>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                  <el-form
                    :model="element"
                    label-width="120px"
                    label-position="left"
                    class="pt20"
                  >
                    <!-- title -->
                    <el-form-item label="标题" prop="title">
                      <el-input v-model="element.title"></el-input>
                    </el-form-item>
                    <!-- 链接 link-->
                    <el-form-item label="链接" prop="link">
                      <el-input v-model="element.link"></el-input>
                    </el-form-item>
                    <!-- 是否本站 isdefault -->
                    <el-form-item label="本站" prop="isdefault">
                      <!-- 0不是 1是 -->
                      <el-switch v-model="element.isdefault"></el-switch>
                    </el-form-item>
                    <!-- 是否新窗口 newtab -->
                    <el-form-item label="新窗口" prop="newtab">
                      <!-- 0不是 1是 -->
                      <el-switch v-model="element.newtab"></el-switch>
                    </el-form-item>
                    <el-form-item label="状态" prop="status">
                      <!-- 0显示 1不显示 -->
                      <el-switch
                        v-model="element.status"
                        :active-value="1"
                        :inactive-value="0"
                      ></el-switch>
                    </el-form-item>
                    <!-- 提交按钮 -->
                    <div class="mt10 clearfix">
                      <el-button
                        type="primary"
                        class="fr"
                        @click="bannerSettingsSubmit(element)"
                        >提交更改</el-button
                      >
                      <el-button
                        type="danger"
                        class="fr mr10"
                        @click="bannerSettingsDelete(element._id)"
                        >删除</el-button
                      >
                    </div>
                  </el-form>
                </el-col>
              </el-row>
            </div>
          </div>
        </template>
      </draggable>
      <!-- 提交按钮 -->
      <!-- <div class="mt10 clearfix">
        <el-button type="primary" class="fr" @click="bannerSettingsSubmit"
          >提交更改</el-button
        >
      </div> -->
    </div>
    <div class="mt30" v-else><el-empty description="暂无数据" /></div>
  </div>
</template>
<script>
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import RichEditor5 from '@/components/RichEditor5'
import Cropper from '@/components/Cropper'

export default {
  components: {
    RichEditor5,
    draggable,
    Cropper,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    // 横幅设置
    const bannerSettingsFormRef = ref(null)
    const bannerSettingsForm = ref([])

    const getBannerList = () => {
      authApi.getBannerList().then((res) => {
        bannerSettingsForm.value = res.data.list
      })
    }
    const handleBanner = () => {
      authApi
        .createBanner({})
        .then((res) => {
          // 在前面插入
          bannerSettingsForm.value.unshift(res.data.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const bannerSettingsSubmit = (item) => {
      authApi
        .updateBanner(item)
        .then((res) => {
          ElMessage.success('更新成功')
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const bannerSettingsDelete = (id) => {
      // 询问是否删除
      ElMessageBox.confirm('此操作将永久删除该横幅设置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 删除
          authApi.deleteBanner({ id: id }).then((res) => {
            bannerSettingsForm.value = bannerSettingsForm.value.filter(
              (item) => item._id !== id
            )
          })
        })
        .catch(() => {})
    }

    const showIdList = ref([])

    const canDrag = ref(false)
    const onDragBtnClick = () => {
      if (canDrag.value) {
        const params = bannerSettingsForm.value.map((item, index) => {
          return {
            _id: item._id,
            taxis: index,
          }
        })
        updateBannerTaxis({
          bannerList: params,
        }).then((res) => {
          canDrag.value = false
          getBannerList()
        })
      } else {
        canDrag.value = true
      }
    }
    const updateBannerTaxis = (params) => {
      return authApi.updateBannerTaxis(params).then((res) => {
        ElMessage.success('更新成功')
      })
    }

    const setBanner = (crop, element) => {
      authApi
        .updateBannerImg({
          _id: element._id,
          img: crop,
        })
        .then((res) => {
          // 更新图片
          element.img = res.data.data.img
        })
        .catch((err) => {
          console.log(err)
        })
    }

    onMounted(() => {
      getBannerList()
    })
    return {
      // 横幅设置
      bannerSettingsFormRef,
      bannerSettingsForm,
      handleBanner,
      bannerSettingsSubmit,
      bannerSettingsDelete,
      showIdList,
      canDrag,
      onDragBtnClick,
      setBanner,
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
.handle {
  cursor: move;
}
.banner-image-body {
  max-width: 600px;
}
</style>
<style>
.banner-list-body .el-upload--text .avatar {
  width: 100%;
  height: auto;
}
</style>
