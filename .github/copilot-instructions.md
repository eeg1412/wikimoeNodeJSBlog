# WikimoeNodeJSBlog 项目开发规范

## 通用规范

### 命名规范

#### 文件与目录

- 目录统一使用 **小写**：`api/`、`components/`、`utils/`
- 表示实体的模块使用 **单数名词**：`user.js` 而不是 `users.js`
- 表示集合或分组的目录使用 **复数名词**：`models/`、`utils/`
- admin 的页面与组件文件名使用 **PascalCase**：`UserList.vue`、`PostEditor.vue`
- blog 的组件名使用 **PascalCase**：`PostCard.vue`、`CommentSection.vue`，页面文件使用 **kebab-case**：`post-list.vue`、`user-profile.vue`

#### 变量与函数

- 变量和函数使用 **camelCase（小驼峰）**：`userSettings`、`getPostList()`
- 类、组件、构造函数使用 **PascalCase（大驼峰）**：`UserModel`、`PostEditor`
- 常量使用 **UPPER_SNAKE_CASE（全大写下划线）**：`MAX_FILE_SIZE`、`DEFAULT_PORT`
- 布尔变量应使用 `is`、`has`、`should` 等前缀：`isLoading`、`hasError`

---

### 代码组织

- 将相关功能进行分组，拆分成小模块
- 遵循单一职责原则（Single Responsibility Principle）
- 导出函数与组件时使用清晰、具描述性的名称
- 在相似文件之间保持一致的实现模式

---

### 错误处理

- 异步操作使用 try/catch
- 提供有意义的错误信息
- 合理记录错误日志
- 返回统一格式的错误响应
- 优雅处理预期与非预期错误

```javascript
try {
  const result = await someAsyncFunction()
} catch (error) {
  logger.error(`Error in operation: ${error.message}`)
  return errorResponse(error)
} finally {
  // 如有必要进行清理
}
```

---

### 文档规范

- 对复杂逻辑或业务规则添加注释
- 使用 JSDoc 风格为函数编写说明：

```javascript
/**
 * 使用提供的数据执行重要处理
 * @param {Object} data - 需要处理的数据
 * @param {Object} options - 处理选项
 * @returns {Promise<Result>} 处理后的结果
 */
function processData(data, options) {
  // 实现逻辑
}
```

- 为组件的 props 和 emits 添加说明
- 保持 README.md 最新并包含完整的启动说明

---

## Server 端规范

### Server 项目结构

```
server/
├── api/
│   ├── admin/
│   └── blog/
├── bin/
├── config/
├── mongodb/
│   ├── index.js
│   ├── models/
│   └── utils/
├── routes/
├── utils/
│   └── workers/
└── [其他目录]
```

---

### 数据库操作

- 实现统一 CRUD 命名规范

```javascript
exports.findPage = async function (
  params,
  sort,
  page,
  limit,
  projection,
  options = {}
) {
  const q = Model.find(params, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)

  if (options.lean) {
    q.lean()
  }

  const list = await q
  const total = await Model.countDocuments(params)

  return { list, total }
}
```

---

### API 接口规范

- 每个接口单独一个文件
- 每个文件只导出一个函数

```javascript
module.exports = async function (req, res, next) {
  try {
    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}
```

### 缓存管理

```javascript
utils.executeInLock('cacheKey', async () => {
  // 缓存更新逻辑
})
```

---

### 安全实践

- 清理与校验用户输入
- 使用 JWT
- 验证 MongoDB ObjectId
- 严格权限控制
- 接口限流

---

## Blog 前端规范

### 说明

- 使用tailwindcss进行样式开发
- Blog为Nuxt4
- UI组件定义在 blog\app\components\wui 目录下

---

### Blog 组件结构

```vue
<template></template>

<script setup>
// Imports
// Props & Emits
// State
// Refs
// Computed
// Methods
// Watch
// Lifecycle
</script>

<style scoped></style>
```

---

### Blog 状态管理

```typescript
export function useStoreName() {
  const state = useState('storeName', () => ({}))

  function updateState(newValue) {
    state.value = newValue
  }

  async function fetchData() {}

  return { state, updateState, fetchData }
}
```

---

### Blog API 集成

```typescript
export const getPostListApi = params => {
  return $fetch('/api/blog/post/list', {
    method: 'GET',
    params
  })
}
```

---

### Blog 图片处理

- 使用统一图片组件
- 懒加载
- 提供 alt
- 响应式适配

---

## Admin 管理端规范

### Admin 项目结构

```
admin/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── router/
│   ├── store/
│   ├── utils/
│   ├── views/
│   ├── App.vue
│   └── main.js
└── tools/
```

---

### Admin 组件结构

```vue
<template></template>

<script>
export default {
  name: 'ComponentName',
  props: {},
  emits: ['update:modelValue', 'custom-event'],
  setup(props, { emit }) {
    return {}
  }
}
</script>

<style scoped></style>
```

---

### Admin API 模块示例

```javascript
export default function (api) {
  return {
    getEntityList(data, noLoading = false) {
      return api.get('/entity/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading
      })
    }
  }
}
```

---

## CSS 命名规范

### 全局工具类

- `w_05`
- `mt10`
- `tc`
- `fb`
- `db`
- `cWhite`

---

### 组件类名

- `[component]-[element]-[modifier]`
- `blog-tweet-img-list-body`
- `attachments-dialog-header`

---

## 响应式设计

```
Mobile: max-width: 767px
Tablet: 768px - 1023px
Desktop: min-width: 1024px
```

---

## 最后提醒

- 这是一个产品级项目，务必遵守以上规范，以开发产品的思维进行开发
- 从开发产品的角度出发，编写合格的代码，注重代码的可读性和可维护性
- 尽可能不要使用三元表达式，保持代码清晰易读
- 前端代码必须保证闭合标签的正确性，避免出现未闭合的标签
- 前端注重手机端适配。
- 前端注意暗黑模式的适配。
- 管理端前端列表页的表格使用ResponsiveTable和ResponsiveTableColumn组件替代element-plus的Table组件，在小屏幕设备上能够正常显示。
- 管理端前端使用IpInfoDisplay组件显示IP地址的地理位置信息。
- 管理端前端使用DeviceInfoDisplay组件显示设备信息。
- 除非用户明确指示，否则禁止使用 terminal command 来修改文件。
- 分析哪些代码可以作为通用组件或函数提取出来，并将它们放在适当的目录中，以便在整个项目中重用。

## Git 提交规范

### 提交前缀

- 【博客端】
- 【API】
- 【管理端】
- 【文档】
- 【配置】
- 【工具】
- 【通用】
- 【部署】
- 【数据库】
