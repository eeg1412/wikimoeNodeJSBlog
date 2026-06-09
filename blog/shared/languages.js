/**
 * Blog 支持的语言配置列表。
 * @type {Array<{code: string, label: string, isDefault?: boolean}>}
 */
export const LANGUAGE_CONFIG_LIST = [
  {
    code: 'zh-CN',
    label: '简体中文（中国）',
    isDefault: true
  },
  {
    code: 'zh-SG',
    label: '简体中文（新加坡）'
  },
  {
    code: 'zh-HK',
    label: '繁體中文（香港特別行政區）'
  },
  {
    code: 'zh-TW',
    label: '繁體中文（台灣）'
  },

  {
    code: 'ja-JP',
    label: '日本語 (日本)'
  },
  {
    code: 'en-US',
    label: 'English (United States)'
  },
  {
    code: 'ko-KR',
    label: '한국어(대한민국)'
  },
  {
    code: 'th-TH',
    label: 'ไทย (ประเทศไทย)'
  },
  {
    code: 'vi-VN',
    label: 'Tiếng Việt (Việt Nam)'
  },
  {
    code: 'id-ID',
    label: 'Bahasa Indonesia (Indonesia)'
  },
  {
    code: 'fr-FR',
    label: 'Français (France)'
  },
  {
    code: 'de-DE',
    label: 'Deutsch (Deutschland)'
  },
  {
    code: 'es-ES',
    label: 'Español (España)'
  },
  {
    code: 'pt-PT',
    label: 'Português (Portugal)'
  }
]

/**
 * 每种语言目录都必须提供的语言模块名。
 * @type {string[]}
 */
export const REQUIRED_LANGUAGE_MODULE_NAMES = ['common', 'almanac', 'seeking']
