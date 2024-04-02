/**
 * @description parse elem html
 */


function parseHtml (elem, children, editor) {
  const id = elem.getAttribute('data-id') || ''
  return {
    type: 'eventspan',
    id,
    children, // void node 必须有一个空白 text
  }
}

const parseHtmlConf = {
  selector: 'span[data-w-e-type="eventspan"]',
  parseElemHtml: parseHtml,
}

export default parseHtmlConf