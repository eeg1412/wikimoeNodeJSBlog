const { execSync } = require('child_process')
console.log('install and build admin')
execSync('cd admin && yarn install && yarn build && cd ..', {
  stdio: 'inherit',
})
console.log('install server')
execSync(`cd server && yarn install && cd ..`, { stdio: 'inherit' })
console.log('install and build blog')
execSync('cd blog && yarn install && yarn build && cd ..', { stdio: 'inherit' })
