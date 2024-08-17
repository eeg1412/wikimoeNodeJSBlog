/**
 * @description elem to html
 */

// 生成 html 的函数
function photoswiperToHtml (elem, childrenHtml) {
  const { id = '', name = '', width = '', height = '' } = elem
  return `<div data-w-e-type="photoswiper" data-w-e-is-void data-id="${id}" data-name="${name}" data-width="${width}" data-height="${height}" id="photoswiper-${id}" style="aspect-ratio:${width}/${height}"></div>`
}

// 配置
const conf = {
  type: 'photoswiper', // 节点 type ，重要！！！
  elemToHtml: photoswiperToHtml,
}

export default conf