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

function createRequestParams(languageCode) {
  return {
    languageCode
  }
}

function getLayoutLanguageCode(targetRoute, targetOptions) {
  const routeLanguageCode = normalizeLanguageCode(getRouteCode(targetRoute))
  if (routeLanguageCode) {
    return routeLanguageCode
  }

  return resolveDefaultLanguageCode(targetOptions)
}

async function fetchSidebarData(sidebarList, languageCode) {
  const requestParams = createRequestParams(languageCode)
  return fetchSidebarBlockData(sidebarList, requestParams)
}

async function loadLayoutLanguageSnapshot(targetRoute, targetOptions) {
  const languageCode = getLayoutLanguageCode(targetRoute, targetOptions)
  const requestParams = createRequestParams(languageCode)
  const [naviResponse, sidebarResponse] = await Promise.all([
    getNaviListFetchApi(requestParams),
    getSidebarListFetchApi(requestParams)
  ])
  const naviSourceList = readConfiguredListResponse(naviResponse, 'naviList')
  const sidebarList = readConfiguredListResponse(sidebarResponse, 'sidebarList')
  const sidebarData = await fetchSidebarData(sidebarList, languageCode)

  return {
    languageCode,
    naviSourceList,
    sidebarList,
    sidebarData
  }
}

function isSnapshotReadyForLanguage(snapshot, languageCode) {
  if (snapshot.languageCode !== languageCode) {
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
    const languageCode = getLayoutLanguageCode(targetRoute, targetOptions)
    if (
      isSnapshotReadyForLanguage(layoutLanguageSnapshot.value, languageCode)
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
