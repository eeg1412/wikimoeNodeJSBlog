# 猛男自用的【维基萌博客系统】

![N`AG~U3E547WKDN{J P2H22](https://github.com/eeg1412/wikimoeNodeJSBlog/assets/27753071/4b5177e5-6f1b-414b-938b-336c0b7a68ed)

## 特色系统

### 记录生活点滴

![image](https://github.com/user-attachments/assets/49dd9adc-c3ba-4d77-a56c-920da7e518ac)

### 自动解析 bilibili 视频地址

![image](https://github.com/user-attachments/assets/bc99079b-dbae-41d4-8cb3-e72a7ec2c7cb)

### 记录自己追过的 ACGN

![image](https://github.com/user-attachments/assets/78cc341f-4a69-4a79-8318-66153415818b)
![image](https://github.com/user-attachments/assets/78e604ac-d6b7-4a8c-9a2c-010328f759a0)
![image](https://github.com/user-attachments/assets/3b1a311b-69a9-4c76-bd0c-28a4530ed86e)

### 管理与分享自己的日程

![image](https://github.com/user-attachments/assets/701ed64f-4e96-44b0-a0b7-57475f52501c)

## 当前已知问题

1. 如果不做任何设置的话，资源文件默认是通过 nuxt3 反代到 express 获取资源文件的，此时如果用 nginx 再去反代资源文件的话会出现 safari 无法查看视频的问题，如果用 nginx 代理博客的话，请将以下路径反代到博客 API 的地址。

- /content
- /upload

以下是一个例子，假如 API 是 3000 端口：

```nginx
location /content {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    add_header X-Cache $upstream_cache_status;
}

location /upload {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    add_header X-Cache $upstream_cache_status;
}
```

3. 关于 emoji 一些设备显示不全的问题。可以在管理后台的【设置】->【页面底部信息】中添加：

```typescript
<style>
  @import
  url('https://fonts.loli.net/css2?family=Noto+Color+Emoji&display=swap');
</style>
```

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
也可以直接在根目录运行 yarn run start --build，一键编译和运行程序。

## Docker 部署

### 准备环境

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

### lite 快速体验版

从 repo 下载 docker-compose-lite.yml 以及 .env 文件

```bash
cd && mkdir wikimoe && cd wikimoe
wget -O compose.yml https://raw.githubusercontent.com/eeg1412/wikimoeNodeJSBlog/main/docker-compose-lite.yml
wget -O .env https://raw.githubusercontent.com/eeg1412/wikimoeNodeJSBlog/main/example.env
```

然后使用 `docker compose up -d` 即可在本地快速体验，注意：docker-compose-lite.yml 预设了一部分配置，如果你想自定义更多参数，请参照下面的完整部署  
相比较完整版，lite 版没有 SWR 缓存技术，并且限制了（后端）Server 的端口必须为 3006。

### 完整部署

Clone 仓库，并修改 .env 文件的内容

```bash
cd && mkdir wikimoe && cd wikimoe && git clone https://github.com/eeg1412/wikimoeNodeJSBlog --depth=1
cd wikimoeNodeJSBlog && mv example.env .env
```

按照 [API 配置部分](#配置env-文件) 、[Blog 配置部分](#配置env-文件-1) 修改 `.env` 文件中的 USER_NAME 环境变量（此环境变量为站长初始用户名），以及其他相关环境变量。注意：port 相关请修改 compose.yml 文件来修改端口映射

然后使用 `docker compose up -d`拉起容器，你所修改的环境变量会传递给容器

Server 容器会自动检查 USER_NAME 环境变量，并为你创建站长用户（会生成 install.lock 防止重复初始化，请不要删除该文件），注意：此用户的初始密码为 `7@wVUo6BL6LHjNR*#x` ，请初始化后及时修改。

反向代理可根据自己需求修改

（后端）Server：`http://localhost:3000`

（前端）Blog：`http://localhost:3007`

（后台）admin：`http://localhost:3000/admin`

## 对于 1Panel 的部署

可以参考[如何使用 1Panel 搭建猛男自用的维基萌博客](https://www.wikimoe.com/post/94r1mfyk)

## 对于 宝塔/aaPanel 的部署

可以参考[如果使用宝塔/aaPanel 搭建猛男自用的维基萌博客](https://www.wikimoe.com/post/tcxurept)

## 一键编译运行

可以先参考下面的配置文件配置，然后直接在根目录运行

```bash
yarn run start --build
```

即可一键编译运行。  
其中--build 参数为是否需要编译。

## 1.博客 管理后台前端

### 进入文件夹

```bash
cd admin
```

### 安装依赖

```bash
yarn install
```

### 编译

```bash
yarn build
```

编译后会在 server/front 下生成 admin 文件夹，如果服务器配置并不支持编译的话可以在本机安装 nodejs 20 的环境后，在本机编译并上传到服务器

## 2.博客 API 部分

### 进入文件夹

```bash
cd server
```

### 安装依赖

```bash
yarn install
```

### 配置.env 文件

可以将目录下的 sample.env 复制并更名为.env  
配置内容如下：

```env
PORT="填写运行端口号"
DB_HOST="填写mongodb地址"
JSON_LIMIT="JSON格式的大小限制如（50mb）"
URLENCODED_LIMIT="URL编码的大小限制如（50mb）"
JWT_SECRET="JWT所用的密文"
IP2LOCATION="1为开启IP地址解析"
IP2LOCATION_FILE_NAME="地址解析用到的BIN文件，一般为IP2LOCATION-LITE-DB3.BIN，切记一定要下载【DB3.LITE】的BIN文件"
MAX_HISTORYLOGS_SIZE="日志集合的最大占用空间，单位字节默认1073741824（1GB）"
```

**关于 IP2LOCATION 文件**

- 请自行在[IP2Location Lite](https://lite.ip2location.com/)网站注册下载 BIN 文件。
- 注意一定要选择【DB3.LITE】 IP-COUNTRY-REGION-CITY 的 BIN 文件，如果网站有 IPv6 需求的话可以下载 IPv6 的 BIN 文件，IPv6 的 BIN 文件已经包含 IPv4。
- 下载的 BIN 文件请放在 server/utils/ip2location 目录下

### 运行

```bash
yarn start
```

### 创建管理员（如果需要）

```bash
yarn run create-user
```

也可以通过参数的形式直接创建管理员

```bash
yarn run create-user 账号 密码 昵称
```

#### 注意

1.**用户名仅支持半角小写英文和数字**  
2.**密码必须 4 位以上且包含大小写、数字和符号（!@#$%^&\*）**

## 3.博客 页面 部分

### 进入文件夹

```bash
cd blog
```

### 安装依赖

```bash
yarn install
```

### 配置.env 文件

可以将目录下的 sample.env 复制并更名为.env  
文件内容如下：

```env
NUXT_API_DOMAIN="填写API的HTTP地址，如：http://localhost:3006"
SWR_ENABLED="设置为1时打开SWR缓存，将会消耗大量内存提升访问速度"
SWR_CACHE_MAXAGE="SWR缓存时间，单位秒，默认10秒"
SWR_CACHE_STALEMAXAGE="staleMaxAge的时间，单位秒，默认3600秒"
CACHE_MAX_PAGE="开启SWR时的缓存页面数量，默认10个页面"
CACHE_TTL="缓存的过期时间，单位毫秒，默认60000毫秒"
```

### 配置谷歌广告 ads.txt （如果需要）

在/blog/public/目录下放置 ads.txt 即可

### 编译

```bash
yarn build
```

编译后会在 blog/build 生成编译.output 的文件夹，如果服务器配置并不支持编译的话可以在本机安装 nodejs 20 的环境后，在本机编译并上传到服务器

### 进入编译文件夹

```bash
cd build
```

### 运行

linux

```bash
yarn start-linux
```

windows

```powershell
yarn start-windows
```

※在 blog/build/package.json 中可以修改运行端口

## 用户管理命令

这些命令提供了一种简单的方式来管理用户。

### 创建用户

使用 `create-user` 命令来创建一个新的用户：

```bash
yarn run create-user 账号 密码 昵称
```

1.**用户名仅支持半角小写英文和数字**  
2.**密码必须 4 位以上且包含大小写、数字和符号（!@#$%^&\*）**

### 修改用户密码

使用 `change-user-password` 命令来修改一个用户的密码：

```bash
yarn run change-user-password 账号 密码
```

1.**密码必须 4 位以上且包含大小写、数字和符号（!@#$%^&\*）**

### 获取用户列表

使用 `get-user-list` 命令来获取所有用户的列表：

```bash
yarn run get-user-list
```

### 设置用户禁止状态

```bash
yarn run set-user-ban 1
```

1.**参数传 1 禁用，传 0 解禁**

请注意，这些命令需要在项目的 server 目录下运行，并且需要先安装所有的依赖。你可以使用 `yarn install` 命令来安装依赖。
