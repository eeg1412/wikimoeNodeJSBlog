/**
 * @description eventspan module entry
 */

import withEventspan from './plugin'
import renderElemConf from './render-elem'
import elemToHtmlConf from './elem-to-html'
import parseHtmlConf from './parse-elem-html'
import menuConf from './menu/menu'
import unEventspanConf from './menu/unsetEventspan'
import editeventspanConf from './menu/editEventspan'

const module = {
  editorPlugin: withEventspan,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [menuConf, unEventspanConf, editeventspanConf]
}

export default module
