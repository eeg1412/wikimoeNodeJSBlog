module.exports = async function (req, res, next) {
  // 读取配置文件
  const config = global.$globalConfig
  res.send({
    data: config,
  })
}
