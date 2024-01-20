require('dotenv').config();
const db = require('./mongodb');
const commentUtils = require('../mongodb/utils/comments');
const postUtils = require('../mongodb/utils/posts');

async function fixCommentCountForPost (post) {
  // 获取 Post 下面 status 为 1 的评论数
  const commentCount = await commentUtils.count({ post: post._id, status: 1 });
  console.log(`Post ${post.title || post.excerpt} has ${commentCount} comments.`);

  // 更新 Post 的 comnum
  await postUtils.updateOne({ _id: post._id }, { comnum: commentCount });
  console.log(`Post ${post.title} updated.`);
}

async function fixCommentCount () {
  // 获取所有 Post
  console.log('Finding all posts...');
  const posts = await postUtils.find();

  // 使用 Promise.all 并行处理所有的 Post
  await Promise.all(posts.map(fixCommentCountForPost));

  console.log('Comment count fixed for all posts.');
}

// 连接到数据库并修复评论数
db.once('open', () => {
  fixCommentCount().then(() => {
    console.log('Done');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
})