<template>
  <div class="common-right-panel-form">
    <div class="pb20">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ name: 'PostList' }"
          >文章列表</el-breadcrumb-item
        >
        <el-breadcrumb-item>编辑{{ typeTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div v-if="type">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <template v-if="type === 2">
          <!-- 推文不需要标题 -->
        </template>
        <template v-else>
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题"></el-input>
          </el-form-item>
        </template>
        <template v-if="type === 2">
          <!-- 内容 textarea -->
          <el-form-item label="推文" prop="title">
            <el-input
              type="textarea"
              v-model="form.excerpt"
              rows="10"
              placeholder="请输入推文"
            ></el-input>
          </el-form-item>
        </template>
        <template v-else>
          <!-- 富文本内容 -->
          <el-form-item label="文章内容" prop="content">
            <el-tabs
              v-model="contentTab"
              @tab-change="contentTabChange"
              type="border-card"
              class="w_10 post-editor-body"
            >
              <el-tab-pane label="富文本" name="richText">
                <RichEditor4
                  v-model:content="form.content"
                  ref="editor4Ref"
                  v-if="postEditorVersion === 4"
                />
                <RichEditor5
                  v-model:content="form.content"
                  v-else-if="postEditorVersion === 5"
                />
              </el-tab-pane>
              <el-tab-pane label="源代码" name="sourceCode">
                <el-input
                  type="textarea"
                  v-model="contentSource"
                  rows="30"
                  @blur="resetRichEditor"
                  placeholder="请输入源代码"
                ></el-input>
              </el-tab-pane>
            </el-tabs>
            <div class="mt10 w_10 old-content-body" v-if="oldPostEditorContent">
              <div class="fb">旧编辑器内容（刷新后删除）：</div>
              <div v-html="oldPostEditorContent"></div>
            </div>
            <div class="mt10" v-if="postEditorVersion < 5">
              <!-- 升级按钮 -->
              <el-button
                type="danger"
                @click="updatePostEditorVersion"
                class="mb10"
                >清空内容并升级编辑器版本</el-button
              >
            </div>
          </el-form-item>

          <!-- 摘要 -->
          <el-form-item label="摘要" prop="excerpt">
            <el-input
              type="textarea"
              v-model="form.excerpt"
              rows="5"
              placeholder="请输入摘要"
            ></el-input>
          </el-form-item>
          <!-- 插入code -->
          <el-form-item label="插入code" prop="code">
            <el-input
              type="textarea"
              v-model="form.code"
              rows="5"
              placeholder="请输入插入code"
            ></el-input>
          </el-form-item>
        </template>
        <!-- coverImages 选择封面图 -->
        <el-form-item
          label="文章图片"
          prop="coverImages"
          class="blok-form-item"
        >
          <div class="clearfix">
            <draggable
              class="fl"
              v-model="coverImagesDataList"
              group="attachments"
              @start="attachmentDrag = true"
              @end="attachmentDrag = false"
              item-key="_id"
            >
              <template #item="{ element, index }">
                <div class="post-cover-image-item">
                  <el-image
                    :src="element.thumfor || element.filepath"
                    fit="contain"
                    :preview-src-list="[element.filepath]"
                    :preview-teleported="true"
                    style="width: 100%; height: 100%"
                  />
                  <!-- 删除按钮 -->
                  <div
                    class="post-cover-image-item-delete"
                    @click="form.coverImages.splice(index, 1)"
                  >
                    <el-icon><Close /></el-icon>
                  </div>
                </div>
              </template>
            </draggable>
            <div
              class="post-cover-image-item type-add"
              @click="openAttachmentsDialog"
              v-show="form.coverImages.length < maxCoverLength"
            >
              <div class="dflex flexCenter w_10 full-height">
                <el-icon size="32px"><Plus /></el-icon>
              </div>
            </div>
          </div>
          <div v-if="coverImagesDataList.length > 1">※可以拖动改变顺序</div>
        </el-form-item>
        <!-- 分类 -->
        <el-form-item label="分类" prop="sort">
          <el-select v-model="form.sort" placeholder="请选择分类">
            <el-option
              v-for="item in sortList"
              :key="item._id"
              :label="item.sortname"
              :value="item._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- tags -->
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            remote
            :remote-method="queryTags"
            default-first-option
            :reserve-keyword="false"
            :loading="tagsIsLoading"
            placeholder="请选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="item in tagList"
              :key="item._id"
              :label="item.tagname"
              :value="item._id"
            >
              <template v-if="item.isNew">
                {{ `创建新标签「${item.tagname}」` }}
              </template>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 文章别名 -->
        <el-form-item label="文章别名" prop="alias">
          <el-input
            v-model="form.alias"
            placeholder="请输入文章别名（用于别名访问）"
          ></el-input>
        </el-form-item>
        <!-- 模板选择 -->
        <el-form-item label="模板选择" prop="template" v-if="type === 3">
          <el-select v-model="form.template" clearable placeholder="请选择模板">
            <el-option
              v-for="item in templateList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 发布时间 -->
        <el-form-item label="发布时间" prop="date">
          <el-date-picker
            v-model="form.date"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <!-- 允许评论 -->
        <el-form-item label="允许评论" prop="allowRemark">
          <el-switch v-model="form.allowRemark"></el-switch>
        </el-form-item>
        <!-- 是否置顶 -->
        <el-form-item label="是否置顶" prop="top">
          <el-switch v-model="form.top"></el-switch>
        </el-form-item>
        <!-- 分类置顶 -->
        <el-form-item label="分类置顶" prop="sortop">
          <el-switch v-model="form.sortop"></el-switch>
        </el-form-item>
        <!-- 状态 -->
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">发布</el-radio>
            <!-- <el-radio :label="99">回收站</el-radio> -->
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
    <AttachmentsDialog
      :shouldSelectOk="true"
      ref="attachmentsDialogRef"
      :selectLimit="maxCoverLength - form.coverImages.length"
      @selectAttachments="selectAttachments"
    />
  </div>
</template>
<script>
import {
  onMounted,
  ref,
  reactive,
  watch,
  computed,
  onUnmounted,
  nextTick,
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import AttachmentsDialog from '@/components/AttachmentsDialog'
import RichEditor4 from '@/components/RichEditor4'
import RichEditor5 from '@/components/RichEditor5'
import draggable from 'vuedraggable'

export default {
  components: {
    AttachmentsDialog,
    RichEditor4,
    RichEditor5,
    draggable,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const id = ref(route.params.id)
    const type = ref(null)
    const postEditorVersion = ref(null)
    const contentTab = ref('richText')
    const typeTitle = computed(() => {
      switch (type.value) {
        case 1:
          return '博客'
        case 2:
          return '推文'
        case 3:
          return '页面'
        default:
          return ''
      }
    })
    const maxCoverLength = computed(() => {
      if (type.value === 2) {
        return 9999
      }
      return 1
    })
    let isIniting = ref(true)
    const getPostDetail = () => {
      authApi
        .getPostDetail({ id: id.value })
        .then((res) => {
          Object.keys(form).forEach((key) => {
            switch (key) {
              case 'date':
                if (res.data.data[key]) {
                  form[key] = new Date(res.data.data[key])
                }
                break
              case 'sort':
                form[key] = res.data.data[key]?._id || null
                break
              case 'tags':
                form[key] = res.data.data[key].map((item) => item._id)
                tagList.value = res.data.data[key]
                break
              case 'coverImages':
                form[key] = res.data.data[key].map((item) => item._id)
                res.data.data[key].forEach((item) => {
                  coverImageListObj[item._id] = item
                })
                break

              default:
                form[key] = res.data.data[key]
                break
            }
          })
          type.value = res.data.data.type
          // 旧文章采用v4富文本编辑器，新文章采用v5富文本编辑器
          postEditorVersion.value = res.data.data.editorVersion || 5
          form.id = res.data.data._id
        })
        .catch((err) => {
          console.error(err)
          // 获取http code
          const code = err.response?.status
          if (code === 404) {
            // 弹窗alert提示不存在，点击确定后返回列表页
            ElMessageBox.alert('该文章不存在', '提示', {
              confirmButtonText: '确定',
              callback: () => {
                router.push({
                  name: 'PostList',
                })
              },
            })
          }
        })
        .finally(() => {
          isIniting.value = false
        })
    }

    const form = reactive({
      // - title	标题字段
      // - date	日期字段
      // - content	内容字段
      // - excerpt	摘要字段
      // - alias	别名字段
      // - sort	分类
      // - type	类型：1blog,2tweet,3page
      // - tags	标签字段[]

      // - top	是否置顶字段
      // - sortop	是否排序置顶字段
      // - status	状态字段：0草稿，1发布，99回收站
      // - allowRemark	是否允许评论字段
      // - template	模板字段
      // - code	文章插入的Code字段
      // - coverImages  博客时是封面图片字段，页面时是页面图片字段
      title: '',
      date: null,
      content: '',
      excerpt: '',
      alias: '',
      sort: null,
      type: null,
      tags: [],
      top: false,
      sortop: false,
      status: 0,
      allowRemark: false,
      template: '',
      code: '',
      coverImages: [],
      __v: null,
      id: null,
    })

    const rules = reactive({})
    const formRef = ref(null)
    const submit = () => {
      authApi.updatePost(form).then(() => {
        // 成功消息
        ElMessage.success('保存成功')
        router.push({
          name: 'PostList',
        })
      })
    }
    const contentSource = ref('')
    const contentTabChange = (tab) => {
      if (tab === 'richText') {
        resetRichEditor()
      } else {
        contentSource.value = form.content
      }
    }
    const editor4Ref = ref(null)
    const resetRichEditor = () => {
      form.content = contentSource.value
      nextTick(() => {
        if (postEditorVersion.value === 4 && editor4Ref.value) {
          editor4Ref.value.resetContent()
        }
      })
    }

    // tags
    const tagList = ref([])
    const tagsIsLoading = ref(false)
    const getTagList = (tagKeyword = null) => {
      if (tagsIsLoading.value) {
        return
      }
      tagsIsLoading.value = true
      authApi
        .getTagList({ keyword: tagKeyword, size: 10, page: 1 }, true)
        .then((res) => {
          const list = res.data.list
          if (tagKeyword) {
            // 如果tagkeyword没有在list里面，就把tagkeyword push到list里面
            const hasTagKeyword = list.some(
              (item) => item.tagname === tagKeyword
            )
            if (!hasTagKeyword) {
              list.push({
                _id: tagKeyword,
                tagname: tagKeyword,
                isNew: true,
              })
            }
          }
          tagList.value = res.data.list
        })
        .finally(() => {
          tagsIsLoading.value = false
        })
    }
    let queryTagsTimer = null
    const queryTags = (query) => {
      if (queryTagsTimer) {
        clearTimeout(queryTagsTimer)
      }
      queryTagsTimer = setTimeout(() => {
        getTagList(query)
      }, 50)
    }
    const updateTagLastUseTime = (newTagIdList, oldTagIdList) => {
      // 对比newTagIdList对比oldTagIdList，多了哪些ID
      const addTagIdList = newTagIdList.filter(
        (item) => !oldTagIdList.includes(item)
      )
      // 从addTagIdList中筛选出mongodbId格式的数据，用正则
      const addTagMongoIdList = addTagIdList.filter((item) => {
        const reg = /^[0-9a-fA-F]{24}$/
        return reg.test(item)
      })
      // 遍历addTagMongoIdList，把这些ID的tag的lastUseTime更新为当前时间
      addTagMongoIdList.forEach((id) => {
        authApi.updateTagLastUseTime({ id })
      })
    }
    // watch form.tags
    watch(
      () => form.tags,
      (newVal, oldVal) => {
        if (!isIniting.value) {
          updateTagLastUseTime(newVal, oldVal)
        }
      }
    )
    // sorts
    const sortList = ref([])
    const getSortList = () => {
      authApi.getSortList().then((res) => {
        const list = res.data.data
        // 循环list，查找里面有没有children，如果有，就把children里面的sortname前面加上'--',然后把children push到newlist里面
        const newlist = []
        list.forEach((item) => {
          newlist.push(item)
          if (item.children && item.children.length) {
            item.children.forEach((child) => {
              child.sortname = '└─ ' + child.sortname
            })
            newlist.push(...item.children)
          }
        })
        sortList.value = newlist
      })
    }

    // attachments
    const attachmentsDialogRef = ref(null)
    const coverImageListObj = reactive({})
    const openAttachmentsDialog = () => {
      attachmentsDialogRef.value.open()
    }
    const selectAttachments = (attachments) => {
      console.log(attachments)
      attachments.forEach((item) => {
        coverImageListObj[item._id] = item
        form.coverImages.push(item._id)
      })
    }
    const getAttachmentById = (id) => {
      const data = coverImageListObj[id]
      return data
    }
    const coverImagesDataList = computed({
      get() {
        const list = []
        const coverImages = form.coverImages
        coverImages.forEach((id) => {
          const data = getAttachmentById(id)
          if (data) {
            list.push(data)
          }
        })
        return list
      },
      set(val) {
        form.coverImages = val.map((item) => item._id)
      },
    })
    const attachmentDrag = ref(false)
    // template
    // 模板选项 about:关于页面, link: 友情链接页面, almanac:程序员老黄历, bangumi:追番
    const templateList = ref([
      {
        label: '关于',
        value: 'about',
      },
      {
        label: '友情链接',
        value: 'link',
      },
      {
        label: '程序员老黄历',
        value: 'almanac',
      },
      {
        label: '追番',
        value: 'bangumi',
      },
    ])

    // auto save
    let autoSaveError = false

    const autoSave = () => {
      // 如果是草稿状态，就自动保存
      if (form.status === 0 && !autoSaveError) {
        authApi
          .updatePost(form, true)
          .then((res) => {
            // 成功消息
            form.__v = form.__v + 1
          })
          .catch(() => {
            autoSaveError = true
          })
      }
    }

    let autoSaveTimer = null
    const setAutoSaveTimer = () => {
      autoSaveTimer = setInterval(() => {
        autoSave()
      }, 1000 * 60 * 2)
    }

    // 升级编辑器版本
    const oldPostEditorContent = ref(null)
    const updatePostEditorVersion = () => {
      ElMessageBox.confirm(
        '升级编辑器版本后，富文本编辑器的内容将会被清空，确定要升级吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          authApi
            .updatePostEditorVersion({ id: form.id, __v: form.__v })
            .then(() => {
              oldPostEditorContent.value = form.content
              ElMessage.success('升级成功')
              getPostDetail()
            })
        })
        .catch(() => {})
    }

    onMounted(() => {
      getPostDetail()
      getTagList()
      getSortList()
      setAutoSaveTimer()
    })
    onUnmounted(() => {
      clearInterval(autoSaveTimer)
    })
    return {
      type,
      postEditorVersion,
      contentTab,
      typeTitle,
      maxCoverLength,
      // form
      form,
      rules,
      formRef,
      submit,
      contentSource,
      contentTabChange,
      editor4Ref,
      resetRichEditor,
      // tags
      tagList,
      tagsIsLoading,
      queryTags,
      // sorts
      sortList,
      // attachments
      attachmentsDialogRef,
      coverImageListObj,
      openAttachmentsDialog,
      selectAttachments,
      coverImagesDataList,
      attachmentDrag,
      // template
      templateList,
      // 升级编辑器版本
      oldPostEditorContent,
      updatePostEditorVersion,
    }
  },
}
</script>
<style scoped>
.post-cover-image-item {
  width: 100px;
  height: 100px;
  border: 1px solid #ccc;
  color: #ccc;
  margin-right: 3px;
  margin-bottom: 3px;
  float: left;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
}
.post-cover-image-item-delete {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  font-size: 14px;
  text-align: center;
  color: #f56c6c;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.85);
}
.post-cover-image-item.type-add {
  border: 1px dashed #ccc;
}
.old-content-body {
  border: 1px solid #dcdfe6;
  padding: 10px;
}
</style>
<style>
.post-editor-body .el-tabs__content {
  overflow: visible;
  z-index: 1;
}
.old-content-body img {
  max-width: 100%;
}
</style>
