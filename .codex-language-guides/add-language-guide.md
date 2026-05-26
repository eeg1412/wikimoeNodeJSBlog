# 新增语言手顺书

本文面向 `wikimoeNodeJSBlog`。项目的语言支持是代码配置，不是后台动态创建语言；新增语言后需要按项目部署流程重新发布相关端。

## 1. 语言配置入口

新增语言时必须同步维护以下三处语言表，三端的 `code`、`label`、顺序和默认语言必须一致：

- `blog/shared/languages.js`
- `admin/src/config/languages.js`
- `server/config/languages.js`

只新增语言时不要修改代码配置里的 `isDefault: true`。Blog 运行时默认语言优先使用 `/api/blog/options` 返回的 `siteDefaultLanguage`；options 不可用或配置值无效时，才使用代码配置里唯一的 `isDefault: true` 作为兜底。

如果后台把 `siteDefaultLanguage` 设置为新语言，该语言只影响无 code 源站路由 `/` 的默认展示语言和语言包兜底。任何 `/<language-code>` 都属于多语言站路由，即使该 code 等于 `siteDefaultLanguage`，options、导航、侧边栏和内容接口也必须走 `/api/multilingual-blog` 并保留 `languageCode`。

## 2. Blog 语言包

在 `blog/shared/languages.js` 的 `LANGUAGE_CONFIG_LIST` 中追加语言后，必须新增对应语言目录：

- `blog/app/lang/<language-code>/common.js`
- `blog/app/lang/<language-code>/almanac.js`
- `blog/app/lang/<language-code>/seeking.js`

`REQUIRED_LANGUAGE_MODULE_NAMES` 决定每个语言目录必须提供的模块。除非整个项目决定新增语言包模块，否则不要修改它。

## 3. Admin 语言表

在 `admin/src/config/languages.js` 中追加同一条语言配置。管理端“设置 / 多语言设置”的默认站点语言选项来自这里。

新增语言后检查：

- 设置页“多语言设置”tab 中出现新语言。
- 默认站点语言可以选择新语言。
- 评论列表中的“语言code”能够显示新语言 code 对应的语言标签。
- 设置页“邮件设置 / 通知评论者模板”中出现新语言 tab，并可保存该语言的回复通知模板。
- 小屏设备上表单标签、选择框和提交按钮不重叠。

## 4. Server 语言表

在 `server/config/languages.js` 中追加同一条语言配置。服务端会用该表校验 `siteDefaultLanguage`，无效语言码会被拒绝保存。

新增语言后检查：

- `siteDefaultLanguage` 可以保存为新语言码。
- `/api/blog/options` 返回的 `siteDefaultLanguage` 与后台保存值一致。
- `/api/blog/options` 返回 `siteEnableMultilingual`。
- 当 `siteDefaultLanguage` 设置为新语言时，访问 `/` 应继续使用 `/api/blog` 主站接口；访问 `/<language-code>` 应请求对应语言的多语言 options、导航和侧边栏接口。
- `/api/blog/comment/create` 接受新语言 code 作为 `siteLangCode`，并拒绝不在语言表内的 code。
- `emailSendToCommenterTemplateMultilingualList` 中应能保存新语言 code 对应的标题和模板项。
- 回复评论邮件中的站点链接和文章链接在 `siteLangCode` 为新语言 code 时使用主站 `siteUrl` 下的 `/<language-code>`、`/<language-code>/post/<post-alias-or-id>` 或 `/<language-code>/page/<post-alias-or-id>`；文章 URL 优先使用别名，没有别名时使用当前文章自身 ID。
- 回复评论邮件只使用 `MULTILINGUAL_DOMAIN` 拉取多语言文章详情和 options 接口，不应把该 API 域名写入面向用户的邮件链接。

## 5. 校验原则

不要通过兜底掩盖缺失语言文件或未同步语言表。当前语言系统会主动校验默认语言、重复语言码、缺失语言目录和缺失语言模块；发现错误时应修正配置和语言包。

不要通过 build 作为代码正确性的主要校验方式。按项目规范优先使用编辑器诊断、静态阅读和局部接口检查。
