/**
 * @description panorama360 module entry
 */

import withPanorama360 from './plugin'
import renderElemConf from './render-elem'
import elemToHtmlConf from './elem-to-html'
import parsePanorama360HtmlConf from './parse-elem-html'
import menuConf from './menu/menu'

const module = {
  editorPlugin: withPanorama360,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parsePanorama360HtmlConf()],
  menus: [menuConf],
}

export default module
