#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

/**
 * 从.env文件读取环境变量
 */
function readEnvFile(envFilePath) {
  const envVars = {}
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
    return envVars
  } catch (error) {
    console.error(`[ERROR] 读取 ${envFilePath} 失败: ${error.message}`)
    return null
  }
}

/**
 * 从命令行环境变量读取NUXT_和NITRO_相关变量
 */
function readDockerEnvironmentVariables() {
  const envVars = {}
  const dockerVarExists = Object.keys(process.env).some(
    key => key.startsWith('NUXT_') || key === 'NITRO_PORT'
  )

  if (!dockerVarExists) {
    return null
  }

  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NUXT_') || key === 'NITRO_PORT') {
      envVars[key] = process.env[key]
    }
  })

  return envVars
}

/**
 * 加载环境变量
 * 优先级（只要读到一种就停止）:
 *   1. /blog/.env
 *   2. /build/.env
 *   3. 命令行环境变量
 * 如果都不存在则报错停止
 */
function loadEnvironmentVariables() {
  const envVars = {}
  let sourceType = null

  // 1. 检查 /blog/.env
  const blogEnvPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(blogEnvPath)) {
    const result = readEnvFile(blogEnvPath)
    if (result) {
      Object.assign(envVars, result)
      sourceType = '/blog/.env'
    }
  }

  // 2. 如果没有读到，检查 /build/.env
  if (!sourceType) {
    const buildEnvPath = path.join(__dirname, '.env')
    if (fs.existsSync(buildEnvPath)) {
      const result = readEnvFile(buildEnvPath)
      if (result) {
        Object.assign(envVars, result)
        sourceType = '/build/.env'
      }
    }
  }

  // 3. 如果还没有读到，检查命令行环境变量
  if (!sourceType) {
    const dockerVars = readDockerEnvironmentVariables()
    if (dockerVars) {
      Object.assign(envVars, dockerVars)
      sourceType = '命令行环境变量'
    }
  }

  // 4. 如果三种都不存在，报错停止
  if (!sourceType) {
    console.error('[ERROR] 无法找到环境变量配置源')
    console.error('[ERROR] 请确保以下其中之一存在:')
    console.error('  1. /blog/.env')
    console.error('  2. /build/.env')
    console.error('  3. 命令行环境变量 (NUXT_* 或 NITRO_PORT)')
    process.exit(1)
  }

  // 5. 检查必需的环境变量
  if (!envVars.NUXT_API_DOMAIN) {
    console.error('[ERROR] 缺少必需的环境变量: NUXT_API_DOMAIN')
    console.error('[ERROR] 请在配置源中设置 NUXT_API_DOMAIN')
    process.exit(1)
  }

  // 6. 设置到process.env中
  Object.keys(envVars).forEach(key => {
    process.env[key] = envVars[key]
  })

  return { envVars, sourceType }
}

/**
 * 启动应用
 */
function startApp() {
  const indexPath = path.join(__dirname, '.output', 'server', 'index.mjs')

  if (!fs.existsSync(indexPath)) {
    console.error(`[ERROR] 服务器入口文件不存在: ${indexPath}`)
    console.error('[ERROR] 请先运行 npm run build')
    process.exit(1)
  }

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
  const { envVars, sourceType } = loadEnvironmentVariables()

  console.log('[INFO] ========== 环境变量配置 ==========')
  console.log(`[INFO] 来源: ${sourceType}`)
  Object.keys(envVars).forEach(key => {
    console.log(`[INFO] ${key}=${envVars[key]}`)
  })
  console.log('[INFO] ========== 启动应用 ==========')

  startApp()
} catch (error) {
  console.error(`[ERROR] 启动器异常: ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}
