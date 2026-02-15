const tagUtils = require('../../../mongodb/utils/tags')
const bangumiUtils = require('../../../mongodb/utils/bangumis')
const movieUtils = require('../../../mongodb/utils/movies')
const gameUtils = require('../../../mongodb/utils/games')
const bookUtils = require('../../../mongodb/utils/books')
const postUtils = require('../../../mongodb/utils/posts')
const eventUtils = require('../../../mongodb/utils/events')
const voteUtils = require('../../../mongodb/utils/votes')
const mappointUtils = require('../../../mongodb/utils/mappoints')
const utils = require('../../../utils/utils')
const log4js = require('log4js')
const adminApiLog = log4js.getLogger('adminApi')

let nodejieba = null
try {
  nodejieba = require('nodejieba')
} catch (e) {
  console.warn('[analyzePostContent] nodejieba 未安装，将使用简易分词回退方案')
}

/**
 * 从文本中提取关键词
 * 使用 nodejieba 的 tag() 方法提取关键词和词性，
 * 过滤出名词、专有名词、动词等可能匹配的词。
 * 同时把原文中大于等于2字的连续中文片段作为补充。
 * 为了防止生僻作品名被错误切词，还会提取2-8字的n-gram。
 */
function extractKeywords(text) {
  if (!text || text.trim().length === 0) {
    return { keywords: [], fullText: '' }
  }

  // 清洗文本：去除 HTML 标签
  const cleanText = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanText) {
    return { keywords: [], fullText: '' }
  }

  const keywordSet = new Set()

  if (nodejieba) {
    // 使用 nodejieba.tag 获取带词性的分词结果
    const tagResult = nodejieba.tag(cleanText)
    // 保留的词性：n(名词), nr(人名), ns(地名), nt(机构团体), nz(其他专名),
    // nw(新词), vn(名动词), eng(英文), x(非语素字/标点, 用于保留特殊标题)
    const keepPOS = new Set([
      'n',
      'nr',
      'ns',
      'nt',
      'nz',
      'nw',
      'vn',
      'eng',
      'an',
      'ag',
      'ng',
      'tg',
      'i',
      'j',
      'l'
    ])
    for (const item of tagResult) {
      const word = item.word.trim()
      if (word.length >= 2 && keepPOS.has(item.tag)) {
        keywordSet.add(word)
      }
      // 保留所有长度 >= 3 的英文单词
      if (/^[a-zA-Z]{3,}$/i.test(word)) {
        keywordSet.add(word)
      }
    }

    // 使用 nodejieba.extract 取 TF-IDF 关键词作为补充，权重更高
    const extractResult = nodejieba.extract(cleanText, 30)
    for (const item of extractResult) {
      const word = item.word.trim()
      if (word.length >= 2) {
        keywordSet.add(word)
      }
    }
  } else {
    // 回退方案：简易中文分词 - 提取连续中文字符片段
    const cnMatches = cleanText.match(/[\u4e00-\u9fff]{2,}/g) || []
    cnMatches.forEach(m => keywordSet.add(m))
    // 提取英文单词
    const enMatches = cleanText.match(/[a-zA-Z]{3,}/g) || []
    enMatches.forEach(m => keywordSet.add(m))
  }

  // 提取文本中的 n-gram（2~6字的中文片段），用于匹配生僻作品名
  const chineseSegments = cleanText.match(/[\u4e00-\u9fff]+/g) || []
  for (const seg of chineseSegments) {
    // 只对较长的连续中文做 n-gram 拆分
    if (seg.length >= 2 && seg.length <= 10) {
      // 短片段直接加为关键词
      keywordSet.add(seg)
    } else if (seg.length > 10) {
      // 长片段提取 2~6 字的 n-gram
      for (let len = 2; len <= Math.min(6, seg.length); len++) {
        for (let i = 0; i <= seg.length - len; i++) {
          keywordSet.add(seg.substring(i, i + len))
        }
      }
    }
  }

  // 过滤掉过于常见的停用词
  const stopWords = new Set([
    '的',
    '了',
    '在',
    '是',
    '我',
    '有',
    '和',
    '就',
    '不',
    '人',
    '都',
    '一',
    '一个',
    '上',
    '也',
    '很',
    '到',
    '说',
    '要',
    '去',
    '你',
    '会',
    '着',
    '没有',
    '看',
    '好',
    '自己',
    '这',
    '他',
    '她',
    '它',
    '我们',
    '他们',
    '她们',
    '你们',
    '什么',
    '没',
    '那',
    '这个',
    '那个',
    '还',
    '可以',
    '所以',
    '因为',
    '但是',
    '如果',
    '虽然',
    '一些',
    '这些',
    '那些',
    '已经',
    '然后',
    '而且',
    '或者',
    '非常',
    '比较',
    '觉得',
    '知道',
    '这样',
    '那样',
    '怎么',
    '为什么',
    '时候',
    '大家',
    '现在',
    '今天',
    '明天',
    '昨天',
    '以后',
    '以前',
    '所有',
    '其他',
    '关于',
    '通过',
    '进行',
    '使用',
    '其中',
    '可能',
    '需要',
    '应该',
    '正在',
    '开始',
    '如何',
    '只是',
    '之后',
    '之前',
    '一下',
    '一些',
    '起来',
    '出来',
    '过来',
    '下去',
    '下来'
  ])

  const keywords = Array.from(keywordSet).filter(w => !stopWords.has(w))

  return { keywords, fullText: cleanText }
}

/**
 * 将关键词列表转为 MongoDB $or 正则查询条件
 * 为了提高性能，限制关键词数量并使用 $or 代替 $regex 多条件
 */
function buildRegexConditions(keywords, field, maxKeywords = 50) {
  // 取前 maxKeywords 个关键词，并按长度降序排列（长词优先匹配更精确）
  const sortedKeywords = keywords
    .sort((a, b) => b.length - a.length)
    .slice(0, maxKeywords)

  return sortedKeywords.map(kw => ({
    [field]: new RegExp(utils.escapeSpecialChars(kw), 'i')
  }))
}

/**
 * 计算匹配度得分
 * 根据标题/名称与关键词的匹配程度来排序结果
 */
function calculateMatchScore(name, keywords) {
  if (!name) return 0
  let score = 0
  const lowerName = name.toLowerCase()
  for (const kw of keywords) {
    const lowerKw = kw.toLowerCase()
    if (lowerName === lowerKw) {
      score += 100 // 完全匹配
    } else if (lowerName.includes(lowerKw)) {
      score += 10 + lowerKw.length // 包含匹配，词越长分越高
    }
  }
  return score
}

module.exports = async function (req, res, next) {
  try {
    let { title, content, excerpt, type, postId } = req.body

    // 参数校验
    if (!title && !content && !excerpt) {
      res.status(400).json({
        errors: [{ message: '至少需要提供标题、内容或摘要之一' }]
      })
      return
    }

    type = Number(type) || 1

    // 合并所有文本内容进行分析
    const textParts = []
    if (title) textParts.push(title)
    if (excerpt) textParts.push(excerpt)
    if (content) textParts.push(content)
    const combinedText = textParts.join(' ')

    // 提取关键词
    const { keywords } = extractKeywords(combinedText)

    if (keywords.length === 0) {
      res.send({
        data: {
          tags: { existing: [], suggested: [] },
          mappoints: [],
          bangumis: [],
          movies: [],
          games: [],
          books: [],
          posts: [],
          tweets: [],
          events: [],
          votes: []
        }
      })
      return
    }

    // 并行查询所有集合
    const maxResults = 20 // 每类最多返回20条
    const projection = { __v: 0 } // 排除版本字段

    // 构建各集合的查询 Promise
    const promises = {}

    // 1. 标签查询 - 搜索已有标签
    const tagConditions = buildRegexConditions(keywords, 'tagname')
    if (tagConditions.length > 0) {
      promises.tags = tagUtils.find(
        { $or: tagConditions },
        { lastusetime: -1 },
        { _id: 1, tagname: 1, lastusetime: 1 }
      )
    } else {
      promises.tags = Promise.resolve([])
    }

    // 2. 地点查询
    const mappointConditions = buildRegexConditions(keywords, 'title')
    if (mappointConditions.length > 0) {
      promises.mappoints = mappointUtils.find(
        { $or: mappointConditions },
        { _id: -1 },
        { _id: 1, title: 1, summary: 1, status: 1 }
      )
    } else {
      promises.mappoints = Promise.resolve([])
    }

    // 3. 番剧查询
    const bangumiConditions = buildRegexConditions(keywords, 'title')
    if (bangumiConditions.length > 0) {
      promises.bangumis = bangumiUtils.find(
        { $or: bangumiConditions },
        { _id: -1 },
        {
          _id: 1,
          title: 1,
          summary: 1,
          rating: 1,
          year: 1,
          season: 1,
          status: 1,
          label: 1
        }
      )
    } else {
      promises.bangumis = Promise.resolve([])
    }

    // 4. 电影查询
    const movieConditions = buildRegexConditions(keywords, 'title')
    if (movieConditions.length > 0) {
      promises.movies = movieUtils.find(
        { $or: movieConditions },
        { _id: -1 },
        {
          _id: 1,
          title: 1,
          summary: 1,
          rating: 1,
          year: 1,
          status: 1,
          label: 1
        }
      )
    } else {
      promises.movies = Promise.resolve([])
    }

    // 5. 游戏查询
    const gameConditions = buildRegexConditions(keywords, 'title')
    if (gameConditions.length > 0) {
      promises.games = gameUtils.find(
        { $or: gameConditions },
        { _id: -1 },
        { _id: 1, title: 1, summary: 1, rating: 1, status: 1, label: 1 }
      )
    } else {
      promises.games = Promise.resolve([])
    }

    // 6. 书籍查询
    const bookConditions = buildRegexConditions(keywords, 'title')
    if (bookConditions.length > 0) {
      promises.books = bookUtils.find(
        { $or: bookConditions },
        { _id: -1 },
        { _id: 1, title: 1, summary: 1, rating: 1, status: 1, label: 1 }
      )
    } else {
      promises.books = Promise.resolve([])
    }

    // 7. 博文查询 (type=1)
    const postTitleConditions = buildRegexConditions(keywords, 'title')
    if (postTitleConditions.length > 0) {
      const postFilter = {
        $or: postTitleConditions,
        type: 1,
        status: { $ne: 99 }
      }
      if (postId) {
        postFilter._id = { $ne: postId }
      }
      promises.posts = postUtils.find(
        postFilter,
        { date: -1 },
        { _id: 1, title: 1, excerpt: 1, date: 1, status: 1 }
      )
    } else {
      promises.posts = Promise.resolve([])
    }

    // 8. 推文查询 (type=2)
    const tweetExcerptConditions = buildRegexConditions(keywords, 'excerpt')
    const tweetTitleConditions = buildRegexConditions(keywords, 'title')
    const tweetAllConditions = [
      ...tweetExcerptConditions,
      ...tweetTitleConditions
    ]
    if (tweetAllConditions.length > 0) {
      const tweetFilter = {
        $or: tweetAllConditions,
        type: 2,
        status: { $ne: 99 }
      }
      if (postId) {
        tweetFilter._id = { $ne: postId }
      }
      promises.tweets = postUtils.find(
        tweetFilter,
        { date: -1 },
        { _id: 1, title: 1, excerpt: 1, date: 1, status: 1 }
      )
    } else {
      promises.tweets = Promise.resolve([])
    }

    // 9. 活动查询
    const eventConditions = buildRegexConditions(keywords, 'title')
    if (eventConditions.length > 0) {
      promises.events = eventUtils.find(
        { $or: eventConditions },
        { startTime: -1 },
        { _id: 1, title: 1, startTime: 1, endTime: 1, status: 1 }
      )
    } else {
      promises.events = Promise.resolve([])
    }

    // 10. 投票查询
    const voteConditions = buildRegexConditions(keywords, 'title')
    if (voteConditions.length > 0) {
      promises.votes = voteUtils.find(
        { $or: voteConditions },
        { _id: -1 },
        { _id: 1, title: 1, votes: 1, status: 1 }
      )
    } else {
      promises.votes = Promise.resolve([])
    }

    // 并行执行所有查询
    const keys = Object.keys(promises)
    const values = await Promise.all(Object.values(promises))
    const results = {}
    keys.forEach((key, index) => {
      results[key] = values[index] || []
    })

    // 对结果排序并截取
    const sortByScore = (list, nameField) => {
      return list
        .map(item => {
          const obj = item.toJSON ? item.toJSON() : item
          obj._matchScore = calculateMatchScore(obj[nameField], keywords)
          return obj
        })
        .sort((a, b) => b._matchScore - a._matchScore)
        .slice(0, maxResults)
    }

    // 处理标签结果
    const existingTags = sortByScore(results.tags, 'tagname')

    // 生成新标签建议：从关键词中挑选不在已有标签中的词
    const existingTagNames = new Set(
      (results.tags || []).map(t => (t.tagname || '').toLowerCase())
    )
    // 使用 nodejieba.extract 的高权重关键词来建议新标签
    let suggestedNewTags = []
    if (nodejieba) {
      const extractResult = nodejieba.extract(combinedText, 20)
      suggestedNewTags = extractResult
        .filter(item => {
          const word = item.word.trim()
          return (
            word.length >= 2 &&
            !existingTagNames.has(word.toLowerCase()) &&
            !/^[\d\s]+$/.test(word) // 过滤纯数字
          )
        })
        .map(item => ({
          tagname: item.word.trim(),
          weight: Math.round(item.weight * 100) / 100,
          isNew: true
        }))
        .slice(0, 15)
    } else {
      // 回退方案
      suggestedNewTags = keywords
        .filter(kw => kw.length >= 2 && !existingTagNames.has(kw.toLowerCase()))
        .slice(0, 15)
        .map(kw => ({
          tagname: kw,
          weight: 0,
          isNew: true
        }))
    }

    const responseData = {
      tags: {
        existing: existingTags.slice(0, maxResults),
        suggested: suggestedNewTags
      },
      mappoints: sortByScore(results.mappoints, 'title').slice(0, maxResults),
      bangumis: sortByScore(results.bangumis, 'title').slice(0, maxResults),
      movies: sortByScore(results.movies, 'title').slice(0, maxResults),
      games: sortByScore(results.games, 'title').slice(0, maxResults),
      books: sortByScore(results.books, 'title').slice(0, maxResults),
      posts: sortByScore(results.posts, 'title').slice(0, maxResults),
      tweets: sortByScore(results.tweets, 'excerpt').slice(0, maxResults),
      events: sortByScore(results.events, 'title').slice(0, maxResults),
      votes: sortByScore(results.votes, 'title').slice(0, maxResults)
    }

    res.send({
      data: responseData
    })
  } catch (err) {
    adminApiLog.error(err)
    res.status(500).json({
      errors: [{ message: '分析内容时发生错误' }]
    })
  }
}
