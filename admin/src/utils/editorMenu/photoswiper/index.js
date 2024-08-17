/**
 * @description photoswiper module entry
 */


import withPhotoswiper from './plugin'
import renderElemConf from './render-elem'
import elemToHtmlConf from './elem-to-html'
import parseHtmlConf from './parse-elem-html'
import menuConf from './menu/menu'
import editphotoswiperConf from './menu/editPhotoswiper'

const module = {
  editorPlugin: withPhotoswiper,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [menuConf, editphotoswiperConf],
}

export default module