# wikimoeNodeJSBlog

## 说明

项目分为三个部分  
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
REFERRER_DOMAIN_WHITELIST="引用域名白名单，比如wikimoe.com"
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
NUXT_API_API_DOMAIN="填写API的HTTP地址，如：http://localhost:3011"
GOOGLE_ADSENSE_ID="如果需要设置谷歌广告，填写谷歌广告ID"
GOOGLE_ADSENSE_TEST_MODE="是否启用测试模式 1 为启用，0 为不启用"
GOOGLE_ADSENSE_POST_DETAIL_BT="文章底部广告，填写格式为：ad-slot,ad-format,ad-layout-key"
```

### 编译

```
yarn build
```

编译后生成 .output 文件夹，通过 node 运行即可。
