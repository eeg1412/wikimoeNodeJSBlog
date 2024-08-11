<template>
  <div v-if="ipInfo">
    {{ ipInfo?.countryLong }}
    <template v-if="ipInfo?.region !== ipInfo?.city">
      {{ ' ' + ipInfo?.region }}
    </template>
    <template v-if="ipInfo?.countryLong !== ipInfo?.city">
      {{ ' ' + ipInfo?.city }}
    </template>
  </div>
</template>

<script>
export default {
  props: {
    ipInfo: {
      type: Object,
      default: null,
    },
  },
  setup() {},
}
</script>
