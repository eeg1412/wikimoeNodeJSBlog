<template>
  <el-dialog
    v-model="showDialog"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    :title="title"
  >
    <div v-if="form.step === 1">
      <p>
        确认删除管理员 <b>{{ username }}</b> 吗？
      </p>
      <p class="cRed">删除后，管理员的所有数据将被清除，不可恢复。</p>
      <p>
        请在下方输入用户名 <b>{{ username }}</b> 确认删除。
      </p>
      <div class="mt10">
        <!-- 输入用户名 -->
        <el-input
          v-model="form.username"
          placeholder="请输入要删除的用户名"
        ></el-input>
      </div>
    </div>
    <div v-if="form.step === 2">
      <p>
        管理员 <b>{{ username }}</b> 的文章和评论要如何处理？
      </p>
      <div class="mt10">
        <el-radio-group v-model="form.changeType">
          <el-radio label="0">删除</el-radio>
          <el-radio label="1">转移给</el-radio>
        </el-radio-group>
        <el-select
          v-model="form.toUserId"
          filterable
          remote
          :remote-method="queryUsers"
          :automatic-dropdown="true"
          default-first-option
          :reserve-keyword="false"
          :loading="userIsLoading"
          placeholder="请选择管理员"
          style="width: 100%"
          @change="changeToUser"
          v-if="form.changeType === '1'"
        >
          <el-option
            v-for="item in userList"
            :key="item._id"
            :label="`${item.username}-${item.nickname}`"
            :value="item._id"
            :disabled="item._id === id"
          ></el-option>
        </el-select>
      </div>
    </div>
    <div v-if="form.step === 3">
      <p>请再次确认以下操作</p>
      <p>
        管理员 <b>{{ username }}</b> 的文章和评论将被
        <span v-if="form.changeType === '0'">删除</span>
        <span v-else
          >转移给管理员
          <b>{{
            userData ? `${userData.username}-${userData.nickname}` : ''
          }}</b></span
        >
        ，是否执行删除？
      </p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="toBack" v-if="form.step === 3">返回修改 </el-button>
        <el-button type="primary" @click="toNext" v-if="form.step < 3"
          >下一步
        </el-button>
        <el-button type="danger" @click="submit" v-else>确认删除 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { computed, reactive, ref, watch } from 'vue'
import { authApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: '',
    },
  },
  emits: ['update:show', 'deleteSuccess'],
  setup(props, { emit }) {
    const showDialog = computed({
      get() {
        return props.show
      },
      set(val) {
        emit('update:show', val)
      },
    })

    const submit = () => {
      if (form.step === 3) {
        authApi
          .deleteUser({
            id: props.id,
            changeType: form.changeType,
            toUserId: form.toUserId,
          })
          .then(() => {
            ElMessage.success('删除成功')
            emit('update:show', false)
            emit('deleteSuccess')
          })
          .catch(() => {
            ElMessage.error('删除失败')
          })
      }
    }

    const form = reactive({
      step: 1,
      username: '',
      changeType: null,
      toUserId: null,
    })

    const resetForm = () => {
      form.step = 1
      form.username = ''
      form.changeType = null
      form.toUserId = null
    }

    const title = computed(() => {
      switch (form.step) {
        case 1:
          return '确认删除(1/3)'
        case 2:
          return '数据处理(2/3)'
        case 3:
          return '确认(3/3)'

        default:
          return ''
      }
    })

    const toNext = () => {
      switch (form.step) {
        case 1:
          if (form.username !== props.username) {
            ElMessage.error('用户名不正确')
            return
          }

          break
        case 2:
          if (form.changeType === null) {
            ElMessage.error('请选择处理方式')
            return
          }
          if (form.changeType === '1' && !form.toUserId) {
            ElMessage.error('请选择管理员')
            return
          }
          break

        default:
          break
      }
      form.step++
    }

    const toBack = () => {
      form.step--
    }

    // user
    const userList = ref([])
    const userIsLoading = ref(false)
    const getUserList = (userKeyword = null) => {
      if (userIsLoading.value) {
        return
      }
      userIsLoading.value = true
      authApi
        .getUserList(
          { keyword: userKeyword, status: 1, size: 10, page: 1 },
          true
        )
        .then((res) => {
          userList.value = res.data.list
        })
        .finally(() => {
          userIsLoading.value = false
        })
    }
    let queryUsersTimer = null
    const queryUsers = (query) => {
      if (queryUsersTimer) {
        clearTimeout(queryUsersTimer)
      }
      queryUsersTimer = setTimeout(() => {
        getUserList(query)
      }, 50)
    }

    const userData = ref(null)
    const changeToUser = (val) => {
      userData.value = userList.value.find((item) => item._id === val)
    }

    // watch show
    watch(
      () => props.show,
      (newVal, oldVal) => {
        if (newVal) {
          resetForm()
        }
      }
    )
    return {
      showDialog,
      submit,
      form,
      title,
      toNext,
      toBack,
      userList,
      userIsLoading,
      queryUsers,
      userData,
      changeToUser,
    }
  },
}
</script>
<style lang=""></style>
