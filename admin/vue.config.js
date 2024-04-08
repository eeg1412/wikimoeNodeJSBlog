const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // 打包目录到../server/front/admin/
  outputDir: "../server/front/admin/",
  publicPath: process.env.NODE_ENV === "production" ? "/admin/" : "/",
  // 不生成map文件，根据build还是dev环境来
  productionSourceMap: process.env.NODE_ENV === "production" ? false : true,
  devServer: {
    client: {
      overlay: false,
    },
    https: false,
    port: 8079,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3006/api",
        changeOrigin: true,
        pathRewrite: {
          "/api": "",
        },
      },
      // content
      "/content/uploadfile": {
        target: "http://127.0.0.1:3006/content/uploadfile",
        changeOrigin: true,
        pathRewrite: {
          "/content/uploadfile": "",
        },
      },
      // upload
      "/upload": {
        target: "http://127.0.0.1:3006/upload",
        changeOrigin: true,
        pathRewrite: {
          "/upload": "",
        },
      },
    },
  },
  // 不生成console
  chainWebpack: (config) => {
    config.optimization.minimizer('terser').tap((args) => {
      const compress = args[0].terserOptions.compress
      compress.drop_console = true
      return args
    })
  },
})
