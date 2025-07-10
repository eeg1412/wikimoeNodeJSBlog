const http = require('http')
const crypto = require('crypto')

// 定义并发请求的数量
const CONCURRENT_REQUESTS = 1000
let requestCount = 0

// 创建一个函数来发送请求
function sendRequest() {
  // 生成一个随机字符串
  const randomString = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  console.log(
    `Sending request with query: ${randomString}, timestamp: ${timestamp}`
  )

  // 创建一个请求
  return new Promise((resolve, reject) => {
    http
      .get(
        `http://localhost:3007/?query=${randomString}&timestamp=${timestamp}`,
        res => {
          let data = ''
          res.on('data', chunk => (data += chunk))
          res.on('end', () => resolve(data))
        }
      )
      .on('error', reject)
  })
}

// 每10毫秒发送一次请求
const intervalId = setInterval(() => {
  if (requestCount >= CONCURRENT_REQUESTS) {
    clearInterval(intervalId)
  } else {
    sendRequest()
      .then(response => {
        // 请求成功
        console.log(`Request was successful.`)
      })
      .catch(error => {
        // 请求失败
        console.error(`Request failed: ${error.message}`)
      })
    requestCount++
  }
}, 300)
