<template>
  <component :is="renderMarks" />
</template>
<script setup>
const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

const sanitizeCssValue = (value) => {
  if (!value) return ''
  return String(value).replace(/[;{}\\<>()'"]/g, '').replace(/expression/gi, '').replace(/javascript/gi, '').replace(/url\s*\(/gi, '').trim()
}

const renderMarks = computed(() => {
  const text = props.node.text || ''
  const marks = props.node.marks || []

  if (marks.length === 0) {
    return () => text
  }

  // Build nested h() calls from inside out
  let current = () => h('span', null, text)

  // Process marks in order
  for (const mark of marks) {
    const prev = current
    switch (mark.type) {
      case 'bold':
        current = () => h('strong', null, [prev()])
        break
      case 'italic':
        current = () => h('em', null, [prev()])
        break
      case 'underline':
        current = () => h('u', null, [prev()])
        break
      case 'strike':
        current = () => h('s', null, [prev()])
        break
      case 'code':
        current = () => h('code', null, [prev()])
        break
      case 'superscript':
        current = () => h('sup', null, [prev()])
        break
      case 'subscript':
        current = () => h('sub', null, [prev()])
        break
      case 'link': {
        const href = mark.attrs?.href || ''
        const target = mark.attrs?.target || '_blank'
        const rel = mark.attrs?.rel || 'noopener noreferrer nofollow'
        current = () => h('a', { href, target, rel }, [prev()])
        break
      }
      case 'textStyle': {
        const style = {}
        if (mark.attrs?.color) style.color = sanitizeCssValue(mark.attrs.color)
        if (mark.attrs?.fontSize) style.fontSize = sanitizeCssValue(mark.attrs.fontSize)
        if (mark.attrs?.fontFamily) style.fontFamily = sanitizeCssValue(mark.attrs.fontFamily)
        if (Object.keys(style).length > 0) {
          current = () => h('span', { style }, [prev()])
        }
        break
      }
      case 'highlight': {
        const color = sanitizeCssValue(mark.attrs?.color || '')
        const style = color ? { backgroundColor: color } : {}
        current = () => h('mark', { style }, [prev()])
        break
      }
    }
  }

  return current
})
</script>
