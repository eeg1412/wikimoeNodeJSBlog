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

      const parts = [countryLong]

      // 如果国家和省不同，才考虑添加省
      if (region !== countryLong) {
        // 如果省和城市不同，添加省
        if (region !== city) {
          parts.push(region)
        } else if (region === city) {
          // 如果省和城市相同，优先显示省
          parts.push(region)
        }
      }

      // 只在省和城市不同且省不等于国家且城市不等于国家时添加城市
      if (region !== city && region !== countryLong && countryLong !== city) {
        parts.push(city)
      }

      return parts.join(' ')
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

        const parts = [countryTranslation]

        // 如果国家和省不同，才考虑添加省
        if (region !== countryLong) {
          // 如果省和城市不同，添加省
          if (region !== city) {
            parts.push(regionTranslation)
          } else if (region === city) {
            // 如果省和城市相同，优先显示省
            parts.push(regionTranslation)
          }
        }

        // 只在省和城市不同且省不等于国家且城市不等于国家时添加城市
        if (region !== city && region !== countryLong && countryLong !== city) {
          parts.push(cityTranslations)
        }

        str.value = parts.join(' ')
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
