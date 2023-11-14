const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    client: {
      overlay: false,
    },
    https: false,
    port: 8079,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3011/api",
        changeOrigin: true,
        pathRewrite: {
          "/api": "",
        },
      },
      // content
      "/content/uploadfile": {
        target: "http://127.0.0.1:3011/content/uploadfile",
        changeOrigin: true,
        pathRewrite: {
          "/content/uploadfile": "",
        },
      },
      // upload
      "/upload": {
        target: "http://127.0.0.1:3011/upload",
        changeOrigin: true,
        pathRewrite: {
          "/upload": "",
        },
      },
    },
  }
})
