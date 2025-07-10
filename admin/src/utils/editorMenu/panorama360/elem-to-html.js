/**
 * @description elem to html
 */

function panorama360ToHtml(elem, childrenHtml) {
  const { src, width, height, dataHref, dataHrefWidth, dataHrefHeight, alt } =
    elem

  return `<div data-w-e-type="panorama360" data-w-e-is-void class="w-e-panorama360">
    <img src="${src}" class="w-e-panorama360-img" width="${width || ''}" height="${height || ''}" data-href="${dataHref || ''}" data-href-width="${dataHrefWidth || ''}" data-href-height="${dataHrefHeight || ''}" alt="${alt || '360°全景图片'}" data-type="panorama360" />
  </div>`
}

// 配置
const conf = {
  type: 'panorama360', // 节点 type ，重要！！！
  elemToHtml: panorama360ToHtml
}

export default conf
