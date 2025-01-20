import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCommentRetractCountDataStore = defineStore(
  'commentRetractCountData',
  () => {
    const commentRetractCountData = ref(null)
    function setCommentRetractCountData() {
      console.log('setCommentRetractCountData')
      // 获取localStorage中的commentRetractJWT
      const commentRetractCountDataStr = localStorage.getItem(
        'commentRetractCountData'
      )
      // 如果commentRetractJWT存在
      if (commentRetractCountDataStr) {
        try {
          // 将commentRetractCountDataStr转换为对象
          const commentRetractCountDataValue = JSON.parse(
            commentRetractCountDataStr
          )
          // 根据todayEndTime判断是否过期
          if (
            new Date(commentRetractCountDataValue.todayEndTime || 0).getTime() <
            Date.now()
          ) {
            // 如果过期，将commentRetractCountData置为null
            commentRetractCountData.value = null
            // 清空localStorage中的commentRetractCountData
            localStorage.removeItem('commentRetractCountData')
            console.log('commentRetractCountData过期')
            return
          }
          // 将解码后的值赋值给commentRetractCountData
          commentRetractCountData.value = commentRetractCountDataValue
        } catch (e) {
          // 如果解码失败，将commentRetractCountData置为null
          commentRetractCountData.value = null
          localStorage.removeItem('commentRetractCountData')
          console.log('commentRetractCountData解码失败')
        }
      } else {
        // 如果commentRetractJWT不存在，将commentRetractCountData置为null
        commentRetractCountData.value = null
      }
    }
    return { commentRetractCountData, setCommentRetractCountData }
  }
)
