# 新增 Sidebar Type 手顺

## 适用范围

本文档用于 `blog` 前端新增右侧栏 `sidebar` 区块类型。

## 新增前确认

1. 确认新 `type` 数字没有和现有 sidebar 类型重复。
2. 确认新类型是否需要前端额外请求数据。
3. 确认新类型是否需要跟随语言切换读取对应语言数据。

## 只渲染接口已有内容的类型

适用于接口已经在 sidebar 配置项中返回完整内容，不需要额外请求数据的类型。

1. 在 `blog/app/components` 新增或复用展示组件。
2. 在 `blog/app/utils/sidebar-block.js` 的 `SIDEBAR_BLOCK_DEFINITIONS` 增加一项。

```javascript
{
  type: 16,
  componentName: 'YourSidebarBlock',
  componentLoader: () => import('@/components/YourSidebarBlock.vue'),
  getProps: item => {
    return {
      content: item.content
    }
  }
}
```

## 需要额外请求数据的类型

适用于随机标签、分类、归档、趋势文章这类需要单独接口数据的类型。

1. 在 `blog/app/api` 对应模块中新增 `$fetch` 入口。

```javascript
const getYourSidebarDataFetchApi = (params = {}) => {
  const siteRequest = resolveSiteRequest(params)
  return siteRequest.request.getFetch('/your/api/path', siteRequest.params)
}
```

2. 在 `blog/app/components` 新增展示组件。
3. 展示组件只接收 props，不在组件内发起 sidebar 数据请求。

```vue
<script setup>
defineProps({
  yourDataList: {
    type: Array,
    default: () => []
  }
})
</script>
```

4. 在 `blog/app/utils/sidebar-block.js` 的 `SIDEBAR_BLOCK_DEFINITIONS` 增加一项。

```javascript
{
  type: 16,
  componentName: 'YourSidebarBlock',
  componentLoader: () => import('@/components/YourSidebarBlock.vue'),
  dataKey: 'yourDataList',
  propName: 'yourDataList',
  fetch: requestParams => getYourSidebarDataFetchApi(requestParams),
  read: response => readArrayResponse(response, 'yourDataList')
}
```

## 响应数据读取规则

1. 接口直接返回数组时使用 `readArrayResponse(response, 'yourDataList')`。
2. 接口返回 `{ list: [] }` 时使用 `readListPropertyResponse(response, 'yourDataList')`。
3. 不要在读取失败时返回空数组，应该让错误暴露出来，避免掩盖接口结构问题。

## 组件懒加载要求

1. `componentLoader` 必须使用 `() => import('@/components/YourSidebarBlock.vue')`。
2. 不要为了新增 type 在 `LayoutRightSidebar.vue` 中静态 import 展示组件。
3. `LayoutRightSidebar.vue` 会通过 `defineAsyncComponent` 加载 `componentLoader`，组件代码仍然按需加载。
4. sidebar 数据会在语言切换前统一预取，这是为了保证 UI 一次性切换，不等同于组件代码被提前加载。

## 多语言要求

1. 需要按语言切换的数据接口必须通过 `resolveSiteRequest(params)` 分流。
2. `fetch` 使用 `requestParams` 透传 `languageCode`。
3. 如果该类型只读取源站公共数据，`fetch` 可以忽略 `requestParams`。
4. 不要在展示组件内直接读取 `route.params.code` 发起 sidebar 数据请求。

## UI 要求

1. 展示组件需要处理空列表状态。
2. 展示组件需要保持移动端可用。
3. 展示组件需要适配暗黑模式。
4. 不要在面向用户的 UI 中写开发说明。

## 验证

1. 使用 VS Code 错误检查确认新增文件没有语法错误。
2. 在包含新 sidebar 类型的页面确认区块正常显示。
3. 切换语言时确认右侧栏不会先清空再逐块回填。
4. 切换途中连续点击语言切换入口时确认不会重复触发切换。
5. 使用浏览器返回、前进确认不会被旧语言请求覆盖 UI。
