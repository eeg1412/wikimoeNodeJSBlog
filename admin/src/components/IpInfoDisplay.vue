<template>
  <div v-if="ipInfo">
    {{ str }}
  </div>
</template>

<script>
import { getCountryData } from 'js-locations-zh'
import { ref, watch } from 'vue'

export default {
  props: {
    ipInfo: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const str = ref('')

    watch(
      () => props.ipInfo,
      async newIpInfo => {
        if (!newIpInfo) {
          str.value = ''
          return
        }
        const { countryLong = '', region = '', city = '' } = newIpInfo
        if (!countryLong) {
          str.value = ''
          return
        }
        let countryData = undefined
        try {
          countryData = await getCountryData(countryLong)
        } catch (e) {
          countryData = undefined
        }
        const translationMap = countryData?.default
        const countryTranslation =
          translationMap?.get('translation') || countryLong
        const regionTranslationMap = translationMap?.get(region) || undefined
        const regionTranslation =
          regionTranslationMap?.get('translation') || region
        const cityTranslations = regionTranslationMap?.get(city) || city

        str.value = `${countryTranslation}${
          region !== city ? ' ' + regionTranslation : ''
        }${countryLong !== city ? ' ' + cityTranslations : ''}`
      },
      { immediate: true }
    )

    return {
      str
    }
  }
}
</script>
