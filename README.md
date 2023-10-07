# wikimoeNodeJSBlog

## 说明

项目分为三个部分  
server：博客 api 部分  
admin：博客管理后台部分  
blog：博客部分

三个部分需要按照顺序启动

## 1.博客 API 部分

### 进入文件夹

```
cd server
```

### 安装依赖

```
npm run ci
```

### 配置.env 文件

文件内容如下：

```
PORT="填写运行端口号"
DB_HOST="填写mongodb地址"
```

### 运行

```
npm run start
```

### 创建管理员（如果需要）

```
npm run create
```
