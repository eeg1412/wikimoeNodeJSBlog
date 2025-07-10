/**
 * @description elem to html
 */

// 生成 html 的函数
function imageGroupToHtml(elem, childrenHtml) {
  const { childrenList } = elem
  let className = 'w-e-image-group'

  if (childrenList.length % 2 === 0) {
    className += ' w-e-image-group-even'
  } else {
    className += ' w-e-image-group-odd'
  }

  let html = `<div data-w-e-type="imageGroup" data-w-e-is-void class="${className}">`
  // 遍历子节点, 生成 img 标签
  childrenList.forEach((child, index) => {
    html += `<div class="w-e-image-group-img-body"><img src="${child.src}" class="w-e-image-group-img" width="${child.width}" height="${child.height}" data-href="${child.dataHref}" data-href-width="${child.dataHrefWidth}" data-href-height="${child.dataHrefHeight}" alt="${child.alt}" /></div>`
  })
  html += '</div>'
  return html
}

// 配置
const conf = {
  type: 'imageGroup', // 节点 type ，重要！！！
  elemToHtml: imageGroupToHtml
}

export default conf
