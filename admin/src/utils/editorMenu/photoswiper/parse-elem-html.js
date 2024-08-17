/**
 * @description parse elem html
 */
import { Text } from 'slate'

function parseHtml (elem, children, editor) {
  // children = children.filter(child => {
  //   if (Text.isText(child)) return true
  //   if (editor.isInline(child)) return true
  //   return false
  // })

  // // 无 children ，则用纯文本
  // if (children.length === 0) {
  //   children = [{ text: elem.textContent.replace(/\s+/gm, ' ') }]
  // }
  const id = elem.getAttribute('data-id') || ''
  const name = elem.getAttribute('data-name') || ''
  const width = elem.getAttribute('data-width') || ''
  const height = elem.getAttribute('data-height') || ''
  return {
    type: 'photoswiper',
    id: id,
    name: name,
    width: width,
    height: height,
    children: [{ text: '' }], // void node 必须有一个空白 text
  }
}

const parseHtmlConf = {
  selector: 'div[data-w-e-type="photoswiper"]',
  parseElemHtml: parseHtml,
}

export default parseHtmlConf