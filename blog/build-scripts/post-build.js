import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// nitro.mjs 文件路径
const nitroFilePath = path.resolve(
  __dirname,
  '../build/.output/server/chunks/_/nitro.mjs'
)

console.log('开始处理 nitro.mjs 文件...')
console.log('文件路径:', nitroFilePath)

// 检查文件是否存在
if (!fs.existsSync(nitroFilePath)) {
  console.error('错误: nitro.mjs 文件不存在!')
  process.exit(1)
}

// 读取文件内容
let content = fs.readFileSync(nitroFilePath, 'utf-8')

// 定义需要替换的环境变量占位符
const envReplacements = {
  __NUXT_ENV_API_DOMAIN__: 'process.env.NUXT_API_DOMAIN',
  __NUXT_ENV_SWR_CACHE_MAXAGE__: 'Number(process.env.SWR_CACHE_MAXAGE || 10)',
  __NUXT_ENV_SWR_CACHE_STALEMAXAGE__:
    'Number(process.env.SWR_CACHE_STALEMAXAGE || 3600)',
  __NUXT_ENV_CACHE_MAX_PAGE__: 'Number(process.env.CACHE_MAX_PAGE || 10)',
  __NUXT_ENV_CACHE_TTL__: 'Number(process.env.CACHE_TTL || 60000)'
}

// 执行替换
let replacementCount = 0
for (const [placeholder, envVar] of Object.entries(envReplacements)) {
  // 使用正则表达式全局替换，支持字符串中的占位符
  const regex = new RegExp(`"${placeholder}"`, 'g')
  const matches = content.match(regex)
  if (matches) {
    content = content.replace(regex, envVar)
    const count = matches.length
    replacementCount += count
    console.log(`✓ 替换 ${placeholder}: ${count} 处`)
  }
}

// 特殊处理：替换路径字符串中的 API_DOMAIN 占位符
// 例如: "__NUXT_ENV_API_DOMAIN__/rss" => process.env.NUXT_API_DOMAIN + "/rss"
const apiDomainRegex = /"__NUXT_ENV_API_DOMAIN__([^"]*)"/g
const apiDomainMatches = content.match(apiDomainRegex)
if (apiDomainMatches) {
  content = content.replace(
    apiDomainRegex,
    (match, path) => `process.env.NUXT_API_DOMAIN + "${path}"`
  )
  console.log(
    `✓ 替换 __NUXT_ENV_API_DOMAIN__ 路径: ${apiDomainMatches.length} 处`
  )
  replacementCount += apiDomainMatches.length
}

// 写回文件
fs.writeFileSync(nitroFilePath, content, 'utf-8')

console.log(`\n完成! 共替换 ${replacementCount} 处环境变量占位符`)
console.log('nitro.mjs 已更新为使用动态环境变量\n')
