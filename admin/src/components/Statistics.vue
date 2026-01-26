<template>
  <div>
    <div class="el-descriptions__header">
      <div class="el-descriptions__title">统计排名</div>
      <div class="el-descriptions__extra statistics-extra-area">
        <div>
          <el-date-picker
            v-model="timeRange"
            :popper-class="pickerClass"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="shortcuts"
            teleported
            :editable="false"
            :clearable="false"
            :disabled-date="timeRangeDisabledDate"
            :default-time="[
              new Date().setHours(0, 0, 0, 0),
              new Date().setHours(23, 59, 59, 999)
            ]"
            @change="getStatistics(true)"
          />
        </div>
        <div class="mt5 tr">
          <span class="pr5">排序优先级：</span>
          <el-radio-group
            v-model="dataSortPriority"
            @change="getStatistics(true)"
          >
            <el-radio label="ip" size="small">IP</el-radio>
            <el-radio label="pv" size="small">PV</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <!-- showData 按钮展示 -->
    <div class="show-data-area" v-if="!showData">
      <el-button type="primary" @click="tryShowData" text> 显示数据 </el-button>
    </div>
    <el-row v-if="rankData">
      <!-- 文章阅读 rankData.readPostViewData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">文章阅读</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostViewData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostViewData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="标题">
              <template #default="{ row }">
                <!-- 判断type，如果是2就用 row.excerpt 否则用title -->
                <div class="di">
                  <template v-if="row.type === 2">
                    {{ reduceText(row.excerpt) }}
                  </template>
                  <template v-else>
                    {{ reduceText(row.title) }}
                  </template>
                </div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt" v-if="[1, 2, 3].includes(row.type)">
                  <el-link type="primary" @click="openPage(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostViewData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostViewData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostViewData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostViewPagination.currentPage"
              v-model:page-size="readPostViewPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 文章点赞统计 rankData.readPostLikeData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">文章点赞</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostLikeData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostLikeData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="标题">
              <template #default="{ row }">
                <!-- 判断type，如果是2就用 row.excerpt 否则用title -->
                <div class="di">
                  <template v-if="row.type === 2">
                    {{ reduceText(row.excerpt) }}
                  </template>
                  <template v-else>
                    {{ reduceText(row.title) }}
                  </template>
                </div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt" v-if="[1, 2, 3].includes(row.type)">
                  <el-link type="primary" @click="openPage(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="点赞量" prop="count" width="100px">
              <template #default="{ row }">
                {{ row.count }}
                <span class="wm-stats-percent-3">{{
                  getPercent(row, 'count', 'readPostLikeData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostLikeData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostLikePagination.currentPage"
              v-model:page-size="readPostLikePagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 文章分享 rankData.readPostShareData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">文章分享</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostShareData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostShareData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="标题">
              <template #default="{ row }">
                <!-- 判断type，如果是2就用 row.excerpt 否则用title -->
                <div class="di">
                  <template v-if="row.type === 2">
                    {{ reduceText(row.excerpt) }}
                  </template>
                  <template v-else>
                    {{ reduceText(row.title) }}
                  </template>
                </div>
                <!-- 点击打开按钮 -->
                <div class="dib ml5 vt" v-if="[1, 2, 3].includes(row.type)">
                  <el-link type="primary" @click="openPage(row)"
                    ><i class="fas fa-external-link-alt"></i
                  ></el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="分享量" prop="count" width="100px">
              <template #default="{ row }">
                {{ row.count }}
                <span class="wm-stats-percent-3">{{
                  getPercent(row, 'count', 'readPostShareData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostShareData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostSharePagination.currentPage"
              v-model:page-size="readPostSharePagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 文章分享方式 rankData.readPostSharePlatformData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">文章分享方式</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostSharePlatformData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostSharePlatformData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="_id" label="平台名称">
              <template #default="{ row }">
                <div>
                  {{ SHARE_MAP[row._id]?.alt || '未知分享方式' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="分享量" prop="count" width="100px">
              <template #default="{ row }">
                {{ row.count }}
                <span class="wm-stats-percent-3">{{
                  getPercent(row, 'count', 'readPostSharePlatformData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostSharePlatformData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostSharePlatformPagination.currentPage"
              v-model:page-size="readPostSharePlatformPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 来源 rankData.readReferrerData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">来源</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readReferrerData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readReferrerData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="_id" label="来源"> </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readReferrerData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readReferrerData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readReferrerData.length"
              :pager-count="5"
              small
              v-model:current-page="readReferrerPagination.currentPage"
              v-model:page-size="readReferrerPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 分类 rankData.readPostListSortData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">分类</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListSortData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListSortData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="sortname" label="分类"> </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListSortData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListSortData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListSortData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListSortPagination.currentPage"
              v-model:page-size="readPostListSortPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- tag rankData.readPostListTagData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">标签</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListTagData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListTagData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="tagname" label="标签"> </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListTagData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListTagData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListTagData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListTagPagination.currentPage"
              v-model:page-size="readPostListTagPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 站内关键词 rankData.readPostListKeywordData -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">站内关键词</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListKeywordData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListKeywordData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="_id" label="关键词"> </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListKeywordData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListKeywordData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListKeywordData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListKeywordPagination.currentPage"
              v-model:page-size="readPostListKeywordPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 番剧文章统计 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">番剧文章列表</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListBangumiData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListBangumiData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="番剧名称">
              <template #default="{ row }">
                <div>{{ reduceText(row.title) }}</div>
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListBangumiData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListBangumiData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListBangumiData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListBangumiPagination.currentPage"
              v-model:page-size="readPostListBangumiPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 电影访问统计 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">电影文章列表</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListMovieData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListMovieData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="电影名称">
              <template #default="{ row }">
                <div>{{ reduceText(row.title) }}</div>
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListMovieData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListMovieData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListMovieData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListMoviePagination.currentPage"
              v-model:page-size="readPostListMoviePagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 书籍访问统计 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">书籍文章列表</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListBookData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListBookData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="书籍名称">
              <template #default="{ row }">
                <div>{{ reduceText(row.title) }}</div>
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListBookData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListBookData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListBookData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListBookPagination.currentPage"
              v-model:page-size="readPostListBookPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <!-- 游戏访问统计 -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">游戏文章列表</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListGameData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListGameData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="游戏名称">
              <template #default="{ row }">
                <div>{{ reduceText(row.title) }}</div>
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListGameData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListGameData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListGameData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListGamePagination.currentPage"
              v-model:page-size="readPostListGamePagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 地点访问统计 -->
      <el-col :span="24" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">地点文章列表</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="readPostListMappointData"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('readPostListMappointData')"
            style="width: 100%"
            height="440px"
          >
            <el-table-column prop="title" label="地点名称">
              <template #default="{ row }">
                <div>{{ reduceText(row.title) }}</div>
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'readPostListMappointData')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'readPostListMappointData')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.readPostListMappointData.length"
              :pager-count="5"
              small
              v-model:current-page="readPostListMappointPagination.currentPage"
              v-model:page-size="readPostListMappointPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 浏览器统计 rankData.browserStats -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">操作系统</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="osStatsData"
            style="width: 100%"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('osStats')"
            height="440px"
            default-expand-all
          >
            <el-table-column min-width="200px" label="操作系统/版本号">
              <!-- 如果存在version显示version 否则显示 _id -->
              <template #default="{ row }">
                <span>
                  {{ row.version ? row.version : row._id }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'osStats')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'osStats')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.osStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="osStatsPagination.currentPage"
              v-model:page-size="osStatsPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">浏览器</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="browserStatsData"
            style="width: 100%"
            row-key="_id"
            class="wm-stats-table"
            :cell-style="tableCellStyle('browserStats')"
            height="440px"
            default-expand-all
          >
            <el-table-column min-width="200px" label="浏览器/版本号">
              <!-- 如果存在version显示version 否则显示 _id -->
              <template #default="{ row }">
                <span>
                  {{ row.version ? row.version : row._id }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'browserStats')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'browserStats')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.browserStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="browserStatsPagination.currentPage"
              v-model:page-size="browserStatsPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 新增: 语言统计 rankData.languageStats -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">语言</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="languageStatsData"
            style="width: 100%"
            class="wm-stats-table"
            :cell-style="tableCellStyle('languageStats')"
            height="440px"
          >
            <el-table-column prop="_id" label="语言代码"> </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'languageStats')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'languageStats')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.languageStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="languageStatsPagination.currentPage"
              v-model:page-size="languageStatsPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 新增: 完整语言环境统计 rankData.fullLocaleStats -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">完整语言环境</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="fullLocaleStatsData"
            style="width: 100%"
            class="wm-stats-table"
            :cell-style="tableCellStyle('fullLocaleStats')"
            height="440px"
          >
            <el-table-column prop="_id" label="语言环境代码"> </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'fullLocaleStats')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'fullLocaleStats')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.fullLocaleStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="fullLocaleStatsPagination.currentPage"
              v-model:page-size="fullLocaleStatsPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 国家统计 rankData.countryStats -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">国家/地区</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="countryStatsData"
            style="width: 100%"
            height="440px"
            class="wm-stats-table"
            :cell-style="tableCellStyle('countryStats')"
          >
            <el-table-column prop="_id" label="国家/地区">
              <template #default="{ row }">
                <IpInfoDisplay
                  :ipInfo="{
                    countryLong: row._id
                  }"
                />
              </template>
            </el-table-column>

            <el-table-column label="IP" prop="ipCount" width="100px">
              <template #default="{ row }">
                {{ row.ipCount }}
                <span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'countryStats')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="PV" prop="pvCount" width="100px">
              <template #default="{ row }">
                {{ row.pvCount }}
                <span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'countryStats')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.countryStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="countryStatsPagination.currentPage"
              v-model:page-size="countryStatsPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 地区统计 rankData.regionStats -->
      <el-col :span="12" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">行政区划</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="regionStatsData"
            style="width: 100%"
            height="440px"
            class="wm-stats-table"
            :cell-style="tableCellStyle('regionStats')"
          >
            <el-table-column prop="location" label="行政区划">
              <template #default="{ row }">
                <IpInfoDisplay :ipInfo="row.ipInfo" />
              </template>
            </el-table-column>

            <el-table-column prop="ipCount" label="IP" width="160px">
              <template #default="{ row }">
                <span>{{ row.ipCount }}</span
                ><span class="wm-stats-percent-1">{{
                  getPercent(row, 'ipCount', 'regionStats')
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="pvCount" label="PV" width="160px">
              <template #default="{ row }">
                <span>{{ row.pvCount }}</span
                ><span class="wm-stats-percent-2">{{
                  getPercent(row, 'pvCount', 'regionStats')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.regionStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="regionStatsPagination.currentPage"
              v-model:page-size="regionStatsPagination.pageSize"
            />
          </div>
        </div>
      </el-col>

      <!-- 新增: 爬虫统计 rankData.botStats -->
      <el-col :span="24" :xs="24" class="p10">
        <div class="mb10 fb statistics-title">爬虫</div>
        <div class="mb10 statistics-panel">
          <el-table
            :data="botStatsData"
            style="width: 100%"
            height="440px"
            class="wm-stats-table"
            :cell-style="tableCellStyle('botStats')"
          >
            <el-table-column prop="_id" label="爬虫名称"></el-table-column>
            <el-table-column prop="count" label="访问量" width="160px">
              <template #default="{ row }">
                <span>{{ row.count }}</span
                ><span class="wm-stats-percent-3">{{
                  getPercent(row, 'count', 'botStats')
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="dflex flexCenter mt10">
            <el-pagination
              layout="prev, pager, next"
              :total="rankData.botStats?.length || 0"
              :pager-count="5"
              small
              v-model:current-page="botStatsPagination.currentPage"
              v-model:page-size="botStatsPagination.pageSize"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { onMounted, reactive, ref, computed } from 'vue'
import { generateRandomAlphabetString } from '@/utils/utils'
import { authApi } from '@/api'
import moment from 'moment'
import store from '@/store'
import { SHARE_MAP } from '@/utils/variableMap'

export default {
  setup() {
    const pickerClass = ref(generateRandomAlphabetString(12))
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const timeRange = ref([startOfDay, endOfDay])
    const shortcuts = [
      // 今天
      {
        text: '今天',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      // 昨天
      {
        text: '昨天',
        value: () => {
          const end = new Date()
          end.setHours(0, 0, 0, 0)
          end.setTime(end.getTime() - 1)
          const start = new Date()
          start.setHours(0, 0, 0, 0)
          start.setTime(start.getTime() - 3600 * 1000 * 24)
          return [start, end]
        }
      },
      {
        text: '过去3天',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setDate(start.getDate() - 2) // 减去2天
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去7天',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setDate(start.getDate() - 6) // 减去6天
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去1个月',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setMonth(start.getMonth() - 1)
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去3个月',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setMonth(start.getMonth() - 3)
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      },
      {
        text: '过去一年',
        value: () => {
          const end = new Date()
          end.setHours(23, 59, 59, 999)
          const start = new Date()
          start.setFullYear(start.getFullYear() - 1)
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      }
    ]

    const timeRangeDisabledDate = time => {
      const today = new Date()
      const past370Days = new Date()
      past370Days.setDate(today.getDate() - 370)
      return (
        time.getTime() < past370Days.getTime() ||
        time.getTime() > today.getTime()
      )
    }

    // 数据排序优先级（IP优先，PV优先，默认IP优先）
    const dataSortPriority = ref('ip')

    const rankData = ref(null)
    const getStatistics = resetPage => {
      const startTime = new Date(timeRange.value[0])
      const endTime = new Date(timeRange.value[1])
      // 如果endTime是当天，则时间是当前时间
      if (moment(endTime).isSame(moment(), 'day')) {
        endTime.setHours(new Date().getHours(), new Date().getMinutes())
      }
      authApi
        .getStatistics({
          startTime: startTime,
          endTime: endTime,
          dataSortPriority: dataSortPriority.value
        })
        .then(res => {
          if (resetPage) {
            readPostViewPagination.currentPage = 1
            readPostLikePagination.currentPage = 1
            readPostSharePagination.currentPage = 1
            readPostSharePlatformPagination.currentPage = 1
            readReferrerPagination.currentPage = 1
            readPostListSortPagination.currentPage = 1
            readPostListTagPagination.currentPage = 1
            readPostListKeywordPagination.currentPage = 1
            readPostListBangumiPagination.currentPage = 1
            readPostListMoviePagination.currentPage = 1
            readPostListBookPagination.currentPage = 1
            readPostListGamePagination.currentPage = 1
            readPostListMappointPagination.currentPage = 1
            browserStatsPagination.currentPage = 1
            osStatsPagination.currentPage = 1
            countryStatsPagination.currentPage = 1
            regionStatsPagination.currentPage = 1
            botStatsPagination.currentPage = 1
            languageStatsPagination.currentPage = 1 // 新增: 重置语言统计分页
            fullLocaleStatsPagination.currentPage = 1 // 新增: 重置完整语言环境统计分页
          }
          // 遍历browserStats 和 osStats 的children 并定义一个 _id + version 的新_id
          res.data.browserStats.forEach(item => {
            if (item.children && item.children.length) {
              item.children.forEach(child => {
                child._id = `${item._id}-${
                  child.version || ''
                }-${generateRandomAlphabetString(6)}`
              })
            }
          })
          res.data.osStats.forEach(item => {
            if (item.children && item.children.length) {
              item.children.forEach(child => {
                child._id = `${item._id}-${
                  child.version || ''
                }-${generateRandomAlphabetString(6)}`
              })
            }
          })
          console.log('获取统计数据', res.data)
          rankData.value = res.data
          calculateTotals()
          showData.value = true
        })
    }

    const totals = reactive({})

    const calculateTotals = () => {
      const keys = [
        { key: 'readReferrerData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostViewData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostLikeData', fields: ['count'] },
        { key: 'readPostShareData', fields: ['count'] },
        { key: 'readPostSharePlatformData', fields: ['count'] },
        { key: 'readPostListSortData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostListTagData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostListKeywordData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostListBangumiData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostListMovieData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostListBookData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostListGameData', fields: ['ipCount', 'pvCount'] },
        { key: 'readPostListMappointData', fields: ['ipCount', 'pvCount'] },
        { key: 'browserStats', fields: ['ipCount', 'pvCount'] },
        { key: 'osStats', fields: ['ipCount', 'pvCount'] },
        { key: 'countryStats', fields: ['ipCount', 'pvCount'] },
        { key: 'regionStats', fields: ['ipCount', 'pvCount'] },
        { key: 'botStats', fields: ['count'] },
        { key: 'languageStats', fields: ['ipCount', 'pvCount'] },
        { key: 'fullLocaleStats', fields: ['ipCount', 'pvCount'] }
      ]

      keys.forEach(({ key, fields }) => {
        totals[key] = {}
        const list = rankData.value[key] || []
        fields.forEach(field => {
          totals[key][field] = list.reduce(
            (acc, curr) => acc + (curr[field] || 0),
            0
          )
        })
      })
    }

    const getPercent = (row, field, dataKey) => {
      const val = row[field] || 0
      const total = totals[dataKey]?.[field] || 0
      if (total === 0) return '(0.0%)'
      return `(${((val / total) * 100).toFixed(1)}%)`
    }

    const tableCellStyle =
      dataKey =>
      ({ row, column }) => {
        const field = column.property
        if (!field || !['ipCount', 'pvCount', 'count'].includes(field))
          return {}

        const val = row[field] || 0
        const total = totals[dataKey]?.[field] || 0
        const p = total === 0 ? 0 : (val / total) * 100

        let color = 'rgba(64, 158, 255, 0.3)' // Default blue
        if (field === 'pvCount') {
          color = 'rgba(103, 194, 58, 0.3)' // Green
        }

        return {
          backgroundImage: `linear-gradient(to right, ${color} 0%, ${color} ${p}%, transparent ${p}%, transparent 100%)`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }
      }

    // 缩减文字到20字的方法
    const reduceText = text => {
      if (text.length > 20) {
        return text.substring(0, 20) + '...'
      }
      return text
    }

    const siteUrl = computed(() => {
      return store.getters.siteUrl
    })

    const openPage = row => {
      const path = getPostPagePath(row)
      // 使用 window.open 方法在新窗口中打开 URL
      window.open(path, '_blank')
    }
    const getPostPagePath = row => {
      // 先判断type是1，2还是3，1和2跳转到/post/id，3跳转到/page/id
      // 如果有别名，就跳转到别名，没有别名就跳转到id
      let path
      if (row.type === 1 || row.type === 2) {
        path = '/post/'
      } else if (row.type === 3) {
        path = '/page/'
      } else {
        console.error('Invalid row type:', row.type)
        return
      }

      if (row.alias) {
        path += row.alias
      } else {
        path += row._id
      }
      return siteUrl.value + path
    }

    // readPostView的翻页对象
    const readPostViewPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readPostView的computed
    const readPostViewData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostViewData.slice(
          (readPostViewPagination.currentPage - 1) *
            readPostViewPagination.pageSize,
          readPostViewPagination.currentPage * readPostViewPagination.pageSize
        )
      }
      return []
    })
    // readPostLike 的翻页对象
    const readPostLikePagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readPostLike 的computed
    const readPostLikeData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostLikeData.slice(
          (readPostLikePagination.currentPage - 1) *
            readPostLikePagination.pageSize,
          readPostLikePagination.currentPage * readPostLikePagination.pageSize
        )
      }
      return []
    })
    // readPostShare 的翻页对象
    const readPostSharePagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readPostShare 的computed
    const readPostShareData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostShareData.slice(
          (readPostSharePagination.currentPage - 1) *
            readPostSharePagination.pageSize,
          readPostSharePagination.currentPage * readPostSharePagination.pageSize
        )
      }
      return []
    })
    // readPostSharePlatform 的翻页对象
    const readPostSharePlatformPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readPostSharePlatform 的computed
    const readPostSharePlatformData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostSharePlatformData.slice(
          (readPostSharePlatformPagination.currentPage - 1) *
            readPostSharePlatformPagination.pageSize,
          readPostSharePlatformPagination.currentPage *
            readPostSharePlatformPagination.pageSize
        )
      }
      return []
    })
    // readReferrer 的翻页对象
    const readReferrerPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readReferrer 的computed
    const readReferrerData = computed(() => {
      if (rankData.value) {
        return rankData.value.readReferrerData.slice(
          (readReferrerPagination.currentPage - 1) *
            readReferrerPagination.pageSize,
          readReferrerPagination.currentPage * readReferrerPagination.pageSize
        )
      }
      return []
    })
    // readPostListSort
    const readPostListSortPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readPostListSort 的computed
    const readPostListSortData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostListSortData.slice(
          (readPostListSortPagination.currentPage - 1) *
            readPostListSortPagination.pageSize,
          readPostListSortPagination.currentPage *
            readPostListSortPagination.pageSize
        )
      }
      return []
    })
    // readPostListTag
    const readPostListTagPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readPostListTag 的computed
    const readPostListTagData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostListTagData.slice(
          (readPostListTagPagination.currentPage - 1) *
            readPostListTagPagination.pageSize,
          readPostListTagPagination.currentPage *
            readPostListTagPagination.pageSize
        )
      }
      return []
    })
    // readPostListKeyword
    const readPostListKeywordPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // readPostListKeyword 的computed
    const readPostListKeywordData = computed(() => {
      if (rankData.value) {
        return rankData.value.readPostListKeywordData.slice(
          (readPostListKeywordPagination.currentPage - 1) *
            readPostListKeywordPagination.pageSize,
          readPostListKeywordPagination.currentPage *
            readPostListKeywordPagination.pageSize
        )
      }
      return []
    })

    // 浏览器统计分页对象
    const browserStatsPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 浏览器统计数据计算属性
    const browserStatsData = computed(() => {
      if (rankData.value && rankData.value.browserStats) {
        return rankData.value.browserStats.slice(
          (browserStatsPagination.currentPage - 1) *
            browserStatsPagination.pageSize,
          browserStatsPagination.currentPage * browserStatsPagination.pageSize
        )
      }
      return []
    })

    // 操作系统统计分页对象
    const osStatsPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 操作系统统计数据计算属性
    const osStatsData = computed(() => {
      if (rankData.value && rankData.value.osStats) {
        return rankData.value.osStats.slice(
          (osStatsPagination.currentPage - 1) * osStatsPagination.pageSize,
          osStatsPagination.currentPage * osStatsPagination.pageSize
        )
      }
      return []
    })

    // 国家统计分页对象
    const countryStatsPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 国家统计数据计算属性
    const countryStatsData = computed(() => {
      if (rankData.value && rankData.value.countryStats) {
        return rankData.value.countryStats.slice(
          (countryStatsPagination.currentPage - 1) *
            countryStatsPagination.pageSize,
          countryStatsPagination.currentPage * countryStatsPagination.pageSize
        )
      }
      return []
    })

    // 地区统计分页对象
    const regionStatsPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 地区统计数据计算属性
    const regionStatsData = computed(() => {
      if (rankData.value && rankData.value.regionStats) {
        return rankData.value.regionStats.slice(
          (regionStatsPagination.currentPage - 1) *
            regionStatsPagination.pageSize,
          regionStatsPagination.currentPage * regionStatsPagination.pageSize
        )
      }
      return []
    })

    // 番剧访问统计分页对象
    const readPostListBangumiPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 番剧访问统计数据计算属性
    const readPostListBangumiData = computed(() => {
      if (rankData.value && rankData.value.readPostListBangumiData) {
        return rankData.value.readPostListBangumiData.slice(
          (readPostListBangumiPagination.currentPage - 1) *
            readPostListBangumiPagination.pageSize,
          readPostListBangumiPagination.currentPage *
            readPostListBangumiPagination.pageSize
        )
      }
      return []
    })

    // 电影访问统计分页对象
    const readPostListMoviePagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 电影访问统计数据计算属性
    const readPostListMovieData = computed(() => {
      if (rankData.value && rankData.value.readPostListMovieData) {
        return rankData.value.readPostListMovieData.slice(
          (readPostListMoviePagination.currentPage - 1) *
            readPostListMoviePagination.pageSize,
          readPostListMoviePagination.currentPage *
            readPostListMoviePagination.pageSize
        )
      }
      return []
    })

    // 书籍访问统计分页对象
    const readPostListBookPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 书籍访问统计数据计算属性
    const readPostListBookData = computed(() => {
      if (rankData.value && rankData.value.readPostListBookData) {
        return rankData.value.readPostListBookData.slice(
          (readPostListBookPagination.currentPage - 1) *
            readPostListBookPagination.pageSize,
          readPostListBookPagination.currentPage *
            readPostListBookPagination.pageSize
        )
      }
      return []
    })

    // 游戏访问统计分页对象
    const readPostListGamePagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 游戏访问统计数据计算属性
    const readPostListGameData = computed(() => {
      if (rankData.value && rankData.value.readPostListGameData) {
        return rankData.value.readPostListGameData.slice(
          (readPostListGamePagination.currentPage - 1) *
            readPostListGamePagination.pageSize,
          readPostListGamePagination.currentPage *
            readPostListGamePagination.pageSize
        )
      }
      return []
    })

    // 地点访问统计分页对象
    const readPostListMappointPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 地点访问统计数据计算属性
    const readPostListMappointData = computed(() => {
      if (rankData.value && rankData.value.readPostListMappointData) {
        return rankData.value.readPostListMappointData.slice(
          (readPostListMappointPagination.currentPage - 1) *
            readPostListMappointPagination.pageSize,
          readPostListMappointPagination.currentPage *
            readPostListMappointPagination.pageSize
        )
      }
      return []
    })

    // 新增: 爬虫统计分页对象
    const botStatsPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 新增: 爬虫统计数据计算属性
    const botStatsData = computed(() => {
      if (rankData.value && rankData.value.botStats) {
        return rankData.value.botStats.slice(
          (botStatsPagination.currentPage - 1) * botStatsPagination.pageSize,
          botStatsPagination.currentPage * botStatsPagination.pageSize
        )
      }
      return []
    })

    // 新增: 语言统计分页对象
    const languageStatsPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 新增: 语言统计数据计算属性
    const languageStatsData = computed(() => {
      if (rankData.value && rankData.value.languageStats) {
        return rankData.value.languageStats.slice(
          (languageStatsPagination.currentPage - 1) *
            languageStatsPagination.pageSize,
          languageStatsPagination.currentPage * languageStatsPagination.pageSize
        )
      }
      return []
    })

    // 新增: 完整语言环境统计分页对象
    const fullLocaleStatsPagination = reactive({
      currentPage: 1,
      pageSize: 10
    })
    // 新增: 完整语言环境统计数据计算属性
    const fullLocaleStatsData = computed(() => {
      if (rankData.value && rankData.value.fullLocaleStats) {
        return rankData.value.fullLocaleStats.slice(
          (fullLocaleStatsPagination.currentPage - 1) *
            fullLocaleStatsPagination.pageSize,
          fullLocaleStatsPagination.currentPage *
            fullLocaleStatsPagination.pageSize
        )
      }
      return []
    })

    const showData = ref(false)
    const tryShowData = () => {
      getStatistics()
    }

    onMounted(() => {
      // getStatistics()
      const queryClass = `.${pickerClass.value} .el-picker-panel__icon-btn.arrow-left`
      const arrowLeft = document.querySelector(queryClass)
      if (arrowLeft) {
        arrowLeft.click()
      }
    })

    return {
      SHARE_MAP,

      timeRange,
      pickerClass,
      shortcuts,
      timeRangeDisabledDate,

      dataSortPriority,

      rankData,
      getStatistics,
      reduceText,
      openPage,

      readPostViewPagination,
      readPostViewData,
      readPostLikePagination,
      readPostLikeData,
      readPostSharePagination,
      readPostShareData,
      readPostSharePlatformPagination,
      readPostSharePlatformData,
      readReferrerPagination,
      readReferrerData,
      readPostListSortPagination,
      readPostListSortData,
      readPostListTagPagination,
      readPostListTagData,
      readPostListKeywordPagination,
      readPostListKeywordData,

      // 新增的四个统计面板相关变量
      readPostListBangumiPagination,
      readPostListBangumiData,
      readPostListMoviePagination,
      readPostListMovieData,
      readPostListBookPagination,
      readPostListBookData,
      readPostListGamePagination,
      readPostListGameData,
      readPostListMappointPagination,
      readPostListMappointData,

      browserStatsPagination,
      browserStatsData,
      osStatsPagination,
      osStatsData,
      countryStatsPagination,
      countryStatsData,
      regionStatsPagination,
      regionStatsData,

      // 新增: 爬虫统计相关变量
      botStatsPagination,
      botStatsData,

      // 新增: 语言统计相关变量
      languageStatsPagination,
      languageStatsData,

      // 新增: 完整语言环境统计相关变量
      fullLocaleStatsPagination,
      fullLocaleStatsData,

      showData,
      tryShowData,
      getPercent,
      tableCellStyle
    }
  }
}
</script>
<style scoped>
.statistics-title {
  height: 20px;
  line-height: 20px;
}
.statistics-panel {
  border: 1px solid var(--el-border-color);
  height: 485px;
  box-sizing: border-box;
  padding-bottom: 10px;
}
.statistics-panel.type-small {
  height: 222.5px;
}
.statistics-extra-area {
  display: flex;
  /* 从右到左 */
  flex-direction: row-reverse;
  gap: 10px;
}
.statistics-extra-area :deep(.el-radio) {
  margin-right: 16px;
}

/* Ensure progress bars are not hidden on hover */
.wm-stats-table :deep(.el-table__row:hover > td.el-table__cell) {
  background-color: transparent !important;
}
.wm-stats-percent-1 {
  color: #409eff;
  font-size: 12px;
  margin-left: 5px;
}
.wm-stats-percent-2 {
  color: #67c23a;
  font-size: 12px;
  margin-left: 5px;
}
.wm-stats-percent-3 {
  color: #409eff;
  font-size: 12px;
  margin-left: 5px;
}
.wm-stats-percent {
  color: #999;
  font-size: 12px;
  margin-left: 5px;
}
/* 小于1024 时换行 */
@media (max-width: 1024px) {
  .statistics-extra-area {
    flex-wrap: wrap;
    width: 250px;
    gap: 5px;
  }
}
</style>
