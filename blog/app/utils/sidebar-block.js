import { getBangumiSeasonListApiFetch } from '@/api/bangumi'
import { getBookReadingListApiFetch } from '@/api/book'
import { getCommentLatestFetchApi } from '@/api/comment'
import { getGamePlayingListApiFetch } from '@/api/game'
import { getArchiveFetchApi } from '@/api/post'
import { getSortListFetchApi } from '@/api/sort'
import { getRandomTagListFetchApi } from '@/api/tag'
import { getTrendPostListFetchApi } from '@/api/trend'

function readArrayResponse(response, dataName) {
  if (Array.isArray(response)) {
    return response
  }

  throw new Error(`${dataName} response invalid`)
}

function readListPropertyResponse(response, dataName) {
  if (response && Array.isArray(response.list)) {
    return response.list
  }

  throw new Error(`${dataName} response invalid`)
}

export const SIDEBAR_BLOCK_DEFINITIONS = [
  {
    type: 1,
    componentName: 'HtmlContent',
    componentLoader: () => import('@/components/HtmlContent.vue'),
    getProps: item => {
      return {
        content: item.content
      }
    }
  },
  {
    type: 3,
    componentName: 'CommentLatest',
    componentLoader: () => import('@/components/CommentLatest.vue'),
    dataKey: 'commentLatest',
    propName: 'commentLatest',
    fetch: () => getCommentLatestFetchApi(),
    read: response => readArrayResponse(response, 'commentLatest')
  },
  {
    type: 4,
    componentName: 'RandomTagList',
    componentLoader: () => import('@/components/RandomTagList.vue'),
    dataKey: 'randomTagList',
    propName: 'randomTagList',
    fetch: requestParams => getRandomTagListFetchApi(requestParams),
    read: response => readListPropertyResponse(response, 'randomTagList')
  },
  {
    type: 8,
    componentName: 'Sort',
    componentLoader: () => import('@/components/Sort.vue'),
    dataKey: 'sortList',
    propName: 'sortListData',
    fetch: requestParams => getSortListFetchApi(requestParams),
    read: response => readArrayResponse(response, 'sortList')
  },
  {
    type: 9,
    componentName: 'Archive',
    componentLoader: () => import('@/components/Archive.vue'),
    dataKey: 'archiveList',
    propName: 'archiveListData',
    fetch: requestParams => getArchiveFetchApi(requestParams),
    read: response => readArrayResponse(response, 'archiveList')
  },
  {
    type: 10,
    componentName: 'AdsbygoogleHave',
    componentLoader: () => import('@/components/AdsbygoogleHave.vue'),
    getProps: item => {
      return {
        ad: item.content
      }
    }
  },
  {
    type: 11,
    componentName: 'SidebarCustomHtml',
    componentLoader: () => import('@/components/SidebarCustomHtml.vue'),
    getProps: item => {
      return {
        content: item.content
      }
    }
  },
  {
    type: 12,
    componentName: 'TrendPostList',
    componentLoader: () => import('@/components/TrendPostList.vue'),
    dataKey: 'trendPostList',
    propName: 'trendPostList',
    fetch: requestParams => getTrendPostListFetchApi(requestParams),
    read: response => readListPropertyResponse(response, 'trendPostList')
  },
  {
    type: 13,
    componentName: 'BangumiSeasonList',
    componentLoader: () => import('@/components/BangumiSeasonList.vue'),
    dataKey: 'bangumiSeasonList',
    propName: 'bangumiSeasonList',
    fetch: requestParams => getBangumiSeasonListApiFetch(requestParams),
    read: response => readArrayResponse(response, 'bangumiSeasonList')
  },
  {
    type: 14,
    componentName: 'PlayingGameList',
    componentLoader: () => import('@/components/PlayingGameList.vue'),
    dataKey: 'playingGameList',
    propName: 'playingGameList',
    fetch: requestParams => getGamePlayingListApiFetch(requestParams),
    read: response => readArrayResponse(response, 'playingGameList')
  },
  {
    type: 15,
    componentName: 'ReadingBookList',
    componentLoader: () => import('@/components/ReadingBookList.vue'),
    dataKey: 'readingBookList',
    propName: 'readingBookList',
    fetch: requestParams => getBookReadingListApiFetch(requestParams),
    read: response => readArrayResponse(response, 'readingBookList')
  }
]

function normalizeSidebarBlockType(type) {
  return Number(type)
}

function getSidebarBlockDefinition(type) {
  const sidebarBlockType = normalizeSidebarBlockType(type)
  return SIDEBAR_BLOCK_DEFINITIONS.find(definition => {
    return definition.type === sidebarBlockType
  })
}

function hasSidebarBlockType(sidebarList, type) {
  return sidebarList.some(item => {
    return normalizeSidebarBlockType(item?.type) === type
  })
}

function getPreloadDefinitions(sidebarList) {
  return SIDEBAR_BLOCK_DEFINITIONS.filter(definition => {
    if (!definition.dataKey) {
      return false
    }

    if (typeof definition.fetch !== 'function') {
      return false
    }

    if (typeof definition.read !== 'function') {
      return false
    }

    return hasSidebarBlockType(sidebarList, definition.type)
  })
}

function createSidebarDataPreloadTask(definition, sidebarData, requestParams) {
  return definition.fetch(requestParams).then(response => {
    sidebarData[definition.dataKey] = definition.read(response)
  })
}

export function createInitialSidebarData() {
  const sidebarData = {}
  SIDEBAR_BLOCK_DEFINITIONS.forEach(definition => {
    if (definition.dataKey) {
      sidebarData[definition.dataKey] = []
    }
  })
  return sidebarData
}

export async function fetchSidebarBlockData(sidebarList, requestParams) {
  const sidebarData = createInitialSidebarData()
  const tasks = getPreloadDefinitions(sidebarList).map(definition => {
    return createSidebarDataPreloadTask(definition, sidebarData, requestParams)
  })

  await Promise.all(tasks)
  return sidebarData
}

export function getSidebarBlockComponentName(item) {
  const definition = getSidebarBlockDefinition(item?.type)
  if (!definition) {
    return ''
  }

  return definition.componentName || ''
}

export function getSidebarBlockComponentLoader(item) {
  const definition = getSidebarBlockDefinition(item?.type)
  if (!definition) {
    return null
  }

  if (typeof definition.componentLoader !== 'function') {
    return null
  }

  return definition.componentLoader
}

export function createSidebarBlockProps(item, sidebarData) {
  const definition = getSidebarBlockDefinition(item?.type)
  if (!definition) {
    return {}
  }

  if (typeof definition.getProps === 'function') {
    return definition.getProps(item, sidebarData)
  }

  if (definition.dataKey && definition.propName) {
    return {
      [definition.propName]: sidebarData[definition.dataKey]
    }
  }

  return {}
}
