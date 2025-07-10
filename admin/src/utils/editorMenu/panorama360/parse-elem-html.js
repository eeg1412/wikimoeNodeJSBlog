/**
 * @description parse elem html
 */

function parseHtml(domElem, children, editor) {
  const imgElem = domElem.querySelector('img.w-e-panorama360-img')
  if (imgElem == null) return

  const src = imgElem.getAttribute('src')
  const width = imgElem.getAttribute('width')
  const height = imgElem.getAttribute('height')
  const dataHref = imgElem.getAttribute('data-href')
  const dataHrefWidth = imgElem.getAttribute('data-href-width')
  const dataHrefHeight = imgElem.getAttribute('data-href-height')
  const alt = imgElem.getAttribute('alt')

  return {
    type: 'panorama360',
    src,
    width,
    height,
    dataHref,
    dataHrefWidth,
    dataHrefHeight,
    alt,
    children: [{ text: '' }]
  }
}

function parsePanorama360HtmlConf() {
  return {
    selector: 'div.w-e-panorama360',
    parseElemHtml: parseHtml
  }
}

export default parsePanorama360HtmlConf
