import { h, render } from 'vue'
import CheckDialog from '@/components/CheckDialog.vue'

class CheckDialogService {
  static open(props) {
    return new Promise((resolve, reject) => {
      let container = document.createElement('div')
      document.body.appendChild(container)

      const destroy = () => {
        if (!container) return
        render(null, container)
        document.body.removeChild(container)
        container = null
      }

      const close = () => {
        vNode.component.props.isOpen = false
      }

      const vNode = h(CheckDialog, {
        ...props,
        isOpen: true,
        onConfirm: () => {
          resolve()
          close()
        },
        'onUpdate:isOpen': value => {
          if (!value) {
            console.log(vNode)
            close()
            reject()
          }
        },
        onClosed: destroy
      })

      render(vNode, container)
    })
  }
}

export default CheckDialogService
