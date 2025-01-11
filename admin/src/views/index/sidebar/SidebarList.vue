<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>侧边栏</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="clearfix pb20">
      <div class="fl common-top-search-form-body"></div>
      <div class="fr">
        <!-- 按钮用 -->
        <!-- 排序 -->
        <el-button @click="onDragBtnClick" class="mr10">{{
          canDrag ? '完成排序' : '排序'
        }}</el-button>
        <!-- 追加 -->
        <el-dropdown trigger="click" @command="handleSideBarCommand">
          <el-button type="primary">
            追加<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 用typeOptions v-for -->
              <el-dropdown-item
                v-for="(item, index) in sidebarSettingsTemplate"
                :key="item.type"
                :command="item.type"
                >{{ item.title }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!-- 侧边栏 -->
    <div class="mb20" v-if="sidebarSettingsForm.length > 0">
      <draggable
        v-model="sidebarSettingsForm"
        group="sidebarSettings"
        item-key="_id"
        handle=".handle"
      >
        <template #item="{ element }">
          <div>
            <div class="config-border-item">
              <div
                class="config-border-item-title clearfix"
                :class="{ handle: canDrag }"
              >
                <div class="fl pr10">
                  <!-- up-down-left-right -->
                  <i class="fas fa-arrows-alt-v" v-show="canDrag"></i>
                  <span class="pl5 dib">{{ element.title }}</span>
                </div>

                <!--  tag {{ element.status === 0? '不显示':'显示' }} -->
                <el-tag v-if="element.status === 1" type="success" class="fl"
                  >显示</el-tag
                >
                <el-tag
                  v-else-if="element.status === 0"
                  type="danger"
                  class="fl"
                  >不显示</el-tag
                >
                <!-- 展开按钮 -->
                <el-button
                  size="small"
                  text
                  class="fr ml10"
                  @click="
                    showIdList.includes(element._id)
                      ? showIdList.splice(showIdList.indexOf(element._id), 1)
                      : showIdList.push(element._id)
                  "
                  >{{
                    showIdList.includes(element._id) ? '收起' : '展开'
                  }}</el-button
                >
                <el-button
                  type="danger"
                  size="small"
                  class="fr"
                  @click="sidebarSettingsDelete(element)"
                  >删除</el-button
                >
              </div>
              <el-form
                :model="element"
                label-width="120px"
                label-position="left"
                v-if="showIdList.includes(element._id)"
              >
                <!-- title -->
                <el-form-item label="标题" prop="title">
                  <el-input v-model="element.title"></el-input>
                </el-form-item>
                <!-- content -->
                <el-form-item
                  label="内容"
                  prop="content"
                  v-if="showConetntTypeList.includes(element.type)"
                >
                  <RichEditor5 v-model:content="element.content" />
                </el-form-item>
                <!-- showTextInputTypeList -->
                <el-form-item
                  label="内容"
                  prop="content"
                  v-if="showTextInputTypeList.includes(element.type)"
                >
                  <el-input
                    v-model="element.content"
                    :placeholder="placeholderMap[element.type]"
                  ></el-input>
                </el-form-item>
                <!-- showTextareaTypeList -->
                <el-form-item
                  label="内容"
                  prop="content"
                  v-if="showTextareaTypeList.includes(element.type)"
                >
                  <el-input
                    type="textarea"
                    v-model="element.content"
                    :rows="8"
                    :placeholder="placeholderMap[element.type]"
                  ></el-input>
                </el-form-item>
                <el-form-item
                  label="显示条数"
                  prop="count"
                  v-if="showCountTypeList.includes(element.type)"
                >
                  <!-- 数字 1-100 -->
                  <el-input-number
                    v-model="element.count"
                    controls-position="right"
                    :min="1"
                    :max="100"
                    :step="1"
                    :precision="0"
                  ></el-input-number>
                </el-form-item>
                <el-form-item
                  label="参数"
                  prop="content"
                  v-if="element.type === 10"
                >
                  <GoogleAdInput v-model="element.content" />
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
                    @click="sidebarSettingsSubmit(element)"
                    >提交更改</el-button
                  >
                </div>
              </el-form>
            </div>
          </div>
        </template>
      </draggable>
      <!-- 提交按钮 -->
      <!-- <div class="mt10 clearfix">
        <el-button type="primary" class="fr" @click="sidebarSettingsSubmit"
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import RichEditor5 from '@/components/RichEditor5'
import GoogleAdInput from '@/components/GoogleAdInput'
import { escapeHtml } from '@/utils/utils'
import CheckDialogService from '@/services/CheckDialogService'

export default {
  components: {
    RichEditor5,
    draggable,
    GoogleAdInput,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    // 侧边栏设置
    const sidebarSettingsFormRef = ref(null)
    const sidebarSettingsForm = ref([])
    const sidebarSettingsTemplate = computed(() => {
      const base = [
        // 1:自定义内容 3:最新评论 4:随机标签 5:随机文章 7:搜索 8:分类 9:归档 10:谷歌广告 11:自定义HTML 12:热门文章
        {
          title: '自定义内容',
          content: '',
          count: 1,
          type: 1,
          taxis: 0,
          status: 0,
        },
        // 自定义HTML
        {
          title: '自定义HTML',
          content: '',
          count: 1,
          type: 11,
          taxis: 0,
          status: 0,
        },
        // 谷歌广告
        {
          title: '谷歌广告',
          content: '',
          count: 1,
          type: 10,
          taxis: 0,
          status: 0,
        },
      ]
      const only1 = [
        {
          title: '最新评论',
          content: '',
          count: 10,
          type: 3,
          taxis: 0,
          status: 0,
        },
        {
          title: '随机标签',
          content: '',
          count: 10,
          type: 4,
          taxis: 0,
          status: 0,
        },
        // {
        //   title: '随机文章',
        //   content: '',
        //   count: 10,
        //   type: 5,
        //   taxis: 0,
        //   status: 0,
        // },
        // {
        //   title: '相册',
        //   content: '',
        //   count: 10,
        //   type: 6,
        //   taxis: 0,
        //   status: 0,
        // },
        // {
        //   title: '搜索',
        //   content: '',
        //   count: 1,
        //   type: 7,
        //   taxis: 0,
        //   status: 0,
        // },
        {
          title: '分类',
          content: '',
          count: 1,
          type: 8,
          taxis: 0,
          status: 0,
        },
        {
          title: '归档',
          content: '',
          count: 1,
          type: 9,
          taxis: 0,
          status: 0,
        },
        // 热门文章
        {
          title: '热门文章',
          content: '',
          count: 5,
          type: 12,
          taxis: 0,
          status: 0,
        },
      ]
      // 检查 sidebarSettingsForm 里存在的 type，如果存在，只输出sidebarSettingsForm中没有的type
      const typeList = sidebarSettingsForm.value.map((item) => item.type)
      const result = only1.filter((item) => !typeList.includes(item.type))
      return base.concat(result)
    })

    const showConetntTypeList = [1]
    const showCountTypeList = [2, 3, 4, 5, 6, 12]
    const showTextInputTypeList = []
    const showTextareaTypeList = [11]

    const placeholderMap = {
      10: '填写格式为：ad-slot,ad-format,ad-layout-key',
      11: '填写可信任的HTML代码，注意代码安全！',
    }

    const getSidebarList = () => {
      authApi.getSidebarList().then((res) => {
        sidebarSettingsForm.value = res.data.list
      })
    }
    const handleSideBarCommand = (command) => {
      const item = sidebarSettingsTemplate.value.find(
        (item) => item.type === command
      )
      authApi
        .createSidebar(item)
        .then((res) => {
          // 在前面插入
          sidebarSettingsForm.value.unshift(res.data.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const sidebarSettingsSubmit = (item) => {
      authApi
        .updateSidebar(item)
        .then((res) => {
          ElMessage.success('更新成功')
        })
        .catch((err) => {
          console.log(err)
        })
    }
    const sidebarSettingsDelete = (row) => {
      // 询问是否删除
      const id = row._id
      const title = escapeHtml(row.title) || '未定义标题'

      CheckDialogService.open({
        correctAnswer: '是',
        content: `此操作将<span class="cRed">永久删除侧边栏设置：【${title}】</span>, 是否继续?`,
        success: () => {
          return authApi.deleteSidebar({ id }).then(() => {
            ElMessage.success('删除成功')
            sidebarSettingsForm.value = sidebarSettingsForm.value.filter(
              (item) => item._id !== id
            )
          })
        },
      })
        .then(() => {})
        .catch((error) => {
          console.log('Dialog closed:', error)
        })
    }

    const showIdList = ref([])

    const canDrag = ref(false)
    const onDragBtnClick = () => {
      if (canDrag.value) {
        const params = sidebarSettingsForm.value.map((item, index) => {
          return {
            _id: item._id,
            taxis: index,
          }
        })
        updateSidebarTaxis({
          sidebarList: params,
        }).then((res) => {
          canDrag.value = false
          getSidebarList()
        })
      } else {
        canDrag.value = true
      }
    }
    const updateSidebarTaxis = (params) => {
      return authApi.updateSidebarTaxis(params).then((res) => {
        ElMessage.success('更新成功')
      })
    }

    onMounted(() => {
      getSidebarList()
    })
    return {
      // 侧边栏设置
      sidebarSettingsFormRef,
      sidebarSettingsForm,
      sidebarSettingsTemplate,
      showConetntTypeList,
      showCountTypeList,
      showTextInputTypeList,
      showTextareaTypeList,
      placeholderMap,
      handleSideBarCommand,
      sidebarSettingsSubmit,
      sidebarSettingsDelete,
      showIdList,
      canDrag,
      onDragBtnClick,
    }
  },
}
</script>
<style scoped>
.handle {
  cursor: move;
}
</style>
