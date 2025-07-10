import { createStore } from 'vuex'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'

export default createStore({
  state: {
    adminToken: localStorage.getItem('adminToken') || '',
    adminInfo: null,
    loadingShow: false,
    siteUrl: ''
  },
  getters: {
    adminToken: state => state.adminToken,
    loadingShow: state => state.loadingShow,
    // getAdminInfo
    adminInfo: state => state.adminInfo,
    siteUrl: state => state.siteUrl
  },
  mutations: {
    setLoading(state, data) {
      state.loadingShow = data
    },

    setAdminToken(state, data) {
      state.adminToken = data
    },
    // setAdminInfo
    setAdminInfo(state, adminInfo) {
      authApi
        .loginuserinfo()
        .then(res => {
          state.adminInfo = res.data.data
        })
        .catch(() => {
          state.adminInfo = null
        })
    },
    setOptions(state, data) {
      authApi.getOptionList({ nameList: ['siteUrl'] }).then(res => {
        const list = res.data.data
        // 查找name为siteUrl的数据
        const siteUrlData = list.find(item => item.name === 'siteUrl')
        if (siteUrlData) {
          state.siteUrl = siteUrlData.value
        } else {
          // 报错
          ElMessage.error('请先设置站点信息！')
        }
      })
    }
  },
  actions: {
    setLoading({ commit }, data) {
      commit('setLoading', data)
    },

    setAdminToken({ commit }, data) {
      localStorage.setItem('adminToken', data)
      commit('setAdminToken', data)
    },

    // setAdminInfo
    setAdminInfo({ commit }) {
      commit('setAdminInfo')
    },
    setOptions({ commit }) {
      commit('setOptions')
    }
  }
})
