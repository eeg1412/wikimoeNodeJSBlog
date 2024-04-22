// 引入所需的模块
const mongoose = require('mongoose');
const bson = mongoose.mongo.BSON;
const archiver = require('archiver');
const fs = require('fs');
const fsEX = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);

// 导出数据库集合
exports.dumpCollections = async (pathname, id) => {
  // 定义备份目录
  const dir = `./cache/${pathname}/mongodb`;

  // 如果备份目录不存在，则创建
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 获取数据库中所有的集合
  const collections = await mongoose.connection.db.listCollections().toArray();

  // 遍历每个集合
  for (const collection of collections) {
    // 获取集合中的所有文档
    const cursor = mongoose.connection.db.collection(collection.name).find();
    // 创建写入流，用于将数据写入到文件中
    const writeStream = fs.createWriteStream(path.join(dir, `${collection.name}.bson`));

    // 遍历每个文档
    for await (const doc of cursor) {
      // 将文档序列化为 BSON 格式
      const bsonData = bson.serialize(doc);
      // 将 BSON 数据写入到文件中
      writeStream.write(bsonData);
    }

    // 关闭写入流
    writeStream.end();
    console.log(`Collection ${collection.name} dumped successfully`);
  }

  // 创建备份信息
  const BackupInfo = { _id: id };
  // 将备份信息序列化为 BSON 格式
  const BackupInfoBSONData = bson.serialize(BackupInfo);
  // 将备份信息写入到文件中
  fs.writeFileSync(path.join(`./cache/${pathname}`, 'backupInfo.bson'), BackupInfoBSONData);
  console.log(`backup info ${JSON.stringify(BackupInfo)} dumped successfully`);
}

// 将备份文件压缩为 zip 格式
exports.backupToZip = async (pathname) => {
  // 定义备份目录
  const dir = `./cache/${pathname}`;

  // 如果备份目录不存在，则创建
  if (!fs.existsSync('./backups')) {
    fs.mkdirSync('./backups', { recursive: true });
  }

  // 创建写入流，用于将数据写入到 zip 文件中
  const output = fs.createWriteStream(`./backups/${pathname}.zip`);
  // 创建 archiver 对象，用于压缩文件
  const archive = archiver('zip', {
    zlib: { level: 0 }
  });

  console.log('backup to zip start');
  // 将备份目录和 public 目录添加到压缩文件中
  archive.directory(dir, false);
  archive.directory('./public', 'public');

  // 告诉 archiver 对象所有的数据都已经添加完毕，可以开始压缩数据
  archive.finalize();

  // 将 archive 和 output 连接起来，当 archive 中的数据被全部写入到 output 中时，这个 Promise 就会被解决
  await pipeline(archive, output);

  console.log('backup to zip end');
}

// 清除备份缓存
exports.clearBackupCache = async (pathname) => {
  // 定义备份目录
  const dir = `./cache/${pathname}`;
  // 删除备份目录
  await fsEX.remove(dir);
  console.log('clear backup cache success');
}