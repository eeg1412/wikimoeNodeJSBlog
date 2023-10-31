import { createAPI } from "./create-api";
import auth from "./module/auth";
import { showLoading, hideLoading } from "@/utils/utils";
import { ElMessage } from 'element-plus';
import router from "@/router";
import store from "../store";

const api = createAPI({ baseURL: '/api/admin' })
//请求拦截器
api.interceptors.request.use(
  (config) => {
    const data = config.data || {};
    let shouldAdminJWT = config.shouldAdminJWT;

    if (shouldAdminJWT && store.getters.adminToken) {
      config.headers["Authorization"] = `Bearer ${store.getters.adminToken}`;
    }
    const noLoading = config.noLoading;
    if (!noLoading) {
      showLoading();
    }
    return config;
  },
  (error) => {
    const config = error.response?.config || {};
    const noLoading = config.noLoading;
    if (!noLoading) {
      hideLoading();
    }
    return Promise.reject(error);
  }
);

//响应拦截器
let goLoginFlagTimer = null;
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    const noLoading = config.noLoading;
    if (!noLoading) {
      hideLoading();
    }
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const config = error.response?.config || {};
    const noLoading = config.noLoading;
    if (!noLoading) {
      hideLoading();
    }
    switch (status) {
      case 400:
      case 403:
        const errorList = error?.response?.data?.errors;
        if (typeof errorList === "object") {
          errorList.forEach((errorMessage) => {
            ElMessage.error({
              message: errorMessage.message,
              'custom-class': "common-message-error"
            });
          });
        }
        break;
      case 401:
        const routeName = router.currentRoute.value.name;
        if (routeName !== "Login") {
          clearTimeout(goLoginFlagTimer);
          goLoginFlagTimer = setTimeout(() => {
            ElMessage.error({
              message: '请重新登录',
              'custom-class': "common-message-error"
            });
            router.replace({ name: "Login" });
          }, 200);
        } else {
          const errorList = error?.response?.data;
          if (typeof errorList === "object") {
            errorList.forEach((errorMessage) => {
              ElMessage.error({
                message: errorMessage,
                'custom-class': "common-message-error"
              });
            });
          }
        }
        break;
      default:
        ElMessage.error({
          message: "发生错误。code:" + status,
          'custom-class': "common-message-error"
        });
        console.error(error);
        break;
    }
    return Promise.reject(error);
  }
);

export const authApi = auth(api);
