const { execSync } = require('child_process')
const concurrently = require('concurrently')
const os = require('os')

const shouldBuild = process.argv.includes('--build')
const platform = os.platform()
const startCommand = platform === 'win32' ? 'start-windows' : 'start-linux'

if (shouldBuild) {
  execSync('cd admin && yarn install && yarn build && cd ..', {
    stdio: 'inherit'
  })
  execSync(`cd server && yarn install && cd ..`, { stdio: 'inherit' })
  execSync('cd blog && yarn install && yarn build && cd ..', {
    stdio: 'inherit'
  })
}

const { result } = concurrently(
  [
    {
      command: `cd server && yarn run start`,
      name: 'server',
      prefixColor: 'blue'
    },
    {
      command: `cd blog/build && yarn run ${startCommand}`,
      name: 'blog',
      prefixColor: 'green'
    }
  ],
  {
    prefix: 'name',
    killOthers: ['failure', 'success']
  }
)

result
  .then(() => {
    console.log('All applications are running...')
  })
  .catch(err => {
    console.error('Something went wrong:', err)
  })
