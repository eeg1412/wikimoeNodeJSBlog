/**
 * @description elem to html
 */

// 生成 html 的函数
function eventspanToHtml (elem, childrenHtml) {
  const { id = '' } = elem
  return `<span data-w-e-type="eventspan" data-w-e-is-inline data-id="${id}">${childrenHtml}</span>`
}

// 配置
const conf = {
  type: 'eventspan', // 节点 type ，重要！！！
  elemToHtml: eventspanToHtml,
}

export default conf