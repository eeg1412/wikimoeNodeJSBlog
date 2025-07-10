const sharp = require('sharp')
const { parentPort } = require('worker_threads')

sharp.cache(false)

const action = {
  imageCompress: async (
    toExtname,
    fileData,
    animated = false,
    newWidth,
    newHeight,
    imgSettingCompressQuality,
    filePath,
  ) => {
    let imageData = sharp(fileData, {
      failOn: 'error',
      animated,
    }).rotate()
    if (newWidth && newHeight) {
      imageData.resize(newWidth, newHeight)
    }
    switch (toExtname) {
      case '.webp':
        await imageData
          .webp({ quality: imgSettingCompressQuality })
          .toFile(filePath)
        break
      case '.jpg':
      case '.jpeg':
        await imageData
          .jpeg({ quality: imgSettingCompressQuality })
          .toFile(filePath)
        break
      case '.png':
        await imageData
          .png({ quality: imgSettingCompressQuality })
          .toFile(filePath)
        break
      default:
        await imageData.toFile(filePath)
        break
    }
    // 释放内存
    imageData = null
  },
  imageMetadata: async (fileData) => {
    const image = sharp(fileData)
    const imageInfo = await image.metadata()
    return imageInfo
  },
}

parentPort.on('message', async (params) => {
  // params 结构为 {action:'',data:{}} action为操作类型，data为操作数据
  let res = null
  if (action[params.action]) {
    res = await action[params.action](...params.data)
  }
  parentPort.postMessage({ status: 'success', data: res })
  parentPort.close()
})
