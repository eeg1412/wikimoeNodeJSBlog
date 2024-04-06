<template>
  <div v-if="eventList.length > 0" class="mt-4 relative">
    <div
      class="mb-4 text-gray-600 font-bold text-base border-b border-dotted pb-3 border-gray-300"
    >
      相关活动：
    </div>
    <div>
      <ul>
        <li
          v-for="event in eventList"
          :key="event._id"
          class="text-sm text-primary-500 pointer mb-2 flex items-center"
          @click="getEventDetail(event._id)"
        >
          <div class="mr-1 flex-shrink-0">
            <UIcon name="i-heroicons-calendar-days" />
          </div>
          <div class="overflow-hidden overflow-ellipsis whitespace-nowrap">
            {{ event.title }}
          </div>
        </li>
      </ul>
    </div>
    <ClientOnly>
      <DivLoading :loading="contentIsLoading" />
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
    },
  },
})

const eventOpen = ref(false)
const currentEventData = ref(null)
const contentIsLoading = ref(false)
const getEventDetail = async (id) => {
  contentIsLoading.value = true
  getEventDetailApiFetch({
    id,
  })
    .then((res) => {
      currentEventData.value = res.data
      eventOpen.value = true
    })
    .catch((err) => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach((item) => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red',
          })
        })
      }
    })
    .finally(() => {
      contentIsLoading.value = false
    })
}

const eventClick = (event) => {}
</script>
<style scoped></style>
