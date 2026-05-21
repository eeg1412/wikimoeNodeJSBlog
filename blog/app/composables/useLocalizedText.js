import { formatDate } from '@/utils'

/**
 * 将数值评分映射到语言包中的评分等级键。
 * @param {number} rating 数值评分。
 * @returns {string} 评分等级键名。
 */
function resolveRatingLevel(rating) {
  if (rating >= 90) return 'masterpiece'
  if (rating >= 80) return 'excellent'
  if (rating >= 70) return 'good'
  if (rating >= 60) return 'okay'
  if (rating >= 50) return 'poor'
  if (rating >= 40) return 'bad'
  if (rating >= 30) return 'terrible'
  if (rating >= 20) return 'awful'
  if (rating >= 10) return 'confused'
  return 'none'
}

/**
 * 提供时间、数字、评分等展示文本的本地化工具。
 * @returns {object} 本地化文本工具集合。
 */
export function useLocalizedText() {
  const { languageCode, t } = useLang()

  /**
   * 去掉紧凑数字中的无意义小数位。
   * @param {number} value 需要紧凑显示的数字。
   * @returns {string} 去掉无意义小数位后的字符串。
   */
  const formatCompactValue = value => {
    const compactValue = value.toFixed(1)
    return compactValue.endsWith('.0')
      ? compactValue.slice(0, compactValue.length - 2)
      : compactValue
  }

  /**
   * 将日期格式化为相对时间文案。
   * @param {Date|string|number} date 日期值。
   * @param {string} [fmt='yyyy-MM-dd hh:mm:ss'] 超出相对时间范围时使用的格式。
   * @returns {string} 本地化相对时间文案或格式化日期字符串。
   */
  const fromNowText = (date, fmt = 'yyyy-MM-dd hh:mm:ss') => {
    const normalizedDate = new Date(date)
    const now = Date.now()

    if (now < Number(normalizedDate)) {
      return formatDate(normalizedDate, fmt)
    }

    const diff = (now - Number(normalizedDate)) / 1000

    if (diff <= 1) {
      return t('common.time.justNow')
    }

    if (diff < 60) {
      return t('common.time.secondsAgo', {
        count: Math.floor(diff)
      })
    }

    if (diff < 60 * 60) {
      return t('common.time.minutesAgo', {
        count: Math.floor(diff / 60)
      })
    }

    if (diff < 60 * 60 * 24) {
      return t('common.time.hoursAgo', {
        count: Math.floor(diff / 60 / 60)
      })
    }

    if (diff < 60 * 60 * 24 * 30) {
      return t('common.time.daysAgo', {
        count: Math.floor(diff / 60 / 60 / 24)
      })
    }

    return formatDate(normalizedDate, fmt)
  }

  /**
   * 将评分数值格式化为当前语言的评分等级文案。
   * @param {number} rating 数值评分。
   * @returns {string} 当前语言的评分等级文案。
   */
  const ratingText = rating => {
    return t(`common.rating.level.${resolveRatingLevel(rating)}`)
  }

  /**
   * 按当前语言格式化大数字。
   * @param {number|string} num 需要格式化的数字或数字字符串。
   * @returns {string|number} 本地化数字字符串；无法转换为数字时返回原值。
   */
  const formatNumberText = num => {
    const value = Number(num)
    if (Number.isNaN(value)) {
      return num
    }

    if (languageCode.value === 'en-US') {
      if (value < 1000) {
        return value
      }
      if (value < 1000000) {
        return `${formatCompactValue(value / 1000)}K`
      }
      if (value < 1000000000) {
        return `${formatCompactValue(value / 1000000)}M`
      }
      return `${formatCompactValue(value / 1000000000)}B`
    }

    const tenThousandUnit =
      languageCode.value === 'zh-HK' || languageCode.value === 'zh-TW'
        ? '萬'
        : '万'
    const hundredMillionUnit =
      languageCode.value === 'zh-HK' ||
      languageCode.value === 'zh-TW' ||
      languageCode.value === 'ja-JP'
        ? '億'
        : '亿'

    if (value < 10000) {
      return value
    }
    if (value < 100000000) {
      return `${formatCompactValue(value / 10000)}${tenThousandUnit}`
    }
    return `${formatCompactValue(value / 100000000)}${hundredMillionUnit}`
  }

  /**
   * 将季度编号转换为当前语言的季度名称。
   * @param {number|undefined} season 季度编号。
   * @returns {string|number|undefined} 本地化季度名称；未知编号返回原值。
   */
  const seasonName = season => {
    switch (season) {
      case 1:
        return t('common.season.winter')
      case 2:
        return t('common.season.spring')
      case 3:
        return t('common.season.summer')
      case 4:
        return t('common.season.autumn')
      case -1:
      case undefined:
        return t('common.season.all')
      default:
        return season
    }
  }

  /**
   * 计算 ACG 条目的游玩、阅读或观看持续时间文案。
   * @param {Date|string|number} startTime 开始时间。
   * @param {Date|string|number} [endTime] 结束时间；不传时使用当前时间。
   * @returns {string} 本地化持续时间文案。
   */
  const acgDurationText = (startTime, endTime) => {
    const start = new Date(startTime).getTime()
    const end = endTime ? new Date(endTime).getTime() : Date.now()
    const diff = end - start
    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24
    const week = day * 7
    const month = day * 30
    const year = day * 365

    if (diff < hour) {
      return t('common.duration.minute', {
        count: Math.floor(diff / minute)
      })
    }

    if (diff < day) {
      return t('common.duration.hour', {
        count: Math.floor(diff / hour)
      })
    }

    if (diff < week) {
      return t('common.duration.day', {
        count: Math.floor(diff / day)
      })
    }

    if (diff < month) {
      const weeks = Math.floor(diff / week)
      const days = Math.floor((diff % week) / day)
      if (!days) {
        return t('common.duration.week', { count: weeks })
      }
      return t('common.duration.weekDay', { weeks, days })
    }

    if (diff < year) {
      const months = Math.floor(diff / month)
      const days = Math.floor((diff % month) / day)
      if (!days) {
        return t('common.duration.month', { count: months })
      }
      return t('common.duration.monthDay', { months, days })
    }

    const years = Math.floor(diff / year)
    const months = Math.floor((diff % year) / month)
    if (!months) {
      return t('common.duration.year', { count: years })
    }
    return t('common.duration.yearMonth', { years, months })
  }

  /**
   * 复制文本到剪贴板，并按当前语言提示结果。
   * @param {string} text 要复制的文本。
   * @param {any} [toast] 通知实例。
   * @param {{ timeout?: number }} [options={}] 可选配置。
   * @returns {Promise<boolean>} 成功返回 true，失败返回 false。
   */
  const copyText = async (text, toast, options = {}) => {
    const timeout = options.timeout ?? 10000

    try {
      if (!import.meta.client || !navigator?.clipboard) {
        throw new Error('CLIPBOARD_UNAVAILABLE')
      }

      await navigator.clipboard.writeText(text)

      if (!toast) {
        return true
      }

      toast.add({
        title: t('common.clipboard.copySuccess'),
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout
      })

      return true
    } catch (error) {
      if (!toast) {
        return false
      }

      toast.add({
        title: t('common.clipboard.copyFailed'),
        icon: 'i-heroicons-x-circle',
        color: 'red',
        timeout
      })

      return false
    }
  }

  return {
    acgDurationText,
    copyText,
    formatNumberText,
    fromNowText,
    ratingText,
    seasonName
  }
}
