import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 尝试从上一级目录读取 .env，如果不存在则从当前目录读取
const parentEnvPath = path.resolve(__dirname, '../.env')
const currentEnvPath = path.resolve(__dirname, '.env')

let envPath = ''
if (fs.existsSync(parentEnvPath)) {
  envPath = parentEnvPath
  console.log('使用上一级目录的 .env 文件:', parentEnvPath)
} else if (fs.existsSync(currentEnvPath)) {
  envPath = currentEnvPath
  console.log('使用当前目录的 .env 文件:', currentEnvPath)
} else {
  console.error('错误: 未找到 .env 文件!')
  console.error('已尝试以下路径:')
  console.error('  -', parentEnvPath)
  console.error('  -', currentEnvPath)
  process.exit(1)
}

// 读取并解析 .env 文件
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  line = line.trim()
  // 跳过空行和注释
  if (!line || line.startsWith('#')) return

  const equalIndex = line.indexOf('=')
  if (equalIndex > 0) {
    const key = line.substring(0, equalIndex).trim()
    let value = line.substring(equalIndex + 1).trim()

    // 移除引号（如果有）
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    envVars[key] = value
    process.env[key] = value
  }
})

console.log('已加载环境变量:', Object.keys(envVars).join(', '))
console.log('')

// 导入并启动服务器
import('./.output/server/index.mjs')
