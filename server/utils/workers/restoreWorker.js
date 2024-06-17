const { parentPort } = require('worker_threads');
const backupTools = require('../backup');
const db = require('../../tools/mongodb');

const dbPromise = new Promise((resolve, reject) => {
  db.once('open', () => {
    resolve();
  });
  db.on('error', (err) => {
    reject(err);
  });
});

parentPort.on('message', async (fullPath) => {
  dbPromise.then(async () => {
    console.log('worker start');
    await backupTools.unzipBackup(fullPath);
    await backupTools.clearCollections();
    await backupTools.restoreCollections(fullPath);
    await backupTools.removePublicContents()
    await backupTools.restorePublic(fullPath)
    await backupTools.clearRestoreCache(fullPath)
    parentPort.postMessage({ status: 'success' });
    parentPort.close();
  }).catch((err) => {
    console.error('Failed to connect to database', err);
    parentPort.postMessage({ status: 'error', error: err });
    parentPort.close();
  });
});