import { getNaviListFetchApi } from '@/api/navi'
import { getSidebarListFetchApi } from '@/api/sidebar'
import { normalizeLanguageCode } from '@/lang'
import { readApiListResponse } from '@/utils/api-response'
import { resolveDefaultLanguageCode } from '@/utils/default-language'
import {
  createInitialSidebarData,
  fetchSidebarBlockData
} from '@/utils/sidebar-block'
import { getRouteCode } from '~/composables/useLang'

function createInitialLayoutLanguageSnapshot() {
  return {
    languageCode: '',
    isLocalizedRoute: false,
    naviSourceList: [],
    sidebarList: [],
    sidebarData: createInitialSidebarData()
  }
}

function createInitialLayoutLanguageSwitchState() {
  return {
    isSwitching: false,
    targetLanguageCode: '',
    sequence: 0
  }
}

function readConfiguredListResponse(response, dataName) {
  if (Array.isArray(response)) {
    return response
  }

  if (response && Array.isArray(response.data)) {
    return readApiListResponse(response)
  }

  throw new Error(`${dataName} response invalid`)
}

function createRequestParams(languageContext) {
  if (!languageContext.isLocalizedRoute) {
    return {}
  }

  return {
    languageCode: languageContext.languageCode
  }
}

function getLayoutLanguageContext(targetRoute, targetOptions) {
  const routeLanguageCode = normalizeLanguageCode(getRouteCode(targetRoute))
  if (routeLanguageCode) {
    return {
      isLocalizedRoute: true,
      languageCode: routeLanguageCode
    }
  }

  return {
    isLocalizedRoute: false,
    languageCode: resolveDefaultLanguageCode(targetOptions)
  }
}

function getLayoutLanguageCode(targetRoute, targetOptions) {
  return getLayoutLanguageContext(targetRoute, targetOptions).languageCode
}

async function fetchSidebarData(sidebarList, languageContext) {
  const requestParams = createRequestParams(languageContext)
  return fetchSidebarBlockData(sidebarList, requestParams)
}

async function loadLayoutLanguageSnapshot(targetRoute, targetOptions) {
  const languageContext = getLayoutLanguageContext(targetRoute, targetOptions)
  const requestParams = createRequestParams(languageContext)
  const [naviResponse, sidebarResponse] = await Promise.all([
    getNaviListFetchApi(requestParams),
    getSidebarListFetchApi(requestParams)
  ])
  const naviSourceList = readConfiguredListResponse(naviResponse, 'naviList')
  const sidebarList = readConfiguredListResponse(sidebarResponse, 'sidebarList')
  const sidebarData = await fetchSidebarData(sidebarList, languageContext)

  return {
    ...languageContext,
    naviSourceList,
    sidebarList,
    sidebarData
  }
}

function isSnapshotReadyForLanguage(snapshot, languageContext) {
  if (snapshot.languageCode !== languageContext.languageCode) {
    return false
  }

  if (snapshot.isLocalizedRoute !== languageContext.isLocalizedRoute) {
    return false
  }

  if (!Array.isArray(snapshot.naviSourceList)) {
    return false
  }

  if (!Array.isArray(snapshot.sidebarList)) {
    return false
  }

  return Boolean(snapshot.sidebarData)
}

export function useLayoutLanguageSnapshot() {
  const layoutLanguageSnapshot = useState(
    'layoutLanguageSnapshot',
    createInitialLayoutLanguageSnapshot
  )
  const layoutLanguageSwitchState = useState(
    'layoutLanguageSwitchState',
    createInitialLayoutLanguageSwitchState
  )
  const isLayoutLanguageSwitching = computed(() => {
    return layoutLanguageSwitchState.value.isSwitching
  })

  function beginLayoutLanguageSwitch(targetLanguageCode) {
    const sequence = layoutLanguageSwitchState.value.sequence + 1
    layoutLanguageSwitchState.value = {
      isSwitching: true,
      targetLanguageCode,
      sequence
    }
    return sequence
  }

  function isCurrentLayoutLanguageSwitch(sequence) {
    return layoutLanguageSwitchState.value.sequence === sequence
  }

  function finishLayoutLanguageSwitch(sequence) {
    if (!isCurrentLayoutLanguageSwitch(sequence)) {
      return
    }

    layoutLanguageSwitchState.value = {
      ...layoutLanguageSwitchState.value,
      isSwitching: false,
      targetLanguageCode: ''
    }
  }

  function commitLayoutLanguageSnapshot(snapshot) {
    layoutLanguageSnapshot.value = snapshot
    return layoutLanguageSnapshot.value
  }

  async function prepareLayoutLanguageSnapshot(targetRoute, targetOptions) {
    return loadLayoutLanguageSnapshot(targetRoute, targetOptions)
  }

  async function ensureLayoutLanguageSnapshot(targetRoute, targetOptions) {
    const languageContext = getLayoutLanguageContext(
      targetRoute,
      targetOptions
    )
    if (
      isSnapshotReadyForLanguage(layoutLanguageSnapshot.value, languageContext)
    ) {
      return layoutLanguageSnapshot.value
    }

    const snapshot = await loadLayoutLanguageSnapshot(
      targetRoute,
      targetOptions
    )
    return commitLayoutLanguageSnapshot(snapshot)
  }

  return {
    layoutLanguageSnapshot,
    layoutLanguageSwitchState,
    isLayoutLanguageSwitching,
    beginLayoutLanguageSwitch,
    isCurrentLayoutLanguageSwitch,
    finishLayoutLanguageSwitch,
    prepareLayoutLanguageSnapshot,
    commitLayoutLanguageSnapshot,
    ensureLayoutLanguageSnapshot,
    getLayoutLanguageCode
  }
}
