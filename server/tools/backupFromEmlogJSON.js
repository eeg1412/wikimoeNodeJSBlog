require('dotenv').config()
const fs = require('fs')
const path = require('path')
const db = require('./mongodb')
const sharp = require('sharp')

// 各种mongodb表
const albumUtils = require('../mongodb/utils/albums')
const attachmentsUtils = require('../mongodb/utils/attachments')
const commentUtils = require('../mongodb/utils/comments')
const postUtils = require('../mongodb/utils/posts')
const sortUtils = require('../mongodb/utils/sorts')
const tagUtils = require('../mongodb/utils/tags')
const userUtils = require('../mongodb/utils/users')

const init = async () => {
  let data = {}
  const filePath = path.join(__dirname, 'backupFromEmlogJson', 'emlog.json')
  data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  // 设定表前缀由运行参数中获取
  const tablePrefix = process.argv[2] || 'emlog_'
  // tablePrefix_attachment
  // tablePrefix_blog
  // tablePrefix_comment
  // tablePrefix_reply
  // tablePrefix_sort
  // tablePrefix_tag
  // tablePrefix_twitter

  // 转换sort表
  const sortList = []
  const sortEmlogList = data[tablePrefix + 'sort']
  // 遍历sortEmlogList,转换格式
  sortEmlogList.forEach(sortEmlog => {
    const sort = {
      sortname: sortEmlog.sortname,
      alias: sortEmlog.alias,
      taxis: sortEmlog.taxis,
      parent: null,
      pid: sortEmlog.pid,
      sid: sortEmlog.sid,
      description: sortEmlog.description,
      template: sortEmlog.template
    }
    sortList.push(sort)
  })
  // 将sortList拆分成两组，一组是有parent的，一组是没有parent的
  const sortListWithParent = []
  const sortListWithoutParent = []
  sortList.forEach(sort => {
    if (sort.pid !== '0') {
      sortListWithParent.push(sort)
    } else {
      sortListWithoutParent.push(sort)
    }
  })

  const sortListMongoDBList = []
  // 优先将没用parent的插入数据库并记录id
  const sortIdMap = {} // key: emlog的sid, value: mongodb的_id
  const sortWithoutParentPromiseList = []
  for (let i = 0; i < sortListWithoutParent.length; i++) {
    const sort = sortListWithoutParent[i]
    const promise = sortUtils.save(sort).then(sortData => {
      sortIdMap[sort.sid] = sortData._id
      sortListMongoDBList.push(sortData)
    })
    sortWithoutParentPromiseList.push(promise)
  }
  await Promise.all(sortWithoutParentPromiseList)
  // 将有parent的插入数据库并记录id
  const sortWithParentPromiseList = []
  for (let i = 0; i < sortListWithParent.length; i++) {
    const sort = sortListWithParent[i]
    sort.parent = sortIdMap[sort.pid]
    const promise = sortUtils.save(sort).then(sortData => {
      sortIdMap[sort.sid] = sortData._id
      sortListMongoDBList.push(sortData)
    })
    sortWithParentPromiseList.push(promise)
  }
  await Promise.all(sortWithParentPromiseList)
  console.log('分类写入完毕')

  // 转换tag表
  const tagList = []
  const tagEmlogList = data[tablePrefix + 'tag']
  const tagGIDMap = {} // key: emlog的gid, value: mongodb的_id
  // 遍历tagEmlogList,转换格式
  tagEmlogList.forEach(tagEmlog => {
    // gid的格式是,1,2,3,
    // 如果存在gid的话需要去掉前后的逗号
    if (tagEmlog.gid) {
      const gidStr = tagEmlog.gid.replace(/^,|,$/g, '')
      const gidArr = gidStr.split(',')
      tagEmlog.gid = gidArr
    } else {
      tagEmlog.gid = []
    }
    const tag = {
      tagname: tagEmlog.tagname,
      tid: tagEmlog.tid,
      gid: tagEmlog.gid
    }
    tagList.push(tag)
  })
  // 将tagList插入数据库并记录id
  const tagPromiseList = []
  for (let i = 0; i < tagList.length; i++) {
    const tag = tagList[i]
    const promise = tagUtils.save(tag).then(tagData => {
      // gid是数组
      tag.gid.forEach(gid => {
        const GIDList = tagGIDMap[gid] || []
        GIDList.push(tagData._id)
        tagGIDMap[gid] = GIDList
      })
    })
    tagPromiseList.push(promise)
  }
  await Promise.all(tagPromiseList)
  console.log('标签写入完毕')

  // 转换attachment表
  // 先创建相册emlog
  const albumEmlog = {
    name: 'emlog'
  }
  const albumData = await albumUtils.save(albumEmlog)
  let albumAttachmentCount = 0
  // 转换attachment表
  const attachmentList = []
  const attachmentEmlogList = data[tablePrefix + 'attachment']
  // attachmentEmlogList 遍历出 所有 thumfor 的数组
  const thumforList = []
  attachmentEmlogList.forEach(attachmentEmlog => {
    if (attachmentEmlog.thumfor !== '0') {
      thumforList.push(attachmentEmlog.thumfor)
    }
  })
  // aid 如果在 thumforList 中，则说明是缩略图，做成一个map，key是thumfor，value是数据，如果不在，则说明是附件，是要添加到数据库的
  const attachmentListIsThumforMap = {}
  const attachmentListNotIsThumfor = []
  attachmentEmlogList.forEach(attachmentEmlog => {
    if (attachmentEmlog.thumfor === '0') {
      attachmentListNotIsThumfor.push(attachmentEmlog)
    } else {
      attachmentListIsThumforMap[attachmentEmlog.thumfor] = attachmentEmlog
    }
  })

  // 遍历attachmentListWithThumfor,转换格式
  attachmentListNotIsThumfor.forEach(attachmentEmlog => {
    // emlog的filepath前面多了..，thumfor指向附件的id，而不是缩略图的路径
    const newPath = attachmentEmlog.filepath.replace(/^../, '')
    const thumfor = attachmentListIsThumforMap[attachmentEmlog.aid] || null

    let thumWidth = null
    let thumHeight = null
    let thumPath = null
    if (thumfor) {
      thumWidth = Number(thumfor.width)
      thumHeight = Number(thumfor.height)
      thumPath = thumfor.filepath.replace(/^../, '')
    }

    const addtime = new Date(attachmentEmlog.addtime * 1000)

    const attachment = {
      name: attachmentEmlog.filename,
      filename: attachmentEmlog.filename,
      filesize: Number(attachmentEmlog.filesize),
      filepath: newPath,
      width: Number(attachmentEmlog.width),
      height: Number(attachmentEmlog.height),
      mimetype: attachmentEmlog.mimetype,
      thumfor: thumPath,
      thumWidth: thumWidth,
      thumHeight: thumHeight,
      album: albumData._id,
      status: 1,
      createdAt: addtime
    }
    attachmentList.push(attachment)
  })

  // 将attachmentList插入数据库，记录id,key是filepath去掉/,value是mongodb的_id
  const attachmentFilepathMap = {}
  const attachmentPromiseList = []
  for (let i = 0; i < attachmentList.length; i++) {
    const attachment = attachmentList[i]
    const promise = attachmentsUtils.save(attachment).then(attachmentData => {
      attachmentFilepathMap[attachment.filepath.replace(/^\//, '')] =
        attachmentData._id
      albumAttachmentCount++
    })
    attachmentPromiseList.push(promise)
  }
  await Promise.all(attachmentPromiseList)
  // 更新相册的附件数量
  albumUtils.updateOne({ _id: albumData._id }, { count: albumAttachmentCount })
  console.log('附件写入完毕')

  // 转换blog表
  const postList = []
  const postEmlogList = data[tablePrefix + 'blog']
  // 查询用户
  const userData = await userUtils.findOne({})
  // 遍历postEmlogList,转换格式
  postEmlogList.forEach(postEmlog => {
    const date = new Date(postEmlog.date * 1000)
    const alias = postEmlog.alias || postEmlog.gid
    const excerpt = postEmlog.excerpt || ''
    // excerpt 是一个html字符串，查找其中的第一张图片，将图片的src去掉https://www.wikimoe.com/后匹配附件attachmentFilepathMap
    const excerptSrc = excerpt.match(/<img.*?src="(.*?)"/)
    let excerptAttachmentId = null
    const coverImages = []
    if (excerptSrc) {
      const excerptSrcPath = excerptSrc[1].replace(
        /^https:\/\/www.wikimoe.com\//,
        ''
      )
      excerptAttachmentId = attachmentFilepathMap[excerptSrcPath]
      if (excerptAttachmentId) {
        coverImages.push(excerptAttachmentId)
      }
    }

    const post = {
      gid: postEmlog.gid,
      title: postEmlog.title,
      date: date,
      content: postEmlog.content,
      excerpt: '',
      alias: alias,
      author: userData._id,
      sort: sortIdMap[postEmlog.sortid],
      type: postEmlog.type === 'blog' ? 1 : 3,
      tags: tagGIDMap[postEmlog.gid] || [],
      views: Number(postEmlog.views),
      comnum: Number(postEmlog.comnum),
      top: postEmlog.top === 'y' ? true : false,
      sortop: postEmlog.sortop === 'y' ? true : false,
      status: postEmlog.hide === 'y' ? 0 : 1,
      allowRemark: postEmlog.allow_remark === 'y' ? true : false,
      template: '',
      code: postEmlog.xycode,
      editorVersion: 4,
      coverImages: coverImages
    }
    postList.push(post)
  })
  // 写入数据库，保存idMap
  const postIdMap = {} // key: emlog的gid, value: mongodb的_id
  const postPromiseList = []
  for (let i = 0; i < postList.length; i++) {
    const post = postList[i]
    const promise = postUtils.save(post).then(postData => {
      postIdMap[post.gid] = postData._id
    })
    postPromiseList.push(promise)
  }
  await Promise.all(postPromiseList)
  console.log('文章写入完毕')

  // 转换twitter表
  const twitterList = []
  const twitterEmlogList = data[tablePrefix + 'twitter']
  const twitterEmojiMap = {
    耶: '🙌',
    呵呵: '😄',
    悲伤: '😢',
    抓狂: '😖',
    衰: '😞',
    花心: '😍',
    哼: '😤',
    泪: '😭',
    害羞: '😳',
    酷: '😎',
    晕: '😵',
    挤眼: '😉',
    鬼脸: '😜',
    汗: '😓',
    吃惊: '😱',
    发呆: '😐',
    闭嘴: '🤐',
    撇嘴: '😒',
    疑问: '❓',
    睡觉: '😴',
    NO: '🚫',
    大哭: '😭',
    爱你: '😘',
    嘻嘻: '😁',
    生病: '🤒',
    偷笑: '😏',
    思考: '🤔',
    玫瑰: '🌹',
    心: '❤️',
    伤心: '💔',
    咖啡: '☕',
    音乐: '🎵',
    下雨: '🌧️',
    晴天: '☀️',
    星星: '⭐',
    月亮: '🌙'
  }
  const updatedEmojiMap = {}
  Object.keys(twitterEmojiMap).forEach(key => {
    updatedEmojiMap[`[${key}]`] = twitterEmojiMap[key]
  })
  // 遍历twitterEmlogList,转换格式
  const twitterAttachPromiseList = []
  for (let i = 0; i < twitterEmlogList.length; i++) {
    const twitterEmlog = twitterEmlogList[i]
    const date = new Date(twitterEmlog.date * 1000)
    const coverImages = []
    // img 去掉 thum-
    const imgThum = twitterEmlog.img
    if (imgThum) {
      const img = '/' + imgThum.replace(/thum-/, '')
      // twitter没用附件，所以根据img添加附件
      const imageFile = sharp(path.join('./', 'public', img))
      const imageInfo = await imageFile.metadata()
      const imageThumFile = sharp(path.join('./', 'public', '/' + imgThum))
      const imageThumInfo = await imageThumFile.metadata()
      // 根据路径获取文件名，通过正则获取
      const imgName = img.match(/\/([^\/]+)$/)[1]
      const imgParam = {
        name: imgName,
        filename: imgName,
        filesize: imageInfo.size,
        filepath: img,
        width: imageInfo.width,
        height: imageInfo.height,
        mimetype: 'image/' + imageInfo.format,
        thumfor: '/' + imgThum,
        thumWidth: imageThumInfo.width,
        thumHeight: imageThumInfo.height,
        album: albumData._id,
        status: 1,
        createdAt: date
      }
      const promise = attachmentsUtils.save(imgParam).then(imgData => {
        coverImages.push(imgData._id)
      })
      twitterAttachPromiseList.push(promise)
    }
    await Promise.all(twitterAttachPromiseList)
    // 更改 twitterEmlog.content 中的表情
    const twitterContent = twitterEmlog.content?.replace(
      /\[(.*?)\]/g,
      (match, p1) => {
        return updatedEmojiMap[match] || match
      }
    )
    const twitter = {
      tid: twitterEmlog.id,
      excerpt: twitterContent,
      date: date,
      author: userData._id,
      type: 2,
      comnum: Number(twitterEmlog.replynum),
      status: 1,
      coverImages: coverImages
    }
    twitterList.push(twitter)
  }
  // 写入数据库，保存idMap
  const twitterIdMap = {} // key: emlog的id, value: mongodb的_id
  const twitterPromiseList = []
  for (let i = 0; i < twitterList.length; i++) {
    const twitter = twitterList[i]
    const promise = postUtils.save(twitter).then(twitterData => {
      twitterIdMap[twitter.tid] = twitterData._id
    })
    twitterPromiseList.push(promise)
  }
  await Promise.all(twitterPromiseList)
  console.log('微语写入完毕')

  // 转换comment表
  const commentList = []
  const commentEmlogList = data[tablePrefix + 'comment']
  const commentMap = {} // key: emlog的cid, value: mongodb的_id
  const commentEmojiMap = {
    '@(墨镜)': '😎',
    '@(瞌睡)': '😴',
    '@(怜悯)': '😢',
    '@(绝望)': '😱',
    '@(面无表情)': '😐',
    '@(坏掉啦)': '🤯',
    '@(嫌弃)': '😒',
    '@(醉了)': '🥴',
    '@(卖萌)': '😊',
    '@(呕吐)': '🤮',
    '@(鼓掌)': '👏',
    '@(喔)': '😮',
    '@(哭笑)': '😂',
    '@(高兴)': '😃',
    '@(抛媚眼)': '😉',
    '@(自信)': '😏',
    '@(汗)': '😓',
    '@(惊讶)': '😲',
    '@(调皮)': '😜',
    '@(囧)': '😖',
    '@(迷上)': '😍',
    '@(昏厥)': '😵',
    '@(难过)': '😔',
    '@(晕)': '😵‍💫',
    '@(笑)': '😄',
    '@(触手)': '🐙',
    '@(大哭)': '😭',
    '@(摇头)': '🙅‍♂️',
    '@(剪刀)': '✂️',
    '@(石头)': '🪨',
    '@(布)': '📃',
    '@(剪刀手)': '✌️',
    '@(顶)': '👍',
    '@(踩)': '👎',
    '@(OK哒)': '👌',
    '@(恶魔)': '😈',
    '@(天使)': '👼',
    '@(礼花)': '🎉'
  }
  // 遍历commentEmlogList,转换格式
  commentEmlogList.forEach(commentEmlog => {
    const date = new Date(commentEmlog.date * 1000)
    const commentContent = commentEmlog.comment?.replace(
      /@\((.*?)\)/g,
      (match, p1) => {
        return commentEmojiMap[match] || match
      }
    )
    const comment = {
      post: postIdMap[commentEmlog.gid],
      parent: null, //暂时不处理
      pid: commentEmlog.pid,
      cid: commentEmlog.cid,
      date: date,
      content: commentContent,
      top: false,
      nickname: commentEmlog.poster,
      email: commentEmlog.mail,
      url: commentEmlog.url,
      ip: commentEmlog.ip,
      status: commentEmlog.hide === 'y' ? 0 : 1
    }
    // 如果email和userData的email相同，则是管理员
    if (
      userData.email === comment.email ||
      userData.nickname === comment.nickname
    ) {
      comment.user = userData._id
      // 清空email和url和nickname
      comment.email = ''
      comment.url = ''
      comment.nickname = ''
    }
    commentMap[commentEmlog.cid] = null
    commentList.push(comment)
  })
  // 写入数据库
  const commentPromiseList = []
  for (let i = 0; i < commentList.length; i++) {
    const comment = commentList[i]
    const promise = commentUtils.save(comment).then(commentData => {
      commentList[i]['commentData'] = commentData
      commentMap[comment.cid] = commentData._id
    })
    commentPromiseList.push(promise)
  }
  await Promise.all(commentPromiseList)
  // 更新评论的parent
  const commentUpdatePromiseList = []
  for (let i = 0; i < commentList.length; i++) {
    const comment = commentList[i]
    const commentData = comment.commentData
    const pid = comment.pid
    if (pid !== '0' && commentMap[pid]) {
      const promise = commentUtils.updateOne(
        { _id: commentData._id },
        { parent: commentMap[pid] }
      )
      commentUpdatePromiseList.push(promise)
    }
  }
  await Promise.all(commentUpdatePromiseList)
  console.log('评论写入完毕')

  // 转换reply表
  const replyList = []
  const replyEmlogList = data[tablePrefix + 'reply']
  // 遍历replyEmlogList,转换格式
  replyEmlogList.forEach(replyEmlog => {
    const date = new Date(replyEmlog.date * 1000)
    const reply = {
      post: twitterIdMap[replyEmlog.tid],
      parent: null, //暂时不处理
      date: date,
      content: replyEmlog.content,
      top: false,
      nickname: replyEmlog.name,
      ip: replyEmlog.ip,
      status: replyEmlog.hide === 'y' ? 0 : 1
    }
    // 如果nickname和userData的nickname相同，则是管理员
    if (userData.nickname === reply.nickname) {
      reply.user = userData._id
    }
    replyList.push(reply)
  })
  // 写入数据库
  const replyPromiseList = []
  for (let i = 0; i < replyList.length; i++) {
    const reply = replyList[i]
    const promise = commentUtils.save(reply)
    replyPromiseList.push(promise)
  }
  await Promise.all(replyPromiseList)
  console.log('推文回复写入完毕')

  // 退出
  process.exit(0)
}

db.once('open', () => {
  init()
})
