/**
 * @description parse elem html
 */
import { Text } from 'slate'

function parseHtml(elem, children, editor) {
  const childrens = []
  // 遍历子节点的img标签
  elem.children.forEach(divChild => {
    if (divChild.tagName.toLowerCase() === 'div') {
      const child = divChild.children[0]
      const src = child.getAttribute('src')
      const width = child.getAttribute('width')
      const height = child.getAttribute('height')
      const dataHref = child.getAttribute('data-href')
      const dataHrefWidth = child.getAttribute('data-href-width')
      const dataHrefHeight = child.getAttribute('data-href-height')
      const alt = child.alt

      const image = {
        src: src,
        width: width,
        height: height,
        dataHref: dataHref,
        dataHrefWidth: dataHrefWidth,
        dataHrefHeight: dataHrefHeight,
        alt: alt,
        text: ''
      }
      childrens.push(image)
    }
  })
  return {
    type: 'imageGroup',
    childrenList: childrens,
    children: [{ text: '' }] // void node 必须有一个空白 text
  }
}

const parseHtmlConf = {
  selector: 'div[data-w-e-type="imageGroup"]',
  parseElemHtml: parseHtml
}

export default parseHtmlConf
