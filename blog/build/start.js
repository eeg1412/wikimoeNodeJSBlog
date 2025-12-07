#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

/**
 * 加载环境变量
 * 优先级: Docker环境变量 > .env文件
 */
function loadEnvironmentVariables() {
  const envVars = {}
  const envFilePath = path.join(__dirname, '..', '.env')

  // 1. 先读取.env文件（如果存在）
  if (fs.existsSync(envFilePath)) {
    try {
      const envContent = fs.readFileSync(envFilePath, 'utf-8')
      const lines = envContent.split('\n')

      lines.forEach(line => {
        line = line.trim()
        // 跳过空行和注释
        if (!line || line.startsWith('#')) return

        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
          let key = match[1].trim()
          let value = match[2].trim()

          // 去掉引号
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1)
          }

          envVars[key] = value
        }
      })
      console.log('[INFO] 从 .env 文件加载环境变量')
    } catch (error) {
      console.error(`[ERROR] 读取 .env 文件失败: ${error.message}`)
    }
  }

  // 2. Docker环境变量覆盖.env文件中的值
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NUXT_') || key === 'NITRO_PORT') {
      envVars[key] = process.env[key]
    }
  })

  // 3. 设置到process.env中
  Object.keys(envVars).forEach(key => {
    process.env[key] = envVars[key]
  })

  return envVars
}

/**
 * 启动应用
 */
function startApp(envVars) {
  const indexPath = path.join(__dirname, '.output', 'server', 'index.mjs')

  if (!fs.existsSync(indexPath)) {
    console.error(`[ERROR] 服务器入口文件不存在: ${indexPath}`)
    console.error('[ERROR] 请先运行 npm run build')
    process.exit(1)
  }

  console.log('[INFO] ========== 环境变量配置 ==========')
  Object.keys(envVars).forEach(key => {
    console.log(`[INFO] ${key}=${envVars[key]}`)
  })
  console.log('[INFO] ========== 启动应用 ==========')

  const child = spawn('node', [indexPath], {
    stdio: 'inherit',
    env: process.env
  })

  child.on('error', error => {
    console.error(`[ERROR] 启动失败: ${error.message}`)
    process.exit(1)
  })

  child.on('exit', code => {
    process.exit(code)
  })
}

// 主程序
try {
  const envVars = loadEnvironmentVariables()

  console.log('[INFO] ========== 环境变量配置 ==========')
  Object.keys(envVars).forEach(key => {
    console.log(`[INFO] ${key}=${envVars[key]}`)
  })

  startApp(envVars)
} catch (error) {
  console.error(`[ERROR] 启动器异常: ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}
