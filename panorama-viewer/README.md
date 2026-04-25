# Panorama Viewer Tool

这是一个独立的静态全景照片查看器构建工具，基于 Vite 8.0.10。

## 用法

在仓库根目录执行：

```bash
yarn build-panorama
```

开发预览：

```bash
yarn dev-panorama
```

## 产物目录

构建结果会输出到 `blog/public/panorama`。

## Query 参数

页面会从 query 参数读取全景照片地址，优先顺序如下：

- `src`
- `panorama`
- `imageUrl`
- `url`

页面同时支持 `lang` 参数用于切换语言，首批支持：

- `zh-CN`
- `zh-TW`
- `en`
- `ja`

未传 `lang` 时，默认使用 `en`。

示例：

```text
/panorama?src=/upload/panorama.jpg

/panorama?src=/upload/panorama.jpg&lang=en
```
