<template>
  <div class="container dark:opacity-80">
    <div class="title bg-primary text-white dark:text-black">程序员老黄历</div>
    <div class="date">
      {{ isLoading ? '正在计算今日运势...' : almanacData?.titleDate || '' }}
    </div>
    <div class="good">
      <div class="title">
        <table>
          <tbody>
            <tr>
              <td class="dark:text-black">宜</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="content">
        <ul>
          <li v-for="(item, index) in almanacData?.goodList || []" :key="index">
            <div class="name">{{ item.name }}</div>
            <div class="description">{{ item.good }}</div>
          </li>
        </ul>
      </div>
      <div class="clear"></div>
    </div>
    <div class="split"></div>
    <div class="bad">
      <div class="title">
        <table>
          <tbody>
            <tr>
              <td class="dark:text-white">不宜</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="content">
        <ul>
          <li v-for="(item, index) in almanacData?.badList || []" :key="index">
            <div class="name">{{ item.name }}</div>
            <div class="description">{{ item.bad }}</div>
          </li>
        </ul>
      </div>
      <div class="clear"></div>
    </div>
    <div class="split"></div>
    <div class="line-tip">
      <strong>座位朝向：</strong>面向<span class="direction_value">{{
        almanacData?.direction_value || ''
      }}</span
      >写程序，BUG 最少。
    </div>
    <div class="line-tip">
      <strong>今日宜饮：</strong
      ><span class="drink_value">{{ almanacData?.drink_value || '' }}</span>
    </div>
    <div class="line-tip">
      <strong>女神亲近指数：</strong
      ><span class="goddes_value">{{ almanacData?.goddes_value || '' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAlmanacApiFetch } from '@/api/almanac'

const almanacData = ref(null)
const isLoading = ref(true)

const getTimezoneOffset = () => {
  // 获取浏览器时区偏移（小时）
  return -new Date().getTimezoneOffset() / 60
}

onMounted(async () => {
  try {
    const timezone = getTimezoneOffset()
    const res = await getAlmanacApiFetch({ timezone })
    if (res?.data) {
      almanacData.value = res.data
    }
    isLoading.value = false
  } catch (error) {
    console.error('Failed to fetch almanac:', error)
    isLoading.value = false
  }
})
</script>

<style scoped>
.container > .title {
  font-weight: bold;
  margin-bottom: 10px;
  padding: 5px 15px;
}

.adlink {
  text-align: center;
  font-size: 11pt;
}

.adlink a {
  text-decoration: none;
  display: block;
  color: #666;
  font-weight: bold;
  margin-bottom: 10px;
  background: #eee;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10pt;
  margin-top: 10pt;
}

.date {
  font-size: 17pt;
  font-weight: bold;
  line-height: 30pt;
  text-align: center;
}

.split,
.clear {
  clear: both;
  height: 1px;
  overflow-y: hidden;
}

.good,
.bad {
  clear: both;
  position: relative;
  min-height: 68px;
}

.good .title,
.bad .title {
  float: left;
  width: 100px;
  font-weight: bold;
  text-align: center;
  font-size: 30pt;
  position: absolute;
  top: 0;
  bottom: 0;
}

.good .title > table,
.bad .title > table {
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
}

.good .title {
  background: #ffee44;
}

.someday .good .title {
  background: #aaaaaa;
}

.bad .title {
  background: #ff4444;
  color: #fff;
}

.someday .bad .title {
  background: #666666;
  color: #fff;
}

.good .content,
.bad .content {
  margin-left: 115px;
  padding-right: 10px;
  padding-top: 1px;
  font-size: 15pt;
}

.someday .good {
  background: #dddddd;
}

.someday .bad {
  background: #aaaaaa;
}

.good {
  background: #ffffaa;
}

.bad {
  background: #ffddd3;
}

.content ul {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
}

.content ul li {
  line-height: 150%;
  font-size: 15pt;
  font-weight: bold;
  color: #444;
}

.content ul li div.description {
  font-size: 11pt;
  font-weight: normal;
  color: #777;
  line-height: 110%;
  margin-bottom: 10px;
}

.line-tip {
  font-size: 11pt;
  margin-top: 10px;
  margin-left: 10px;
}

.direction_value {
  color: #4a4;
  font-weight: bold;
}

.someday .direction_value {
  color: #888;
}

.goddes_value {
  color: #f87;
}

.someday .goddes_value {
  color: #777;
}

.comment {
  margin-top: 50px;
  font-size: 11pt;
  margin-left: 10px;
}

.comment ul {
  margin-left: 0;
  padding-left: 20px;
  color: #999;
}
</style>
