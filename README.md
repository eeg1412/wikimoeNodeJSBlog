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
其中 admin 部分仅编译成 html 给 server 提供管理端的页面

三个部分需要按照顺序编译/启动

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

编译后会在 server/front 下生成 admin 文件夹，如果服务器配置并不支持编译的话可以在本机安装 nodejs 20 的环境后，在本机编译并上传到服务器

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

可以将目录下的 sample.env 复制并更名为.env  
配置内容如下：

```
PORT="填写运行端口号"
DB_HOST="填写mongodb地址"
JSON_LIMT="JSON格式的大小限制如（50mb）"
URLENCODED_LIMT="URL编码的大小限制如（50mb）"
JWT_SECRET="JWT所用的密文"
IP2LOCATION="1为开启IP地址解析"
IP2LOCATION_FILE_NAME="地址解析用到的BIN文件，一般为IP2LOCATION-LITE-DB3.BIN，切记一定要下载【DB3.LITE】的BIN文件"
MAX_HISTORYLOGS_SIZE="日志集合的最大占用空间，单位字节默认1073741824（1GB）"
SITE_USE_CDN="网站是否使用CDN，使用时填1"
```

**关于 IP2LOCATION 文件**

- 请自行在[IP2Location Lite](https://lite.ip2location.com/)网站注册下载 BIN 文件。
- 注意一定要选择【DB3.LITE】 IP-COUNTRY-REGION-CITY 的 BIN 文件，如果网站有 IPv6 需求的话可以下载 IPv6 的 BIN 文件，IPv6 的 BIN 文件已经包含 IPv4。
- 下载的 BIN 文件请放在 server/utils/ip2location 目录下

### 运行

```
yarn start
```

### 创建管理员（如果需要）

```
yarn run create
```

**注意：账号仅支持小写字母和数字，密码必须包含大小写与符号（!@#$%^&\*）**

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

可以将目录下的 sample.env 复制并更名为.env  
文件内容如下：

```
NUXT_API_API_DOMAIN="填写API的HTTP地址，如：http://localhost:3006"
GOOGLE_ADSENSE_ID="如果需要设置谷歌广告，填写谷歌广告ID"
GOOGLE_ADSENSE_TEST_MODE="是否启用测试模式 1 为启用，0 为不启用"
GOOGLE_ADSENSE_POST_DETAIL_BT="文章底部广告，填写格式为：ad-slot,ad-format,ad-layout-key"
SWR_ENABLED="设置为1时打开SWR缓存，将会消耗大量内存提升访问速度"
SWR_CACHE_MAXAGE="SWR缓存时间，单位秒，默认10秒"
SWR_CACHE_STALEMAXAGE="staleMaxAge的时间，单位秒，默认3600秒"
CACHE_MAX_PAGE="开启SWR时的缓存页面数量，默认10个页面"
CACHE_TTL="缓存的过期时间，单位毫秒，默认60000毫秒"
SHOW_LOADING="是否显示进入网站时的读取动画，需要时为1"
```

### 配置谷歌广告 ads.txt （如果需要）

在/blog/public/目录下放置 ads.txt 即可

### 编译

```
yarn build
```

编译后会在 blog/build 生成编译.output 的文件夹，如果服务器配置并不支持编译的话可以在本机安装 nodejs 20 的环境后，在本机编译并上传到服务器

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
