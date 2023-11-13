const fs = require('fs');
var path = require('path');

const initGlobalConfig = () => {
  // 默认配置
  const config = {
    // 开启图片压缩
    enableImgCompress: false,
    // 图片压缩质量
    imgCompressQuality: 80,
    // 图片压缩最长边
    imgCompressMaxSize: 1920,
    // 开启图片缩略图
    enableImgThumbnail: false,
    // 图片缩略图最长边
    imgThumbnailMaxSize: 680,
  }
  // 尝试读取同目录下的globalConfig.json文件
  const globalConfigPath = path.join(__dirname, 'config/globalConfig.json');
  // 如果存在，就读取文件内容，覆盖默认配置
  if (fs.existsSync(globalConfigPath)) {
    try {
      const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));
      Object.assign(config, globalConfig);
    } catch (error) {
      console.error('读取globalConfig.json文件失败');
    }

  }
  // 将配置挂载到global上
  global.$globalConfig = config;
  console.info('globalConfig初始化完成,配置如下:', config);
}
initGlobalConfig()