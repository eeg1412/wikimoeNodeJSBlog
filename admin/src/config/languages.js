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

function assertValidLanguageConfigList(languageConfigList) {
  if (!Array.isArray(languageConfigList) || languageConfigList.length === 0) {
    throw new Error('LANGUAGE_CONFIG_LIST must be a non-empty array')
  }

  const languageCodeSet = new Set()
  let defaultLanguageConfig = null

  for (const languageConfig of languageConfigList) {
    if (!languageConfig || typeof languageConfig !== 'object') {
      throw new Error('Language config must be an object')
    }

    if (
      typeof languageConfig.code !== 'string' ||
      !languageConfig.code.trim()
    ) {
      throw new Error('Language config code is required')
    }

    if (languageCodeSet.has(languageConfig.code)) {
      throw new Error(`Duplicate language code: ${languageConfig.code}`)
    }

    if (
      typeof languageConfig.label !== 'string' ||
      !languageConfig.label.trim()
    ) {
      throw new Error(`Language label is required: ${languageConfig.code}`)
    }

    languageCodeSet.add(languageConfig.code)

    if (languageConfig.isDefault) {
      if (defaultLanguageConfig) {
        throw new Error('Only one default language is allowed')
      }

      defaultLanguageConfig = languageConfig
    }
  }

  if (!defaultLanguageConfig) {
    throw new Error('Default language config is required')
  }
}

assertValidLanguageConfigList(LANGUAGE_CONFIG_LIST)

const DEFAULT_LANGUAGE_CONFIG = LANGUAGE_CONFIG_LIST.find(languageConfig => {
  return languageConfig.isDefault
})

export const SUPPORTED_LANGUAGE_OPTIONS = LANGUAGE_CONFIG_LIST.map(
  languageConfig => {
    return {
      label: languageConfig.label,
      value: languageConfig.code
    }
  }
)

export const SUPPORTED_LANGUAGE_CODES = LANGUAGE_CONFIG_LIST.map(
  languageConfig => {
    return languageConfig.code
  }
)

export const DEFAULT_LANGUAGE_CODE = DEFAULT_LANGUAGE_CONFIG.code
