<template>
  <div class="html-content-body">
    <div v-html="contentCom" @click.middle="onMidClick" @click="onClick"></div>
  </div>
</template>
<script setup>
import { loadAndOpenImg } from '@/utils'

// props
const props = defineProps({
  // content
  content: {
    type: String,
    default: '',
  },
})
// img标签自动添加loading="lazy"
// let htmlContent = '你的HTML内容'
// htmlContent = htmlContent.replace(
//   /<img(?!.*?loading\s*=\s*['"]lazy['"])([^>]*?)>/gi,
//   '<img loading="lazy" $1>'
// )
// console.log(htmlContent)
const contentCom = computed(() => {
  let content = props.content
  content = content.replace(
    /<img(?!.*?loading\s*=\s*['"]lazy['"])([^>]*?)>/gi,
    '<img loading="lazy" $1>'
  )
  if (process.client) {
    // 去掉data-href为空的data-href属性
    content = content.replace(/data-href=""/gi, '')
  }
  // if (divDom.value) {
  //   divDom.value.innerHTML = content
  //   const imgList = divDom.value.querySelectorAll('img')
  //   imgList.forEach((img) => {
  //     // 检查 data-href 属性是否有值
  //     if (img.getAttribute('data-href')) {
  //       // 如果 data-href 属性有值，添加 pointer 类
  //       img.classList.add('pointer')
  //     }
  //   })
  //   const newHtml = divDom.value.innerHTML
  //   // 清空 divDom
  //   divDom.value.innerHTML = ''
  //   return newHtml
  // }
  return content
})

const getImgHref = (e) => {
  const target = e.target
  // 检查是否为 img 标签
  if (target.tagName === 'IMG') {
    // 检查 data-href 属性是否有值，需要URI decode
    let dataHref = target.getAttribute('data-href')
    dataHref = dataHref ? decodeURIComponent(dataHref) : null
    if (dataHref) {
      return dataHref
    }
  }
  return ''
}
// 点击事件
const onClick = (e) => {
  const dataHref = getImgHref(e)
  if (dataHref) {
    // 正则判断是否是图片的链接 href
    const imageRegex = /\.(jpe?g|png|gif|bmp|svg|webp)$/i
    if (imageRegex.test(dataHref)) {
      // 获取实际的图片宽高
      const img = new Image()
      img.src = dataHref
      img.onload = () => {
        const imgList = [
          {
            src: dataHref,
            width: img.width,
            height: img.height,
          },
        ]
        loadAndOpenImg(0, imgList)
      }
    } else {
      // dataHref 不是图片链接
      window.open(dataHref, '_blank')
    }
  }
}
// 中键点击事件
const onMidClick = (e) => {
  const dataHref = getImgHref(e)
  if (dataHref) {
    // 新窗口打开
    window.open(dataHref, '_blank')
  }
}
</script>
<style scoped>
.html-content-body {
  padding-top: 10px;
}
</style>
<style>
.html-content-body img[data-href] {
  cursor: pointer;
}
.html-content-body img {
  max-width: 100% !important;
  height: auto !important;
}
</style>
