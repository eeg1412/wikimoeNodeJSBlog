// 引入所需的模块
const mongoose = require('mongoose');
const bson = mongoose.mongo.BSON;
const archiver = require('archiver');
const fs = require('fs');
const fsEX = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const yauzl = require('yauzl');

// 引入数据库模型工具
const albumsUtil = require('../mongodb/utils/albums');
const attachmentsUtil = require('../mongodb/utils/attachments');
const backupsUtil = require('../mongodb/utils/backups');
const bangumisUtil = require('../mongodb/utils/bangumis');
const bannersUtil = require('../mongodb/utils/banners');
const booksUtil = require('../mongodb/utils/books');
const booktypesUtil = require('../mongodb/utils/booktypes');
const commentLikeLogsUtil = require('../mongodb/utils/commentLikeLogs');
const commentsUtil = require('../mongodb/utils/comments');
const emailSendHistorysUtil = require('../mongodb/utils/emailSendHistorys');
const eventsUtil = require('../mongodb/utils/events');
const eventtypesUtil = require('../mongodb/utils/eventtypes');
const gamePlatformsUtil = require('../mongodb/utils/gamePlatforms');
const gamesUtil = require('../mongodb/utils/games');
const linksUtil = require('../mongodb/utils/links');
const navisUtil = require('../mongodb/utils/navis');
const optionsUtil = require('../mongodb/utils/options');
const postLikeLogsUtil = require('../mongodb/utils/postLikeLogs');
const postsUtil = require('../mongodb/utils/posts');
const readerlogsUtil = require('../mongodb/utils/readerlogs');
const referrersUtil = require('../mongodb/utils/referrers');
const rsslogsUtil = require('../mongodb/utils/rsslogs');
const sidebarsUtil = require('../mongodb/utils/sidebars');
const sortsUtil = require('../mongodb/utils/sorts');
const tagsUtil = require('../mongodb/utils/tags');
const usersUtil = require('../mongodb/utils/users');

// 创建一个映射，键是模型的名称（全部小写），值是对应的工具
const modelUtilMap = {
  'albums': albumsUtil,
  'attachments': attachmentsUtil,
  'backups': backupsUtil,
  'bangumis': bangumisUtil,
  'banners': bannersUtil,
  'books': booksUtil,
  'booktypes': booktypesUtil,
  'commentlikelogs': commentLikeLogsUtil,
  'comments': commentsUtil,
  'emailsendhistorys': emailSendHistorysUtil,
  'events': eventsUtil,
  'eventtypes': eventtypesUtil,
  'gameplatforms': gamePlatformsUtil,
  'games': gamesUtil,
  'links': linksUtil,
  'navis': navisUtil,
  'options': optionsUtil,
  'postlikelogs': postLikeLogsUtil,
  'posts': postsUtil,
  'readerlogs': readerlogsUtil,
  'referrers': referrersUtil,
  'rsslogs': rsslogsUtil,
  'sidebars': sidebarsUtil,
  'sorts': sortsUtil,
  'tags': tagsUtil,
  'users': usersUtil
};

const noDropCollections = ['backups'];

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
    zlib: { level: 2 }
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
exports.clearBackupCache = async (pathname, fullPath) => {
  // 定义备份目录
  const dir = fullPath || `./cache/${pathname, fullPath}`;
  if (!fs.existsSync(dir)) {
    throw new Error('backup cache not exists');
  }
  // 删除备份目录
  await fsEX.remove(dir);
  console.log('clear backup cache success');
}

// 还原备份
exports.unzipBackup = (fullPath) => {
  return new Promise((resolve, reject) => {
    // 在./cache 目录下创建一个文件夹，用于存放解压后的文件
    const dir = `./cache/${path.basename(fullPath, '.zip')}`;

    yauzl.open(fullPath, { lazyEntries: true }, function (err, zipfile) {
      if (err) reject(err);
      zipfile.readEntry();
      zipfile.on("entry", function (entry) {
        if (/\/$/.test(entry.fileName)) {
          // Directory file names end with '/'.
          // Note that entries for directories themselves are optional.
          // An entry's fileName implicitly requires its parent directories to
          zipfile.readEntry();
        } else {
          const filePath = path.join(dir, entry.fileName);
          // file entry
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) reject(err);
            readStream.on("end", function () {
              zipfile.readEntry();
            });
            const writeStream = fs.createWriteStream(filePath);
            readStream.pipe(writeStream);
          });
        }
      });
      zipfile.once('end', () => {
        zipfile.close();
        console.log('unzip backup success');
        resolve();
      });
    });
  });
}

// 遍历modelUtilMap，删除所有数据
exports.clearCollections = async () => {
  for (const [modelName, modelUtil] of Object.entries(modelUtilMap)) {
    // 判断是否在 noDropCollections 中，如果是，则跳过
    if (noDropCollections.includes(modelName)) {
      continue;
    }
    console.log(`Clearing collection ${modelName}`);
    await modelUtil.deleteMany({});
    console.log(`Collection ${modelName} cleared successfully`);
  }
}

// 解析mongodb文件夹内的bson文件
exports.restoreCollections = async (fullPath) => {
  const dir = `./cache/${path.basename(fullPath, '.zip')}/mongodb`;
  // 获取目录下的所有文件
  const files = fs.readdirSync(dir);

  // 遍历每个文件
  for (const file of files) {
    // 如果文件是 bson 文件
    if (file.endsWith('.bson')) {
      // 获取集合名称
      const collectionName = file.replace('.bson', '');
      // 如果集合名称在 noDropCollections 中，跳过
      if (noDropCollections.includes(collectionName)) {
        continue;
      }
      // 如果集合名称不在 modelUtilMap 中，跳过
      if (!modelUtilMap[collectionName]) {
        console.error(`Collection ${collectionName} not found in modelUtilMap`);
        continue;
      }
      console.log(`Restoring collection ${collectionName}`);
      // 创建读取流
      const readStream = fs.createReadStream(path.join(dir, file));

      // 创建一个空的Buffer，用于存储从文件中读取的数据
      let buffer = Buffer.alloc(0);
      const promiseArrary = [];

      // 创建一个新的 Promise
      await new Promise((resolve, reject) => {
        // 当从文件中读取到数据时，触发此事件监听器
        readStream.on('data', async (chunk) => {
          // 将新读取的数据（chunk）添加到buffer中
          buffer = Buffer.concat([buffer, chunk]);

          // 当buffer的长度大于4时，进入循环
          // 这是因为在.bson文件中，每个文档的大小（以字节为单位）都存储在文档的前4个字节中
          while (buffer.length > 4) {
            // 读取buffer的前4个字节，获取到当前文档的大小
            const size = buffer.readInt32LE(0);

            // 如果文档的大小大于buffer的长度，那么跳出循环，等待更多的数据被读取
            if (size > buffer.length) {
              break;
            }

            // 反序列化buffer中的数据，创建一个JavaScript对象
            const doc = bson.deserialize(buffer.subarray(0, size));
            // 插入
            switch (collectionName) {
              case 'readerlogs':
                promiseArrary.push(modelUtilMap[collectionName].saveNormal(doc));
                break;
              default:
                promiseArrary.push(modelUtilMap[collectionName].save(doc));
                break;
            }

            // 将buffer中已经被反序列化的数据移除，以便于处理下一个文档
            buffer = buffer.subarray(size);
          }
        });

        readStream.on('end', resolve);
        readStream.on('error', reject);
      });

      await Promise.all(promiseArrary);

      console.log(`Collection ${collectionName} restored successfully`);
    }
  }
}

// 删除./public目录
exports.removePublic = async () => {
  const dir = './public';
  if (!fs.existsSync(dir)) {
    throw new Error('public not exists');
  }
  // 删除目录
  await
    fsEX.remove(dir);
  console.log('clear public success');
}

// 还原./public目录
exports.restorePublic = async (fullPath) => {
  const dir = `./cache/${path.basename(fullPath, '.zip')}/public`;
  // 复制目录
  await fsEX.copy(dir, './public');
  console.log('restore public success');
}

// 清空cache
exports.clearRestoreCache = async (fullPath) => {
  const dir = `./cache/${path.basename(fullPath, '.zip')}`;
  if (!fs.existsSync(dir)) {
    throw new Error('restore cache not exists');
  }
  // 删除目录
  await fsEX.remove(dir);
  console.log('clear restore cache success');
}
