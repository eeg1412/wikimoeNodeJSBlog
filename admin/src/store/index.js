import { createStore } from 'vuex'
import { authApi } from "@/api";

export default createStore({
  state: {
    adminToken: localStorage.getItem("adminToken") || "",
    adminInfo: null,
    loadingShow: false,
  },
  getters: {
    adminToken: (state) => state.adminToken,
    loadingShow: (state) => state.loadingShow,
    // getAdminInfo
    adminInfo: (state) => state.adminInfo,
  },
  mutations: {
    setLoading (state, data) {
      state.loadingShow = data;
    },

    setAdminToken (state, data) {
      state.adminToken = data;
    },
    // setAdminInfo
    setAdminInfo (state, adminInfo) {
      authApi.loginuserinfo().then((res) => {
        state.adminInfo = res.data.data
      }).catch(() => {
        state.adminInfo = null
      })
    },
  },
  actions: {
    setLoading ({ commit }, data) {
      commit("setLoading", data);
    },

    setAdminToken ({ commit }, data) {
      localStorage.setItem('adminToken', data)
      commit("setAdminToken", data);
    },

    // setAdminInfo
    setAdminInfo ({ commit }) {
      commit('setAdminInfo')
    },
  },
})
