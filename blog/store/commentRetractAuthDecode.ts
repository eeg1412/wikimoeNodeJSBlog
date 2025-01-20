import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCommentRetractAuthDecodeStore = defineStore(
  'commentRetractAuthDecode',
  () => {
    const commentRetractAuthDecode = ref(null)
    function setCommentRetractAuthDecode() {
      // 获取localStorage中的commentRetractJWT
      const commentRetractJWT = localStorage.getItem('commentRetractJWT')
      // 如果commentRetractJWT存在
      if (commentRetractJWT) {
        // 这是jwt需要解码
        try {
          // 解码
          const commentRetractAuthDecodeValue = JSON.parse(
            atob(commentRetractJWT.split('.')[1])
          )
          // 将解码后的值赋值给commentRetractAuthDecode
          commentRetractAuthDecode.value = commentRetractAuthDecodeValue
        } catch (e) {
          // 如果解码失败，将commentRetractAuthDecode置为null
          commentRetractAuthDecode.value = null
        }
      }
    }
    return { commentRetractAuthDecode, setCommentRetractAuthDecode }
  }
)
