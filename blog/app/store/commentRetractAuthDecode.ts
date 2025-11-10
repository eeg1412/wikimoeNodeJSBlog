import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCommentRetractAuthDecodeStore = defineStore(
  'commentRetractAuthDecode',
  () => {
    const commentRetractAuthDecode = ref(null)
    function setCommentRetractAuthDecode() {
      console.log('setCommentRetractAuthDecode')
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
          // 验证exp是否过期
          if (
            new Date(
              (commentRetractAuthDecodeValue.exp || 0) * 1000
            ).getTime() < Date.now()
          ) {
            // 如果过期，将commentRetractAuthDecode置为null
            commentRetractAuthDecode.value = null
            // 清空localStorage中的commentRetractJWT
            localStorage.removeItem('commentRetractJWT')
            return
          }
          // 将解码后的值赋值给commentRetractAuthDecode
          commentRetractAuthDecode.value = commentRetractAuthDecodeValue
        } catch (e) {
          // 如果解码失败，将commentRetractAuthDecode置为null
          commentRetractAuthDecode.value = null
        }
      } else {
        // 如果commentRetractJWT不存在，将commentRetractAuthDecode置为null
        commentRetractAuthDecode.value = null
      }
    }
    return { commentRetractAuthDecode, setCommentRetractAuthDecode }
  }
)
