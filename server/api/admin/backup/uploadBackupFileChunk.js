const fs = require('fs')
const utils = require('../../../utils/utils')

module.exports = async function (req, res, next) {
  const id = req.params.id
  const chunkIndex = req.params.chunkindex

  const paramsCheck = {
    id,
    chunkIndex: chunkIndex
  }
  const rule = [
    {
      label: 'id',
      key: 'id',
      type: 'isMongoId',
      required: true
    },
    {
      label: 'chunkIndex',
      key: 'chunkIndex',
      type: 'isInt',
      options: {
        min: 0
      },
      required: true
    }
  ]
  const errors = utils.checkForm(paramsCheck, rule)
  if (errors.length > 0) {
    res.status(400).json({ errors })
    return
  }
  const file = req.file
  // 将分片文件保存到指定目录
  const chunkDir = `./cache/${id}`
  // 如果备份目录不存在，则报错
  if (!fs.existsSync(chunkDir)) {
    res.status(400).json({
      errors: [
        {
          message: '备份文件不存在'
        }
      ]
    })
    return
  }
  const chunkPath = `${chunkDir}/${chunkIndex}`
  fs.writeFileSync(chunkPath, file.buffer)
  // 保存成功
  res.status(200).json({
    message: '上传成功'
  })
}
