const http = require('http')
const https = require('https')

if (process.argv.length < 4) {
  console.log('Usage: node concurrent-test.js <url> <concurrency>')
  process.exit(1)
}

const url = process.argv[2]
const concurrency = parseInt(process.argv[3])

if (isNaN(concurrency) || concurrency <= 0) {
  console.log('Concurrency must be a positive integer')
  process.exit(1)
}

const parsedUrl = new URL(url)
const protocol = parsedUrl.protocol === 'https:' ? https : http

function makeRequest() {
  return new Promise((resolve, reject) => {
    const req = protocol.request(parsedUrl, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => resolve({ status: res.statusCode, data }))
    })
    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    req.end()
  })
}

async function runConcurrentTest() {
  console.log(
    `Starting concurrent test for ${url} with ${concurrency} requests`
  )
  const startTime = Date.now()

  const promises = []
  for (let i = 0; i < concurrency; i++) {
    promises.push(makeRequest())
  }

  const results = await Promise.allSettled(promises)
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
      console.log(`Request ${index + 1} failed: ${result.reason.message}`)
      failCount++
    }
  })

  console.log(`Test completed in ${duration}ms`)
  console.log(`Successful requests: ${successCount}/${concurrency}`)
  console.log(`Failed requests: ${failCount}/${concurrency}`)
}

runConcurrentTest()
