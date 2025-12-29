# 猛男自用的【维基萌博客系统】

![N`AG~U3E547WKDN{J P2H22](https://github.com/eeg1412/wikimoeNodeJSBlog/assets/27753071/4b5177e5-6f1b-414b-938b-336c0b7a68ed)

## 特色系统

### 记录生活点滴

![image](https://github.com/user-attachments/assets/49dd9adc-c3ba-4d77-a56c-920da7e518ac)

### 自动解析 bilibili 视频地址

![image](https://github.com/user-attachments/assets/bc99079b-dbae-41d4-8cb3-e72a7ec2c7cb)

### 记录自己追过的 ACGN

![image](https://github.com/user-attachments/assets/1977835c-370b-4cb1-acbb-59d33b9e1136)  
![image](https://github.com/user-attachments/assets/d4ecea17-fa94-4489-bb7e-4bbfcc060621)  
![image](https://github.com/user-attachments/assets/96ac6f02-3b35-4755-ab4f-31b2c97df597)  
![image](https://github.com/user-attachments/assets/2032f613-85f7-47e7-9210-670240968927)

### 管理与分享自己的日程

![image](https://github.com/user-attachments/assets/701ed64f-4e96-44b0-a0b7-57475f52501c)

### 支持深色主题切换

<video src="https://github.com/user-attachments/assets/8064ff4f-1bf8-4143-8dcb-0c3617dc0517" playsinline controls muted autoplay loop></video>

### 支持 360° 全景照片

<video src="https://github.com/user-attachments/assets/887094da-803a-47ea-bc2f-9fe1780c5dc1" playsinline controls muted autoplay loop></video>

#### 通过 VR 观看 360° 全景照片

<video src="https://github.com/user-attachments/assets/2f4c8ad0-cda4-4890-a28b-963f22b74791" playsinline controls muted autoplay loop></video>

#### 通过陀螺仪观看 360° 全景照片

<video src="https://github.com/user-attachments/assets/e18f8c66-c637-4a22-baf9-09e8ae89ed89" playsinline controls muted autoplay loop></video>

### 记录自己曾经去过的地方

![image](https://github.com/user-attachments/assets/71f2e7f4-b364-4d7d-8a40-519f9f866292)

## 当前已知问题

1. 如果不做任何设置的话，资源文件默认是通过 nuxt 反代到 express 获取资源文件的，此时如果用 nginx 再去反代资源文件的话会出现 safari 无法查看视频的问题，如果用 nginx 代理博客的话，请将以下路径反代到博客 API 的地址。

- /content
- /upload

以下是一个例子，假如 API 是 3006 端口：

```nginx
location /content {
    proxy_pass http://localhost:3006;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    add_header X-Cache $upstream_cache_status;
}

location /upload {
    proxy_pass http://localhost:3006;
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

【维基萌博客系统】推荐 Node.js 20.19+ 版本和 mongodb 6(不推荐)/7/8 版本。  
其他版本也许可以跑，但是没测试过。

【维基萌博客系统】的架构如下图所示：

![image](https://github.com/user-attachments/assets/c5dc6874-e6ca-4910-833d-01234616ad22)

项目目录分为三个部分  
server：博客 api 部分  
admin：博客管理后台部分  
blog：博客部分  
其中 admin 部分仅编译成 html 给 server 提供管理端的页面

三个部分需要按照顺序编译/启动  
也可以直接在根目录运行 yarn run start --build，一键编译和运行程序。

## Docker 部署

使用 Docker 部署是最简单、最干净的方式。你不需要在服务器上安装 Node.js 或 MongoDB，只需要安装 Docker 即可。

### 1. 安装 Docker 环境

如果你还没有安装 Docker，请在终端执行以下命令（仅限 Linux）：

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

### 2. 准备部署目录

创建一个文件夹来存放博客的数据和配置文件：

```bash
mkdir wikimoe
```

```bash
cd wikimoe
```

### 3. 下载配置文件

下载部署所需的 `compose.yml` 和环境变量模板 `example.env`：

```bash
wget -O compose.yml https://raw.githubusercontent.com/eeg1412/wikimoeNodeJSBlog/main/docker-compose.yml
```

```bash
wget -O example.env https://raw.githubusercontent.com/eeg1412/wikimoeNodeJSBlog/main/example.env
```

**重命名配置文件：**
Docker 运行需要读取名为 `.env` 的配置文件，所以我们需要将下载的模板重命名：

```bash
mv example.env .env
```

**注意：** 如果用的是老版升级但是又不想升级 mongoDB 版本，可以下载 MongoDB 6 版本的配置文件（不推荐，有安全风险，仅做兼容）：

> ```bash
> wget -O compose.yml https://raw.githubusercontent.com/eeg1412/wikimoeNodeJSBlog/main/docker-compose-mongo6.yml
> ```

### 4. 修改环境变量

使用编辑器（如 `nano` 或 `vi`）打开 `.env` 文件：

```bash
nano .env
```

你需要了解并根据需要修改以下内容：

#### 核心配置（必看）

| 变量名            | 默认值                                   | 说明                                                                                               |
| :---------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `USER_NAME`       | `admin`                                  | **首次启动**时创建的管理员账号名。                                                                 |
| `NUXT_API_DOMAIN` | `http://localhost:3006`                  | **非常重要！** 博客前端访问后端的地址。如果你通过公网访问，请将其改为 `http://你的服务器IP:3006`。 |
| `PORT`            | `3006`                                   | 后端 API 服务的内部端口，通常不需要修改。                                                          |
| `NITRO_PORT`      | `3007`                                   | 博客前端页面的内部端口，通常不需要修改。                                                           |
| `DB_HOST`         | `mongodb://wikimoe-db:27017/wikimoeBlog` | 数据库连接地址，Docker 内部自动关联，无需修改。                                                    |

#### 性能与限制配置（可选）

| 变量名                  | 默认值       | 说明                                                                                                          |
| :---------------------- | :----------- | :------------------------------------------------------------------------------------------------------------ |
| `JSON_LIMIT`            | `50mb`       | JSON 格式上传文件的大小限制。如果你要上传大图，可以调大这个值。                                               |
| `URLENCODED_LIMIT`      | `50mb`       | URL 编码格式上传的大小限制，建议与 `JSON_LIMIT` 保持一致。                                                    |
| `MAX_HISTORYLOGS_SIZE`  | `1073741824` | 历史日志的最大占用空间（单位：字节），默认 1GB。超过后会停止记录日志。                                        |
| `IP2LOCATION_FILE_NAME` | (空)         | IP 地址库文件名，一般不用改，除非你修改了地址库的文件名。具体请参考下文 [配置 env-文件](#配置env-文件) 章节。 |

#### SWR 高级缓存配置（可选）

> **什么是 SWR 缓存？** 开启后，系统会将页面生成的 HTML 缓存起来。下次访问时直接秒开，极大地减轻服务器负担，但会消耗更多内存。

| 变量名                       | 默认值  | 说明                                                                   |
| :--------------------------- | :------ | :--------------------------------------------------------------------- |
| `NUXT_SWR_ENABLED`           | `0`     | 是否开启 SWR 缓存（1 开启/0 关闭）。                                   |
| `NUXT_SWR_CACHE_MAXAGE`      | `10`    | 缓存的有效期（秒）。在此时间内访问将直接读取缓存。                     |
| `NUXT_SWR_CACHE_STALEMAXAGE` | `3600`  | 宽限期（秒）。缓存过期后，系统会先给用户看旧缓存，同时在后台静默更新。 |
| `NUXT_SWR_CACHE_MAX_PAGE`    | `100`   | 最大缓存的页面数量。如果你的文章非常多，可以调大。                     |
| `NUXT_SWR_CACHE_TTL`         | `86400` | 缓存数据的物理生存时间（秒）。                                         |

修改完成后，按 `Ctrl+O` 保存，`Ctrl+X` 退出。

### 5. 启动博客

执行以下命令开始下载镜像并启动：

```bash
docker compose up -d
```

### 6. 访问与登录

启动成功后，你可以通过以下地址访问：

- **博客前台**：`http://你的服务器IP:3007`
- **管理后台**：`http://你的服务器IP:3006/admin`

**初始登录信息：**

- **账号**：你在 `.env` 中设置的 `USER_NAME`（默认 `admin`）
- **密码**：`7@wVUo6BL6LHjNR*#x`
- **注意**：登录后请务必第一时间修改密码！创建用户后会生成 `install.lock` 防止重复初始化，请不要删除该文件。

---

### 如何更新维基萌博客？

当作者发布了新版本，你只需要进入 `wikimoe` 目录执行以下命令即可完成无损更新：

1. **拉取最新镜像**：

```bash
docker compose pull
```

2. **重新启动服务**：

```bash
docker compose up -d
```

3. **清理旧镜像（可选，释放空间）**：

```bash
docker image prune -f
```

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
IP2LOCATION_FILE_NAME="地址解析用到的BIN文件，切记一定要下载【DB3.LITE】的BIN文件。默认为IP2LOCATION.BIN，如果想更改文件名可以修改这个项目"
MAX_HISTORYLOGS_SIZE="日志集合的最大占用空间，单位字节默认1073741824（1GB）"
```

**关于 IP2LOCATION 文件**

- 请自行在[IP2Location Lite](https://lite.ip2location.com/)网站注册下载 BIN 文件。
- 注意一定要选择【DB3.LITE】 IP-COUNTRY-REGION-CITY 的 BIN 文件，如果网站有 IPv6 需求的话可以下载 IPv6 的 BIN 文件，IPv6 的 BIN 文件已经包含 IPv4。
- 下载的 BIN 文件请放在 server/utils/ip2location 目录下，并更名为 IP2LOCATION.BIN

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
NUXT_API_DOMAIN="填写API的HTTP地址，如：http://localhost:3006，必填项"
NUXT_SWR_ENABLED="设置为1时打开SWR缓存，将会消耗大量内存提升访问速度，默认0（关闭）"
NUXT_SWR_CACHE_MAXAGE="SWR缓存时间，单位秒，默认10秒"
NUXT_SWR_CACHE_STALEMAXAGE="staleMaxAge的时间，单位秒，默认3600秒"
NUXT_SWR_CACHE_MAX_PAGE="开启SWR时的缓存页面数量，默认100个页面"
NUXT_SWR_CACHE_TTL="缓存的过期时间，单位秒，默认86400秒"
NITRO_PORT="设置Nitro服务器端口，默认3007(仅对生产环境生效)"
```

### 编译

```bash
yarn build
```

编译后会在 blog/build 生成编译.output 的文件夹，如果服务器配置并不支持编译的话可以在本机安装 nodejs 20.19 以上 的环境后，在本机编译并上传到服务器

### 进入编译文件夹

```bash
cd build
```

### 运行

```bash
yarn run start
```

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

### 重置管理员登录限制

如果不小心因为密码错误次数过多导致登录受到限制，可以重置管理员登录限制。

```bash
yarn run reset-admin-login-attempt
```

请注意，执行后管理员的登录限制将会被设定为每 1 分钟 9999 次。在登录后可以在【管理员】->【管理员登录日志】中删除前面失败的登录记录。之后请别忘记手动还原之前的 【管理员尝试登录限制】 设置。
