export const applyThemeToDom = newTheme => {
  const validThemes = ['light', 'dark']
  if (!validThemes.includes(newTheme)) return
  document.documentElement.setAttribute('data-theme', newTheme)
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}
