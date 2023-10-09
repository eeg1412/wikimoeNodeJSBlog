const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
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
    },
  }
})
