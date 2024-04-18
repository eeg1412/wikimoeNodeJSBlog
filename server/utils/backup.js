const mongoose = require('mongoose');
const bson = mongoose.mongo.BSON;
const archiver = require('archiver');
const fs = require('fs')
const fsEX = require('fs-extra')
const path = require('path');

exports.dumpCollections = async (pathname, id) => {
  const dir = `./cache/${pathname}/mongodb`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Get all collection names
  const collections = await mongoose.connection.db.listCollections().toArray();

  // Loop through each collection
  for (const collection of collections) {
    // Get all documents in the collection
    const documents = await mongoose.connection.db.collection(collection.name).find().toArray();

    // Convert the documents to BSON
    const bsonData = bson.serialize({ documents });

    // Write the BSON data to a file
    fs.writeFileSync(path.join(dir, `${collection.name}.bson`), bsonData);
    console.log(`Collection ${collection.name} dumped successfully`);
  }
  // id为当前id，将id写入文件
  const BackupInfo = { _id: id };
  const BackupInfoBSONData = bson.serialize(BackupInfo);
  fs.writeFileSync(path.join(dir, 'backupInfo.bson'), BackupInfoBSONData);
  console.log(`backup info ${JSON.stringify(BackupInfo)} dumped successfully`);
}

exports.backupToZip = async (pathname) => {
  const dir = `./cache/${pathname}`;
  // 查询/backups文件夹是否存在
  if (!fs.existsSync('./backups')) {
    fs.mkdirSync('./backups', { recursive: true });
  }
  const output = fs.createWriteStream(`./backups/${pathname}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 0 }
  });
  console.log('backup to zip start')
  archive.pipe(output);
  archive.directory(dir, false);
  archive.directory('./public', 'public');
  await new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log('backup to zip end');
      resolve();
    });
    output.on('error', reject);
    archive.finalize();
  });
}

exports.clearBackupCache = async (pathname) => {
  const dir = `./cache/${pathname}`;
  await fsEX.remove(dir)
  console.log('clear backup cache success')
}