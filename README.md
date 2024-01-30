# 猛男自用的【维基萌博客系统】

![N`AG~U3E547WKDN{J P2H22](https://github.com/eeg1412/wikimoeNodeJSBlog/assets/27753071/4b5177e5-6f1b-414b-938b-336c0b7a68ed)

## 当前已知问题

1. 在 Windows 环境中运行开发版 blog 会出现图片加载失败的现象，这是因为 Nuxt.js 所使用的 Nitro 在开发模式中反代有并发问题导致的，build 之后在 Linux 下运行是不会出现这个问题的（Windows 服务器未验证）。
2. 如果不做任何设置的话，资源文件默认是通过 nuxt3 反代到 express 获取资源文件的，但是 nuxt3 不知道对流媒体的请求做了什么处理，导致苹果设备的 safari 无法查看视频，解决办法是不要通过 nuxt3 去反代资源文件，而是通过比如 nginx 去反代资源文件。

## 说明

【维基萌博客系统】推荐 Node.js 20 版本和 mongodb 6 版本。  
其他版本也许可以跑，但是没测试过。

【维基萌博客系统】的架构如下图所示：

![image](https://github.com/eeg1412/wikimoeNodeJSBlog/assets/27753071/997d9cb4-56fc-4886-b155-bb5102fd20b9)

项目目录分为三个部分  
server：博客 api 部分  
admin：博客管理后台部分  
blog：博客部分

三个部分需要按照顺序启动

## 1.博客 管理后台前端

### 进入文件夹

```
cd admin
```

### 安装依赖

```
yarn install
```

### 编译

```
yarn build
```

## 2.博客 API 部分

### 进入文件夹

```
cd server
```

### 安装依赖

```
yarn install
```

### 配置.env 文件

文件内容如下：

```
PORT="填写运行端口号"
DB_HOST="填写mongodb地址"
JSON_LIMT="JSON格式的大小限制如（50mb）"
URLENCODED_LIMT="URL编码的大小限制如（50mb）"
JWT_SECRET="JWT所用的密文"
IP2LOCATION="1为开启IP地址解析"
IP2LOCATION_FILE_NAME="地址解析用到的BIN文件，一般为IP2LOCATION-LITE-DB1.BIN"
```

### 运行

```
yarn start
```

### 创建管理员（如果需要）

```
yarn create
```

## 3.博客 页面 部分

### 进入文件夹

```
cd blog
```

### 安装依赖

```
yarn install
```

### 配置.env 文件

文件内容如下：

```
NUXT_API_API_DOMAIN="填写API的HTTP地址，如：http://localhost:3006"
GOOGLE_ADSENSE_ID="如果需要设置谷歌广告，填写谷歌广告ID"
GOOGLE_ADSENSE_TEST_MODE="是否启用测试模式 1 为启用，0 为不启用"
GOOGLE_ADSENSE_POST_DETAIL_BT="文章底部广告，填写格式为：ad-slot,ad-format,ad-layout-key"
```

### 配置谷歌广告 ads.txt （如果需要）

在/blog/public/目录下放置 ads.txt 即可

### 编译

```
yarn build
```

### 进入编译文件夹

```
cd build
```

### 运行

linux

```
yarn start-linux
```

windows

```
yarn start-windows
```

※在 blog/build/package.json 中可以修改运行端口
