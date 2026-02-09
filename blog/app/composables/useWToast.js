import { ref } from 'vue'

const toasts = ref([])
let idCounter = 0

export function useWToast() {
  function add(toast) {
    const id = ++idCounter
    const timeout = toast.timeout ?? 5000
    const newToast = {
      id,
      title: toast.title || '',
      description: toast.description || '',
      icon: toast.icon || '',
      color: toast.color || 'primary',
      actions: toast.actions || [],
      timeout
    }
    toasts.value.push(newToast)

    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }

    return id
  }

  function remove(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clear() {
    toasts.value = []
  }

  return { toasts, add, remove, clear }
}
