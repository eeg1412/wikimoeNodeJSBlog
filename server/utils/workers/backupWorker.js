// backupWorker.js
const { parentPort } = require('worker_threads')
const backupTools = require('../backup')
const moment = require('moment')
const db = require('../../tools/mongodb')
const mongoose = require('mongoose')

const dbPromise = new Promise((resolve, reject) => {
  db.once('open', () => {
    resolve()
  })
  db.on('error', err => {
    reject(err)
  })
})

parentPort.on('message', async _id => {
  dbPromise
    .then(async () => {
      console.log('worker start')
      const id = new mongoose.Types.ObjectId(_id)
      const pathname = `backup-${moment().format('YYYYMMDDHHmmss')}-${id}`
      console.log('id', id)
      try {
        await backupTools.dumpCollections(pathname, id)
        await backupTools.backupToZip(pathname)
        await backupTools.clearBackupCache(pathname)
        const fileSize = backupTools.getBackupFileSize(pathname)
        parentPort.postMessage({
          status: 'success',
          data: { pathname, fileSize }
        })
        parentPort.close()
      } catch (err) {
        parentPort.postMessage({ status: 'error', error: err })
        parentPort.close()
      }
    })
    .catch(err => {
      console.error('Failed to connect to database', err)
      parentPort.postMessage({ status: 'error', error: err })
      parentPort.close()
    })
})
