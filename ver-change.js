const { execSync } = require('child_process')

// 获取命令行参数中的版本号
const newVersion = process.argv[2]

if (!newVersion) {
  console.error('请指定新版本号，例如: yarn run ver-change 0.1.0')
  process.exit(1)
}

try {
  console.log(`正在更新所有项目到版本 ${newVersion}`)

  // 更新admin版本
  console.log('更新 admin 版本')
  execSync(
    `cd admin && yarn version --new-version ${newVersion} --no-git-tag-version && cd ..`,
    { stdio: 'inherit' }
  )

  // 更新server版本
  console.log('更新 server 版本')
  execSync(
    `cd server && yarn version --new-version ${newVersion} --no-git-tag-version && cd ..`,
    { stdio: 'inherit' }
  )

  // 更新blog版本
  console.log('更新 blog 版本')
  execSync(
    `cd blog && yarn version --new-version ${newVersion} --no-git-tag-version && cd ..`,
    { stdio: 'inherit' }
  )

  console.log(`所有项目已更新到版本 ${newVersion}`)

  // 更新根目录的版本
  console.log('更新根目录版本')
  execSync(`yarn version --new-version ${newVersion} --no-git-tag-version`, {
    stdio: 'inherit'
  })

  console.log('所有项目版本更新完成')
} catch (error) {
  console.error('更新版本时发生错误:', error)
  process.exit(1)
}
