<template>
  <div v-if="ipInfo">
    <div>
      <div class="di">{{ str }}</div>

      <el-tooltip
        effect="dark"
        placement="top"
        :show-after="200"
        max-width="400"
        v-if="str !== englishStr"
      >
        <template #content>
          <div class="tooltip-content">
            {{ englishStr }}
          </div>
        </template>
        <div class="ml5 di">
          <el-link type="primary"><i class="fa fa-language f16"></i></el-link>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { getCountryData } from 'js-locations-zh'
import { ref, watch, computed } from 'vue'

export default {
  props: {
    ipInfo: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const str = ref('加载中...')

    const englishStr = computed(() => {
      if (!props.ipInfo) return ''
      const { countryLong = '', region = '', city = '' } = props.ipInfo
      if (!countryLong) return ''
      const result = `${countryLong}${
        region !== city && region !== countryLong ? ' ' + region : ''
      }${countryLong !== city ? ' ' + city : ''}`
      return result.trim()
    })

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
          region !== city && region !== countryLong
            ? ' ' + regionTranslation
            : ''
        }${countryLong !== city ? ' ' + cityTranslations : ''}`
      },
      { immediate: true }
    )

    return {
      str,
      englishStr
    }
  }
}
</script>
