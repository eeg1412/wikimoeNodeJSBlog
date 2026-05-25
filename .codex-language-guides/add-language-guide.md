# 新增语言手顺书

本文面向 `wikimoeNodeJSBlog`。项目的语言支持是代码配置，不是后台动态创建语言；新增语言后需要按项目部署流程重新发布相关端。

## 1. 语言配置入口

新增语言时必须同步维护以下三处语言表，三端的 `code`、`label`、顺序和默认语言必须一致：

- `blog/shared/languages.js`
- `admin/src/config/languages.js`
- `server/config/languages.js`

只新增语言时不要修改代码配置里的 `isDefault: true`。Blog 运行时默认语言优先使用 `/api/blog/options` 返回的 `siteDefaultLanguage`；options 不可用或配置值无效时，才使用代码配置里唯一的 `isDefault: true` 作为兜底。

如果后台把 `siteDefaultLanguage` 设置为新语言，该语言就是主站语言。无论访问 `/` 还是 `/<language-code>`，主站语言相关的 options、导航和侧边栏都应走 `/api/blog` 主站接口；只有非主站语言才走 `/api/multilingual-blog` 多语言接口。

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
- 小屏设备上表单标签、选择框和提交按钮不重叠。

## 4. Server 语言表

在 `server/config/languages.js` 中追加同一条语言配置。服务端会用该表校验 `siteDefaultLanguage`，无效语言码会被拒绝保存。

新增语言后检查：

- `siteDefaultLanguage` 可以保存为新语言码。
- `/api/blog/options` 返回的 `siteDefaultLanguage` 与后台保存值一致。
- `/api/blog/options` 返回 `siteEnableMultilingual`。
- 当 `siteDefaultLanguage` 设置为新语言时，访问 `/<language-code>` 不应请求对应语言的多语言 options、导航和侧边栏接口。
- `/api/blog/comment/create` 接受新语言 code 作为 `siteLangCode`，并拒绝不在语言表内的 code。
- 回复评论邮件中的文章链接在 `siteLangCode` 为新语言 code 时使用 `/<language-code>/post/<post-id>` 或 `/<language-code>/page/<post-id>`。

## 5. 校验原则

不要通过兜底掩盖缺失语言文件或未同步语言表。当前语言系统会主动校验默认语言、重复语言码、缺失语言目录和缺失语言模块；发现错误时应修正配置和语言包。

不要通过 build 作为代码正确性的主要校验方式。按项目规范优先使用编辑器诊断、静态阅读和局部接口检查。
