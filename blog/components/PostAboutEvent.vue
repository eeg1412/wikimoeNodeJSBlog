<template>
  <div v-if="eventList.length > 0" class="mt-3 mb-3 relative">
    <div
      v-if="showTitle"
      class="mb-3 text-gray-600 font-bold dark:text-gray-200 text-base border-b border-dotted pb-2 border-gray-300 dark:border-gray-700"
    >
      相关活动：
    </div>
    <div>
      <ul>
        <li
          v-for="event in eventList"
          :key="event._id"
          :id="`event-${idPrefix}-${event._id}-${postId}`"
          class="text-sm text-primary-500 mb-2 header-scroll-margin-top"
        >
          <div class="overflow-hidden overflow-ellipsis whitespace-nowrap">
            <span class="pointer" @click.stop="getEventDetail(event._id)"
              ><span
                v-if="event.eventtype"
                class="post-event-about-event-type"
                :style="{
                  backgroundColor: event.eventtype.color
                }"
                >{{ event.eventtype.name }}</span
              >{{ event.title }}</span
            >
          </div>
        </li>
      </ul>
    </div>
    <ClientOnly>
      <DivLoading :loading="contentIsLoading" v-if="showTitle" />
      <EventDialog v-model:show="eventOpen" :currentData="currentEventData" />
    </ClientOnly>
  </div>
</template>
<script setup>
import { getEventDetailApiFetch } from '@/api/event'
const props = defineProps({
  eventList: {
    type: Array,
    default() {
      return []
    }
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  idPrefix: {
    type: String,
    default: ''
  },
  postId: {
    type: String,
    default: ''
  }
})

const eventOpen = ref(false)
const currentEventData = ref(null)
const contentIsLoading = ref(false)
const getEventDetail = async id => {
  if (contentIsLoading.value) {
    console.log('loading')
    return
  }
  contentIsLoading.value = true
  getEventDetailApiFetch({
    id
  })
    .then(res => {
      currentEventData.value = res.data
      eventOpen.value = true
    })
    .catch(err => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach(item => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red'
          })
        })
      }
    })
    .finally(() => {
      contentIsLoading.value = false
    })
}

const eventClick = event => {}
</script>
<style scoped>
.post-event-about-event-type {
  padding: 2px 5px;
  border-radius: 2px;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  margin-right: 4px;
  display: inline-block;
  line-height: 18px;
}
</style>
