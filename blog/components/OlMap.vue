<template>
  <div class="ol-map-container">
    <div ref="mapContainer" class="ol-map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useOptionStore } from '@/store/options'

// Props - 接收父组件传入的标记点数据
const props = defineProps({
  markers: {
    type: Array,
    default: () => []
    // 数据格式: [{ _id, title, longitude, latitude, summary?, status? }]
  }
})

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

// Emits - 向父组件发射事件
const emit = defineEmits(['markerClick', 'mapReady'])

// 组件引用
const mapContainer = ref(null)

// 地图相关变量
let map = null
let overlay = null
let markerSource = null
let markerLayer = null
let worldSource = null
let worldLayer = null

// OpenLayers 相关类
let olClasses = null
// 缓存样式，避免在 layer style 回调中频繁创建
let STYLES = null
// 用于 markers 更新去抖
let markersUpdateTimer = null

// 配置常量
const CONFIG = {
  WORLD_EXTENT: null,
  INITIAL_CENTER: options.value?.olMapDefaultCenter,
  INITIAL_ZOOM: options.value?.olMapDefaultZoom,
  MIN_ZOOM: 1,
  MAX_ZOOM: 18
}

// 异步加载 OpenLayers 依赖
const loadOpenLayers = async () => {
  const [
    olModule,
    olLayerModule,
    olSourceModule,
    olGeomModule,
    olFeatureModule,
    olStyleModule,
    olInteractionModule,
    olProjModule,
    olFormatModule,
    olControlModule
  ] = await Promise.all([
    import('ol'),
    import('ol/layer'),
    import('ol/source'),
    import('ol/geom'),
    import('ol/Feature'),
    import('ol/style'),
    import('ol/interaction'),
    import('ol/proj'),
    import('ol/format'),
    import('ol/control')
  ])

  // 动态导入 CSS
  await import('ol/ol.css')

  return {
    Map: olModule.Map,
    View: olModule.View,
    Overlay: olModule.Overlay,
    VectorLayer: olLayerModule.Vector,
    VectorSource: olSourceModule.Vector,
    Point: olGeomModule.Point,
    Polygon: olGeomModule.Polygon,
    Feature: olFeatureModule.default,
    Style: olStyleModule.Style,
    Circle: olStyleModule.Circle,
    Fill: olStyleModule.Fill,
    Stroke: olStyleModule.Stroke,
    Text: olStyleModule.Text,
    fromLonLat: olProjModule.fromLonLat,
    toLonLat: olProjModule.toLonLat,
    getProjection: olProjModule.get,
    GeoJSON: olFormatModule.GeoJSON,
    interactionDefaults: olInteractionModule.defaults,
    controlDefaults: olControlModule.defaults,
    Zoom: olControlModule.Zoom
  }
}
const maxTouchPoints = navigator?.maxTouchPoints || 0
const setMarkerTextVisibility = classes => {
  const olMapShowMappointText = options.value?.olMapShowMappointText
  if (olMapShowMappointText) {
    let offsetY = -16
    if (maxTouchPoints > 0) {
      // 触屏设备上增大偏移，避免遮挡点
      offsetY = -17
    }
    return label =>
      new classes.Text({
        text: label || '',
        declutterMode: 'declutter',
        offsetY: offsetY,
        fill: new classes.Fill({ color: '#000' }),
        stroke: new classes.Stroke({ color: '#fff', width: 2 }),
        font: '12px sans-serif'
      })
  } else {
    return undefined
  }
}

// 样式配置工厂函数
const createStyles = classes => {
  let radius = 6
  if (maxTouchPoints > 0) {
    // 触屏设备上增大点的半径，方便点击
    radius = 7
  }
  return {
    marker: new classes.Style({
      image: new classes.Circle({
        radius: radius,
        declutterMode: 'obstacle',
        fill: new classes.Fill({ color: '#d85f85' }),
        stroke: new classes.Stroke({ color: '#fff', width: 2 })
      })
    }),
    markerText: setMarkerTextVisibility(classes),
    world: new classes.Style({
      fill: new classes.Fill({ color: '#ef8fa750' }),
      stroke: new classes.Stroke({ color: '#ef8fa750', width: 1 })
    })
  }
}

const mapIsReady = ref(false)

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return

  try {
    // 异步加载 OpenLayers
    olClasses = await loadOpenLayers()

    // 获取世界范围
    CONFIG.WORLD_EXTENT = olClasses.getProjection('EPSG:3857').getExtent()

    // 创建样式并缓存
    STYLES = createStyles(olClasses)

    // 创建标记点图层（不在 layer-level 创建 style，改为在添加 feature 时设置一次性 style）
    markerSource = new olClasses.VectorSource({ wrapX: true })
    markerLayer = new olClasses.VectorLayer({
      source: markerSource,
      declutter: true
    })

    // 创建世界地图图层
    worldSource = new olClasses.VectorSource({ wrapX: true })
    worldLayer = new olClasses.VectorLayer({
      source: worldSource,
      style: STYLES.world
    })

    // 创建缩放控件
    const zoomControl = new olClasses.Zoom({
      zoomInLabel: '+', // 按钮可见文本（也可用 HTML 节点）
      zoomOutLabel: '-',
      zoomInTipLabel: '放大', // tooltip 文案
      zoomOutTipLabel: '缩小'
    })

    // 创建地图
    map = new olClasses.Map({
      target: mapContainer.value,
      // 禁用旋转交互（Alt+Shift 拖拽旋转 与 触控捏合旋转）
      interactions: olClasses.interactionDefaults({
        altShiftDragRotate: false,
        pinchRotate: false
      }),
      controls: olClasses
        .controlDefaults({ zoom: false })
        .extend([zoomControl]),
      layers: [worldLayer, markerLayer],
      view: new olClasses.View({
        center: olClasses.fromLonLat(CONFIG.INITIAL_CENTER),
        zoom: CONFIG.INITIAL_ZOOM,
        minZoom: CONFIG.MIN_ZOOM,
        maxZoom: CONFIG.MAX_ZOOM
        // extent: CONFIG.WORLD_EXTENT
      })
    })

    // 添加事件监听
    setupEventListeners()

    // 加载世界地图数据
    await loadWorldData()

    // 添加标记点
    if (markersUpdateTimer) clearTimeout(markersUpdateTimer)
    markersUpdateTimer = setTimeout(() => {
      addMarkersToMap()
    }, 60)

    // 向父组件发射地图已准备好事件
    emit('mapReady', map)
    mapIsReady.value = true
  } catch (error) {
    console.error('Failed to initialize map:', error)
  }
}

// 加载世界地图数据
const loadWorldData = async () => {
  if (!olClasses || !worldSource) return
  const olMapMapPrecision = options.value?.olMapMapPrecision || 1
  try {
    const olMapMapPrecisionMap = {
      1: 'world-low.json',
      2: 'world-mid.json'
    }
    const response = await fetch(
      `/geojson/${olMapMapPrecisionMap[olMapMapPrecision]}`
    )
    if (!response.ok) throw new Error('本地 world.geojson 未找到')

    const geojson = await response.json()
    const features = new olClasses.GeoJSON().readFeatures(geojson, {
      featureProjection: 'EPSG:3857'
    })
    worldSource.addFeatures(features)
  } catch (error) {
    console.warn('使用默认世界地图:', error.message)
    // 创建简化的世界矩形
    const rect = new olClasses.Polygon([
      [
        [CONFIG.WORLD_EXTENT[0], CONFIG.WORLD_EXTENT[1]],
        [CONFIG.WORLD_EXTENT[2], CONFIG.WORLD_EXTENT[1]],
        [CONFIG.WORLD_EXTENT[2], CONFIG.WORLD_EXTENT[3]],
        [CONFIG.WORLD_EXTENT[0], CONFIG.WORLD_EXTENT[3]],
        [CONFIG.WORLD_EXTENT[0], CONFIG.WORLD_EXTENT[1]]
      ]
    ])
    worldSource.addFeature(new olClasses.Feature({ geometry: rect }))
  }
}

// 设置事件监听器
const setupEventListeners = () => {
  if (!map || !olClasses) return
  let hitTolerance = 0
  if (maxTouchPoints > 0) {
    // 触屏设备上增大容差，方便点击
    hitTolerance = 8
  }
  // 单击事件
  map.on('click', evt => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, {
      layerFilter: layer => layer === markerLayer,
      hitTolerance: hitTolerance
    })

    if (feature) {
      const markerData = feature.get('markerData')
      console.log('Marker clicked:', markerData)
      // 向父组件发射点击事件
      emit('markerClick', markerData)
    }
  })

  // 鼠标移动事件
  map.on('pointermove', evt => {
    if (evt.dragging) return
    const hit = map.hasFeatureAtPixel(evt.pixel, {
      layerFilter: layer => layer === markerLayer
    })
    map.getTargetElement().style.cursor = hit ? 'pointer' : ''
  })
}

// 添加单个标记点
const addMarker = markerData => {
  if (!markerSource || !olClasses) return

  const feature = new olClasses.Feature({
    geometry: new olClasses.Point(
      olClasses.fromLonLat([markerData.longitude, markerData.latitude])
    ),
    label: markerData.title,
    markerData: markerData
  })
  // 给 feature 一次性设置 style，避免 layer 的 style 回调在每次渲染时创建新对象
  if (STYLES && STYLES.marker) {
    const style = STYLES.marker.clone()
    style.setZIndex(markerData.zIndex || 0)
    if (STYLES.markerText) {
      style.setText(STYLES.markerText(markerData.title))
    }
    feature.setStyle(style)
  }
  markerSource.addFeature(feature)
}

// 添加所有标记点到地图
const addMarkersToMap = () => {
  if (!markerSource) return

  // 清除现有标记点并添加新的标记点
  // 对大量点可以改为 diff 增量，这里先保持简单：一次 clear + add
  markerSource.clear()
  props.markers.forEach((marker, index) => {
    const markerZIndex = marker.zIndex
    if (!markerZIndex) {
      // 如果没有设置 zIndex，则按顺序设置，保证后添加的点在上层
      marker.zIndex = 0 - index
    }
    addMarker(marker)
  })
}

// 监听标记点数据变化
watch(
  () => props.markers,
  () => {
    if (mapIsReady.value === false) return
    // 防抖：避免父组件短时间内多次修改导致连续重建
    if (markersUpdateTimer) clearTimeout(markersUpdateTimer)
    markersUpdateTimer = setTimeout(() => {
      if (map && markerSource) addMarkersToMap()
    }, 60)
  },
  { deep: true }
)

// 组件挂载
onMounted(async () => {
  await nextTick()
  await initMap()
})

// 组件销毁
onUnmounted(() => {
  // 销毁地图
  if (map) {
    map.setTarget(null)
    map = null
  }

  // 清理引用
  overlay = null
  markerSource = null
  markerLayer = null
  worldSource = null
  worldLayer = null
  olClasses = null
  STYLES = null
  if (markersUpdateTimer) {
    clearTimeout(markersUpdateTimer)
    markersUpdateTimer = null
  }
})
</script>

<style scoped>
.ol-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.ol-map {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ol-popup {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 12px;
  min-width: 200px;
  max-width: 300px;
  z-index: 1000;
}

.ol-popup-content {
  font-size: 14px;
  line-height: 1.4;
}

.marker-popup strong {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 15px;
}

.marker-summary {
  margin: 8px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.3;
}

.marker-coords {
  margin-top: 8px;
  color: #888;
  font-size: 12px;
  border-top: 1px solid #eee;
  padding-top: 6px;
}

/* 覆盖 OpenLayers 默认样式 */
:deep(.ol-zoom) {
  top: 0.5em;
  left: 0.5em;
}

:deep(.ol-attribution) {
  right: 0.5em;
  bottom: 0.5em;
}
</style>
