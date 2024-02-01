<template>
  <div class="whitespace-pre-wrap tweet-content-body">
    <template v-for="(item, index) in contentJson" :key="index"
      ><a
        v-if="item.type === 'link'"
        :href="item.url"
        target="_blank"
        class="text-primary-500"
        >{{ item.text }}</a
      ><span v-else>{{ item.text }}</span></template
    >
  </div>
  <slot name="tags"></slot>
  <div
    v-if="linkCover"
    v-html="linkCover"
    class="tweet-content-link-cover-body mt-3 mb-3"
  ></div>
</template>
<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  coverLength: {
    type: Number,
    default: 0,
  },
})

const contentJson = computed(() => {
  const linkType = [
    {
      url: 'https://www.bilibili.com/video/',
      linkTypeName: 'bilibili-video',
      getContent: (link) => {
        const url = new URL(link)
        const videoId = url.pathname.split('/')[2]

        return {
          text: `哔哩哔哩视频-${videoId}`,
          id: videoId,
        }
      },
    },
  ]
  // 对content做处理
  const contentJsonArray = []
  let excerpt = props.content
  // 将所有的非url字符串替换成空格
  const excerpt2 = excerpt.replace(
    /[^a-zA-Z0-9\/:.\-_?=&#%~+*!';,\'\[\]$|]/g,
    ' '
  )
  // 解析里面的链接并转换成数组
  const linkList = excerpt2.match(/https?:\/\/[^\s]*[a-zA-Z0-9\/]/g) || []
  if (linkList.length === 0) {
    return [
      {
        type: 'text',
        text: excerpt,
      },
    ]
  } else {
    // 遍历linkList数组
    linkList.forEach((link) => {
      // 将excerpt字符串按照link进行分割
      const split = excerpt.split(link, 2)
      // 将分割后的字符串放入数组
      if (split[0]) {
        contentJsonArray.push({
          type: 'text',
          text: split[0],
        })
      }
      // 解析link类型
      const linkTypeItem = linkType.find((item) => link.includes(item.url))
      const linkObj = {
        type: 'link',
        url: link,
        text: link,
      }
      if (linkTypeItem) {
        const { text, id } = linkTypeItem.getContent(link)
        linkObj.linkTypeName = linkTypeItem.linkTypeName
        linkObj.text = text
        linkObj.id = id
      }
      contentJsonArray.push(linkObj)
      // 将excerpt重新赋值为分割后的字符串
      excerpt = excerpt.replace(split[0] + link, '')
      // 如果是最后一个link
      if (link === linkList[linkList.length - 1]) {
        contentJsonArray.push({
          type: 'text',
          text: excerpt,
        })
      }
    })
  }

  return contentJsonArray
})

const linkCover = computed(() => {
  if (props.content && props.coverLength === 0) {
    const coverDatabase = [
      {
        linkTypeName: 'bilibili-video',
        getCover: (id) => {
          return `<iframe src="https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${id}&as_wide=1&danmaku=0&hasMuteButton=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`
        },
      },
    ]
    // 找到contentJson.value数组中有linkTypeName的第一个元素
    const linkCoverItem = contentJson.value.find((item) => item.linkTypeName)
    if (linkCoverItem) {
      // 用linkCoverItem 去匹配coverDatabase数组中的linkTypeName
      const coverItem = coverDatabase.find(
        (item) => item.linkTypeName === linkCoverItem.linkTypeName
      )
      if (coverItem) {
        return coverItem.getCover(linkCoverItem.id)
      }
    }
  }
  return null
})
</script>
<style scoped>
.tweet-content-body a {
  word-break: break-all;
}
</style>
<style>
.tweet-content-link-cover-body iframe {
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
  border-radius: 20px;
}
</style>
