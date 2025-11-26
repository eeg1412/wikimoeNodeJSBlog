export function usePswpIsOpen() {
  const pswpIsOpen = useState('pswpIsOpen', () => false)

  function setPswpIsOpen(status) {
    pswpIsOpen.value = status
  }

  return { pswpIsOpen, setPswpIsOpen }
}
