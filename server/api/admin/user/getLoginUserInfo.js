
module.exports = async function (req, res, next) {
  const adminData = {
    nickname: req.admin.nickname,
    id: req.admin._id,
    role: req.admin.role,
    photo: req.admin.photo || null,
    email: req.admin.email || null,
    description: req.admin.description || null,
  }
  res.send({
    data: adminData
  })
}
