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
    ref="observee"
    v-if="linkCover"
    class="tweet-content-link-cover-body mt-3 mb-3"
  >
    <div v-html="linkCover" v-if="linkCoverShow"></div>
    <div v-else class="tweet-content-link-cover-block bg-primary-300">
      <div class="text-white flex justify-center items-center w-full h-full">
        <div class="text-2xl text-center">
          <UIcon class="animate-spin" name="i-heroicons-arrow-path" />
          <div class="text-lg">读取中</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

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
        const p = url.searchParams.get('p') || ''

        return {
          text: `哔哩哔哩视频-${videoId}`,
          id: videoId,
          ext: { p },
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
        ext: {},
      }
      if (linkTypeItem) {
        const { text, id, ext } = linkTypeItem.getContent(link)
        linkObj.linkTypeName = linkTypeItem.linkTypeName
        linkObj.text = text
        linkObj.id = id
        linkObj.ext = ext
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
        getCover: (id, ext) => {
          return `<iframe src="https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${id}&p=${ext.p}&as_wide=1&danmaku=0&hasMuteButton=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`
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
        return coverItem.getCover(linkCoverItem.id, linkCoverItem.ext)
      }
    }
  }
  return null
})
const observee = ref(null)
let observer = null
const linkCoverShow = ref(false)
let timer = null
onMounted(() => {
  nextTick(() => {
    timer = setTimeout(() => {
      if (linkCover.value && observee.value) {
        // 如果元素不在视口内，创建 IntersectionObserver
        observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            linkCoverShow.value = true
            observer.disconnect()
            observer = null
          }
        })
        observer.observe(observee.value)
      }
    }, 100)
  })
})
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (timer) {
    clearTimeout(timer)
  }
})
</script>
<style scoped>
.tweet-content-body a {
  word-break: break-all;
}
.tweet-content-body a:hover {
  text-decoration: underline;
}
.tweet-content-link-cover-block {
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
  border-radius: 20px;
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
