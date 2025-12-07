const http = require('http')
const https = require('https')
const crypto = require('crypto')

if (process.argv.length < 4) {
  console.log('Usage: node random-param-test.js <url> <testCount> [interval]')
  process.exit(1)
}

const baseUrl = process.argv[2]
const testCount = parseInt(process.argv[3])
const interval = parseInt(process.argv[4]) || 0

if (isNaN(testCount) || testCount <= 0) {
  console.log('Test count must be a positive integer')
  process.exit(1)
}

if (isNaN(interval) || interval < 0) {
  console.log('Interval must be a non-negative integer')
  process.exit(1)
}

function generateRandomString(length = 10) {
  return crypto.randomBytes(length).toString('hex').substring(0, length)
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const protocol = parsedUrl.protocol === 'https:' ? https : http

    const req = protocol.request(parsedUrl, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => resolve({ status: res.statusCode, url, data }))
    })
    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    req.end()
  })
}

async function runRandomParamTest() {
  console.log(
    `Starting random parameter test for ${baseUrl} with ${testCount} requests${
      interval > 0 ? ` and ${interval}ms interval` : ''
    }`
  )
  const startTime = Date.now()

  const promiseList = []
  for (let i = 0; i < testCount; i++) {
    // Generate random query parameters
    const params = []
    const paramCount = Math.floor(Math.random() * 5) + 1 // 1 to 5 params
    for (let j = 0; j < paramCount; j++) {
      const key = generateRandomString(5)
      const value = generateRandomString(10)
      params.push(`${key}=${value}`)
    }
    const queryString = params.join('&')
    const testUrl = `${baseUrl}?${queryString}`

    const p = new Promise(resolve => {
      setTimeout(() => {
        makeRequest(testUrl).then(resolve)
      }, i * interval)
    })
    promiseList.push(p)
  }

  const results = await Promise.allSettled(promiseList)
  const endTime = Date.now()
  const duration = endTime - startTime

  let successCount = 0
  let failCount = 0
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.status === 200) {
        successCount++
      } else {
        console.log(
          `Request ${index + 1} failed with status ${result.value.status}`
        )
        failCount++
      }
    } else {
      console.log(`Request ${index + 1} error: ${result.reason.message}`)
      failCount++
    }
  })

  console.log(`Test completed in ${duration}ms.`)
  console.log(`Successful requests: ${successCount}`)
  console.log(`Failed requests: ${failCount}`)
}

runRandomParamTest()
