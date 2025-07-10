/**
 * @description imageGroup module entry
 */

import withImageGroup from './plugin'
import renderElemConf from './render-elem'
import elemToHtmlConf from './elem-to-html'
import parseHtmlConf from './parse-elem-html'
import menuConf from './menu/menu'

const module = {
  editorPlugin: withImageGroup,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [menuConf]
}

export default module
