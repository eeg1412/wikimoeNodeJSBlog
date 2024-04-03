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
  return {
    type: 'eventspan',
    id: id,
    children, // void node 必须有一个空白 text
  }
}

const parseHtmlConf = {
  selector: 'span[data-w-e-type="eventspan"]',
  parseElemHtml: parseHtml,
}

export default parseHtmlConf