<template>
  <div
    class="blog-layout-left-body"
    @focusin="emit('focusin')"
    :class="{
      active: active
    }"
  >
    <div
      class="justify-between layout-close-btn-body type-l layout-mobile-navi-btn-body"
    >
      <div class="text-xl font-bold">{{ t('common.navigation.menu') }}</div>
      <div class="text-xl cursor-pointer" @click="emit('close')">
        <WUIIcon name="i-heroicons-x-mark" />
      </div>
    </div>
    <div class="blog-layout-sticky custom-scroll blog-layout-info-menu">
      <div class="blog-layout-left-top-info-body">
        <div>
          <nuxt-link :to="homePath">
            <img
              v-if="options.siteLogo"
              class="blog-layout-sitelogo light"
              :src="options.siteLogo"
              :alt="options.siteTitle"
            />
            <img
              v-if="options.siteDarkLogo"
              class="blog-layout-sitelogo dark"
              :src="options.siteDarkLogo"
              :alt="options.siteTitle"
            />
          </nuxt-link>
        </div>
        <div class="blog-layout-desc">
          <p>{{ options.siteDescription }}</p>
        </div>
      </div>
      <ul class="blog-layout-sidebar-body custom-scroll" :key="languageCode">
        <template v-for="(item, index) in naviList" :key="index">
          <NaviItem :item="item" />
        </template>
      </ul>
      <transition name="fade">
        <div
          class="blog-layout-info-menu-bg blog-layout-info-menu-bt-img"
          :class="{
            pageloaded: !pageLoading
          }"
        ></div>
      </transition>
    </div>
  </div>
</template>
<script setup>
import { getNaviListFetchApi } from '@/api/navi'
import { readApiListResponse } from '@/utils/api-response'

defineProps({
  active: {
    type: Boolean,
    default: false
  },
  pageLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'focusin'])
const { options } = useOptions()
const { defaultLanguageCode, languageCode, localePath, t } = useLang()

const homePath = computed(() => localePath('/'))

const { data: naviResponse } = await useAsyncData(
  'layout-left-menu-navi-list',
  () => {
    return getNaviListFetchApi({
      languageCode: languageCode.value
    })
  },
  {
    watch: [languageCode, defaultLanguageCode]
  }
)

const naviSourceList = computed(() => {
  return readApiListResponse(naviResponse.value)
})

const naviList = computed(() => {
  return [
    {
      naviname: t('common.navigation.home'),
      url: '/',
      isdefault: true
    },
    ...naviSourceList.value
  ]
})
</script>
<style scoped>
.blog-layout-left-body {
  @apply border-r-2 border-primary-100/30 border-solid;
  width: 298px;
  box-sizing: border-box;
  flex: 0 0 298px;
  order: 0;
}
.layout-close-btn-body {
  display: none;
}
.layout-mobile-navi-btn-body {
  background: #ffffff;
  padding: 20px;
  position: sticky;
  top: 0px;
  z-index: 2;
}
.blog-layout-info-menu {
  height: 100vh;
  height: 100dvh;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.blog-layout-left-top-info-body,
.blog-layout-info-menu-bt-img {
  flex-shrink: 0;
}
.blog-layout-info-menu-bt-img {
  height: 250px;
  width: 100%;
  border-bottom-left-radius: 20px;
  opacity: 1;
}
.blog-layout-left-top-info-body {
  padding: 18px 18px 0 18px;
  box-sizing: border-box;
}
.blog-layout-info-menu-bg {
  background-image: url('/img/menuBg.png?v=2');
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 100%;
}
.blog-layout-info-menu-bg.no-bg {
  background-image: none;
}
.blog-layout-sticky {
  @apply bg-primary-50/10;
  position: sticky;
  top: 0px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}
.blog-layout-sitelogo {
  width: 100%;
}
a:focus-visible .blog-layout-sitelogo {
  @apply outline-2 outline-primary-500 outline;
}
.blog-layout-desc {
  padding: 15px 0;
  border-bottom: 1px solid #e2e2e2;
}
.blog-layout-sidebar-body {
  flex: 1;
  box-sizing: border-box;
  padding: 18px;
  overflow: auto;
}

@media (max-width: 1024px) {
  .layout-close-btn-body.type-l {
    display: flex;
  }
  .blog-layout-info-menu-bt-img {
    display: none;
  }
  .blog-layout-info-menu-bg,
  .blog-layout-sidebar-body {
    padding-top: 0px;
  }
  .blog-layout-info-menu {
    min-height: calc(100dvh - 68px);
    background: #ffffff;
    height: auto;
  }
  .blog-layout-left-body {
    background-color: #ffffff;
    transform: translateX(-100%);
    opacity: 0;
    transition: all 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 21;
    width: 100%;
    height: 100%;
    border-right: 0px solid #fff7f9;
    display: block;
    overflow: auto;
  }
  .blog-layout-left-body.active {
    transform: translateX(0%);
    opacity: 1;
  }
  .blog-layout-sticky {
    background-image: none;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }
  .blog-layout-left-top-info-body {
    display: none;
  }
  .blog-layout-left-body.show {
    display: block;
  }
}

@media (max-height: 600px) {
  .blog-layout-info-menu-bg {
    background-image: none;
    display: none;
  }
}
</style>
