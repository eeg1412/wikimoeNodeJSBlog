export function useIsFullscreen() {
  const isFullscreen = useState('isFullscreen', () => false)

  function setFullscreen(status) {
    isFullscreen.value = status
  }

  return { isFullscreen, setFullscreen }
}
