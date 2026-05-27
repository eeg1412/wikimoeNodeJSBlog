/**
 * Blog 支持的语言配置列表。
 * @type {Array<{code: string, label: string, isDefault?: boolean}>}
 */
export const LANGUAGE_CONFIG_LIST = [
  {
    code: 'zh-CN',
    label: '中国大陆简体中文',
    isDefault: true
  },
  {
    code: 'zh-SG',
    label: '新加坡简体中文'
  },
  {
    code: 'zh-HK',
    label: '香港繁體中文'
  },
  {
    code: 'zh-TW',
    label: '臺灣正體中文'
  },

  {
    code: 'ja-JP',
    label: '日本語'
  },
  {
    code: 'en-US',
    label: 'English'
  },
  {
    code: 'ko-KR',
    label: '한국어'
  }
]

/**
 * 每种语言目录都必须提供的语言模块名。
 * @type {string[]}
 */
export const REQUIRED_LANGUAGE_MODULE_NAMES = ['common', 'almanac', 'seeking']
