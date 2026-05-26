<template>
  <div class="post-detail-body" v-if="postData?.data" ref="postDetailBody">
    <!-- 头部 -->
    <div
      class="post-blog-head"
      v-if="postData.data.type === 1 || postData.data.type === 2"
    >
      <div class="post-author-avatar-body">
        <img
          class="post-author-avatar"
          :src="postAuthor.photo"
          :alt="postAuthor.nickname"
          width="50"
          height="50"
        />
      </div>
      <div class="post-right-info">
        <h2 class="post-title mb-1" v-if="postData.data.type === 1">
          {{ postData.data.title || t('common.post.noTitle') }}
        </h2>
        <h2 class="post-title mb-1" v-else-if="postData.data.type === 2">
          {{ t('common.post.tweetTitle') }}
        </h2>
        <div class="post-extra cGray94 leading-[1.5]">
          <span class="inline-flex items-center align-middle gap-1 mr-2.5">
            <WUIIcon
              name="i-heroicons-user"
              class="size-[1em] shrink-0 post-extra-icon"
            />
            <span>{{ postAuthor.nickname }}</span>
          </span>

          <!-- <span class="tenten align-middle"></span> -->

          <span class="inline-flex items-center align-middle gap-1 mr-2.5">
            <WUIIcon
              name="i-heroicons-clock"
              class="size-[1em] shrink-0 post-extra-icon"
            />
            <span>{{ formatDate(postData.data.date) }}</span>
          </span>

          <span
            v-if="postData.data.sort"
            class="post_sort_link_span align-middle"
          >
            <!-- <span class="tenten align-middle"></span> -->

            <span class="inline-flex items-center align-middle gap-1 mr-2.5">
              <WUIIcon
                name="i-heroicons-folder"
                class="size-[1em] shrink-0 post-extra-icon"
              />

              <NuxtLink
                class="common-a"
                :to="{
                  name: 'postListSort',
                  params: {
                    code: languageCode,
                    sortid: postData.data.sort.alias || postData.data.sort._id,
                    page: 1
                  }
                }"
              >
                {{ postData.data.sort.sortname }}
              </NuxtLink>
            </span>
          </span>
          <!-- 多语言信息接口有效时才显示语言块；失败、超时或未配置时整块不渲染。 -->
          <span
            class="post-language-switcher align-middle mr-2.5"
            v-if="hasPostLanguageBlock"
          >
            <!-- 存在其他可选语言时才显示 WUIPopover 和下拉箭头。 -->
            <WUIPopover
              :popper="{ arrow: true }"
              class="post-language-popover"
              v-if="hasPostLanguageSwitcher"
            >
              <button
                class="post-language-trigger common-focus-visible-btn-outline hover:text-primary-500"
                :class="{
                  'post-language-trigger-disabled': isLayoutLanguageSwitching
                }"
                :disabled="isLayoutLanguageSwitching"
                type="button"
              >
                <WUIIcon
                  name="i-heroicons-language"
                  class="size-[1em] shrink-0 post-extra-icon"
                />
                <span>{{ currentLanguageLabel }}</span>
                <WUIIcon
                  name="i-heroicons-chevron-down-20-solid"
                  class="size-[1em] shrink-0"
                />
              </button>
              <template #panel="{ close }">
                <div class="post-language-panel p-2" @click.stop>
                  <NuxtLink
                    class="post-language-option flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-500 dark:text-gray-200 dark:hover:bg-gray-800"
                    :class="{
                      'post-language-option-disabled': isLayoutLanguageSwitching
                    }"
                    v-for="item in selectablePostLanguageList"
                    :key="item.code"
                    :to="getPostLanguagePath(item.code)"
                    :aria-disabled="isLayoutLanguageSwitching"
                    :tabindex="languageOptionTabindex"
                    @click="
                      event => handlePostLanguageOptionClick(event, close)
                    "
                  >
                    <span>{{ item.label }}</span>
                  </NuxtLink>
                </div>
              </template>
            </WUIPopover>
            <!-- 只有当前语言可用、没有其他语言可切换时，只静态显示当前语言。 -->
            <span class="post-language-static" v-else>
              <WUIIcon
                name="i-heroicons-language"
                class="size-[1em] shrink-0 post-extra-icon"
              />
              <span>{{ currentLanguageLabel }}</span>
            </span>
          </span>
        </div>
      </div>
    </div>
    <div v-else-if="postData.data.type === 3">
      <template v-if="pageTemplate === 'almanac'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <LazyPageAlmanac />
          <div class="mb-5"></div>
          <LazyPageSeeking />
        </div>
      </template>
      <template v-else-if="pageTemplate === 'link'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <LazyPageLink />
        </div>
      </template>
      <template v-else-if="pageTemplate === 'about'">
        <LazyPageAbout :author="postAuthor" />
      </template>
      <!-- bangumi -->
      <template v-else-if="pageTemplate === 'bangumi'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <LazyPageBangumi />
        </div>
      </template>
      <!-- movieList -->
      <template v-else-if="pageTemplate === 'movieList'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <LazyPageMovieList />
        </div>
      </template>
      <!-- gameList -->
      <template v-else-if="pageTemplate === 'gameList'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <LazyPageGameList />
        </div>
      </template>
      <!-- bookList -->
      <template v-else-if="pageTemplate === 'bookList'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <LazyPageBookList />
        </div>
      </template>
      <!-- event -->
      <template v-else-if="pageTemplate === 'event'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <ClientOnly>
            <LazyPageEvent />
          </ClientOnly>
        </div>
      </template>
      <!-- map -->
      <template v-else-if="pageTemplate === 'map'">
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
          <LazyPageOlMap />
        </div>
      </template>
      <template v-else>
        <div>
          <h2 class="post-title mb-3">{{ postData.data.title }}</h2>
        </div>
      </template>
    </div>
    <!-- 文章内容 -->
    <div
      class="post-html-content-body"
      v-if="postData.data.type === 1 || postData.data.type === 3"
      id="postHtmlContent"
    >
      <LazyHtmlContent :content="postData.data.content" />
      <!-- tags -->
      <div
        class="mt-1 mb-1"
        v-if="
          postData.data.tags.length > 0 || postData.data.mappointList.length > 0
        "
      >
        <template v-for="(tag, index) in postData.data.tags" :key="index">
          <NuxtLink
            class="post-detail-tag-item"
            :to="{
              name: 'postListTag',
              params: { tagid: tag._id, page: 1 }
            }"
            >#{{ tag.tagname }}</NuxtLink
          >
        </template>
        <template
          v-for="(mappoint, index) in postData.data.mappointList"
          :key="index"
        >
          <NuxtLink
            class="post-detail-tag-item"
            :to="{
              name: 'postListMappoint',
              params: { mappointid: mappoint._id, page: 1 }
            }"
            ><WUIIcon
              name="i-heroicons-map-pin-solid"
              class="post-detail-map-pin-icon"
              size="14"
            />{{ mappoint.title }}</NuxtLink
          >
        </template>
      </div>
    </div>

    <div
      v-else-if="postData.data.type === 2"
      class="post-tweet-detail-content-body"
    >
      <div class="post-tweet-detail-content">
        <LazyTweetContent
          :content="postData.data.excerpt"
          :tags="postData.data.tags"
          :mappointList="postData.data.mappointList"
          :contentEventList="postData.data.contentEventList"
          :contentVoteList="postData.data.contentVoteList"
          :contentPostList="postData.data.contentPostList"
          :contentTweetList="postData.data.contentTweetList"
          :contentBangumiList="postData.data.contentBangumiList"
          :contentGameList="postData.data.contentGameList"
          :contentBookList="postData.data.contentBookList"
          :contentMovieList="postData.data.contentMovieList"
          :coverImages="postData.data.coverImages"
          :contentSeriesSortList="postData.data.contentSeriesSortList"
          :postId="postData.data._id"
        >
        </LazyTweetContent>
      </div>
    </div>

    <!-- 运行代码按钮 -->
    <div class="post-run-code-body mt-3 mb-5" v-if="code">
      <WUIButton
        size="md"
        color="primary"
        variant="solid"
        :label="t('common.post.runCode')"
        :trailing="false"
        @click="runCode"
      />
    </div>

    <div
      class="post-detail-action-body flex justify-center items-center gap-2 my-4"
    >
      <div
        :class="{
          'opacity-20': !isHydrated
        }"
        v-if="options.siteEnableFooterQRCodeButton"
      >
        <LazyQRCodePopover :post="postData.data" />
      </div>

      <div
        :class="{
          'opacity-20': !isHydrated
        }"
        v-if="options.siteEnableShareButton"
      >
        <!-- 分享按钮 -->
        <LazySharePopover :post="postData.data" @shareadd="shareadd">
          <WUIButton
            icon="i-heroicons-share"
            size="md"
            color="primary"
            variant="outline"
            :label="
              t('common.post.shares', {
                count: formatNumberText(postData.data.shares)
              })
            "
            :trailing="false"
          />
        </LazySharePopover>
      </div>

      <div>
        <!-- 点赞按钮 -->
        <div class="post-detail-like-body" v-if="likeListInited">
          <WUIButton
            icon="i-heroicons-heart-solid"
            size="md"
            color="primary"
            :variant="colorMode.value === 'dark' ? 'soft' : 'solid'"
            :label="
              t('common.post.likes', {
                count: formatNumberText(postData.data.likes)
              })
            "
            :trailing="false"
            :loading="likeListLoading || likePostIsLoading"
            v-if="postData.data.isLike"
            @click="likePost"
          />
          <WUIButton
            icon="i-heroicons-heart"
            size="md"
            color="primary"
            variant="outline"
            :label="
              t('common.post.likes', {
                count: formatNumberText(postData.data.likes)
              })
            "
            :trailing="false"
            :loading="likeListLoading || likePostIsLoading"
            v-else
            @click="likePost"
          />
        </div>
        <div class="post-detail-like-body dflex flexCenter opacity-20" v-else>
          <WUIButton
            icon="i-heroicons-heart"
            size="md"
            color="primary"
            variant="outline"
            disabled
            :label="
              t('common.post.likes', {
                count: formatNumberText(postData.data.likes)
              })
            "
            :trailing="false"
          />
        </div>
      </div>
    </div>

    <!-- 文章通用底部内容 -->
    <LazyPostCommonFooter
      :post="postData.data"
      v-if="showPostCommonFooter && postData.data"
    />
    <!-- 循环seriesSortListCom -->
    <template v-for="(item, index) in seriesSortListCom" :key="index">
      <template v-if="item === 'event'">
        <LazyPostAboutEvent
          :eventList="postData.data.eventList"
          :postId="postData.data._id"
          v-if="postData.data.eventList.length > 0"
        />
      </template>
      <template v-else-if="item === 'vote'">
        <LazyPostVote
          :voteList="postData.data.voteList"
          :postId="postData.data._id"
          v-if="postData.data.voteList.length > 0"
        />
      </template>
      <template v-else-if="item === 'post'">
        <LazyPostAbout
          :postList="postData.data.postList"
          :postId="postData.data._id"
          v-if="postData.data.postList.length > 0"
        />
      </template>
      <template v-else-if="item === 'tweet'">
        <LazyTweetAbout
          :tweetList="postData.data.tweetList"
          :postId="postData.data._id"
          v-if="postData.data.tweetList.length > 0"
        />
      </template>
      <template v-else-if="item === 'acgn'">
        <LazyPostACG
          :bangumiList="postData.data.bangumiList"
          :gameList="postData.data.gameList"
          :bookList="postData.data.bookList"
          :movieList="postData.data.movieList"
          :postId="postData.data._id"
          v-if="
            postData.data.bangumiList.length > 0 ||
            postData.data.gameList.length > 0 ||
            postData.data.bookList.length > 0 ||
            postData.data.movieList.length > 0
          "
        />
      </template>
    </template>
    <!-- randomPostList -->
    <LazyPostPageRandomPostList
      v-if="
        postData.data.randomPostList && postData.data.randomPostList.length > 0
      "
      :randomPostList="postData.data.randomPostList"
    />
    <!-- 广告 -->
    <div
      class="google-ad-post-detail mt-4"
      v-if="options.googleAdEnabled && options.googleAdPostBottomEnabled"
    >
      <LazyAdsbygoogleHave :ad="options.googleAdPostBottomParams" />
    </div>
    <!-- 评论 -->
    <!-- 评论列表 commentList -->
    <div
      class="relative pt-4 header-scroll-margin-top"
      id="commentlist-container"
    >
      <ClientOnly>
        <div class="comment-list-body">
          <!-- 评论form -->
          <LazyCommentForm
            v-if="sourceArticleId"
            :postid="sourceArticleId"
            :allowRemark="postData.data.allowRemark"
            @refresh="refreshCommentList"
          />
          <DivLoading
            :loading="commentLoading"
            :text="t('common.status.loading')"
          />
          <!-- 评论 -->
          <div
            class="pt-3 border-t border-solid border-gray-200 dark:border-gray-700"
            ref="commentListRef"
            v-if="commentTotal > 0"
          >
            <div class="comment-list-title flex justify-between items-center">
              <div>{{ t('common.comment.title') }}</div>
              <div class="comment-list-sort flex justify-between items-center">
                <WUIButton
                  size="2xs"
                  :color="commentSortType === 'date' ? 'primary' : 'gray'"
                  variant="link"
                  @click="changeCommentSort('date')"
                  >{{ t('common.comment.sortByDate') }}</WUIButton
                >
                <!-- 中间间隔线 -->
                <span class="comment-list-sort-line"></span>
                <WUIButton
                  size="2xs"
                  :color="commentSortType === 'like' ? 'primary' : 'gray'"
                  variant="link"
                  @click="changeCommentSort('like')"
                  >{{ t('common.comment.sortByLike') }}</WUIButton
                >
              </div>
            </div>
            <div
              class="comment-list-item header-scroll-margin-top"
              v-for="(item, index) in commentList"
              :id="`comment-${item._id}`"
              :key="item._id"
            >
              <div
                class="comment-list-item-alert"
                v-if="alertCommentId === item._id"
              ></div>
              <div class="flex">
                <div class="comment-list-item-avatar-body">
                  <a
                    class="comment-list-item-avatar-link"
                    :href="item.url"
                    rel="ugc nofollow"
                    target="_blank"
                    v-if="item.url"
                  >
                    <Avatar :avatar="item.avatar" :alt="item.nickname" />
                  </a>
                  <Avatar :avatar="item.avatar" :alt="item.nickname" v-else />
                </div>
                <div class="comment-list-item-right-info">
                  <div>
                    <div
                      class="comment-list-item-author flex justify-between items-center"
                    >
                      <div>
                        <a
                          class="pr-1"
                          :href="item.url"
                          rel="ugc nofollow"
                          target="_blank"
                          v-if="item.url"
                          >{{ item.nickname }}</a
                        >
                        <span class="pr-1" v-else>{{ item.nickname }}</span>
                        <WUIBadge class="mr-1" size="xs" v-if="item.isAdmin">{{
                          t('common.comment.admin')
                        }}</WUIBadge>
                        <WUIBadge
                          size="xs"
                          color="primary"
                          variant="outline"
                          v-if="item.status === 0"
                          >{{ t('common.comment.pending') }}</WUIBadge
                        >
                      </div>

                      <div>
                        <!-- 置顶图标 -->
                        <WUIIcon
                          class="text-primary-500 f18"
                          name="i-heroicons-bars-arrow-up"
                          v-if="item.top"
                        />
                      </div>
                    </div>
                    <div class="comment-list-item-date">
                      <ClientOnly
                        ><span
                          :title="formatDate(item.date, 'yyyy-MM-dd hh:mm:ss')"
                          >{{
                            fromNowText(item.date, 'yyyy-MM-dd hh:mm')
                          }}</span
                        ><template #fallback>{{
                          formatDate(item.date, 'yyyy-MM-dd hh:mm')
                        }}</template>
                      </ClientOnly>
                    </div>
                  </div>
                  <blockquote
                    class="comment-list-item-parent-content"
                    v-if="item.parent"
                  >
                    <div>
                      <div class="fb">{{ item.parent.nickname }}</div>
                      <div class="mb-1 f13">
                        <ClientOnly
                          ><span
                            :title="
                              formatDate(
                                item.parent.date,
                                'yyyy-MM-dd hh:mm:ss'
                              )
                            "
                            >{{
                              fromNowText(item.parent.date, 'yyyy-MM-dd hh:mm')
                            }}</span
                          ><template #fallback>{{
                            formatDate(item.parent.date, 'yyyy-MM-dd hh:mm')
                          }}</template>
                        </ClientOnly>
                      </div>
                    </div>
                    <div>{{ item.parent.content }}</div>
                  </blockquote>
                  <blockquote
                    class="comment-list-item-parent-content"
                    v-else-if="!item.parent && item.parentId"
                  >
                    <div>{{ t('common.comment.deleted') }}</div>
                  </blockquote>
                  <div class="comment-list-item-content">
                    {{ item.content }}
                  </div>
                  <div class="flex items-center">
                    <!-- 按钮 -->
                    <!-- 喜欢按钮 -->
                    <div
                      class="comment-list-item-btns mr-2"
                      v-if="item.status === 1"
                    >
                      <WUIButton
                        size="2xs"
                        icon="i-heroicons-heart-solid"
                        color="primary"
                        :variant="colorMode.value === 'dark' ? 'soft' : 'solid'"
                        v-if="checkIsCommentLike(item._id)"
                        @click="likeComment(item._id)"
                        :loading="likeCommentIsLoading[item._id] === true"
                        >{{ formatNumberText(item.likes) }}</WUIButton
                      >
                      <WUIButton
                        size="2xs"
                        icon="i-heroicons-heart"
                        color="white"
                        variant="solid"
                        @click="likeComment(item._id)"
                        :loading="likeCommentIsLoading[item._id] === true"
                        v-else
                        >{{ formatNumberText(item.likes) }}</WUIButton
                      >
                      <template
                        v-if="
                          options.siteEnableComment && postData.data.allowRemark
                        "
                      >
                        <WUIButton
                          size="2xs"
                          color="white"
                          variant="ghost"
                          @click="openComment(item._id)"
                          v-if="item._id !== commentid"
                          >{{ t('common.comment.reply') }}</WUIButton
                        >
                        <WUIButton
                          size="2xs"
                          color="white"
                          variant="ghost"
                          @click="closeComment"
                          v-else
                          >{{ t('common.comment.cancel') }}</WUIButton
                        >
                      </template>
                    </div>
                    <div class="comment-list-item-btns">
                      <CommentRetractBtn
                        :commentid="item._id"
                        :content="item.content"
                        @refresh="refreshCommentList"
                      />
                    </div>
                  </div>
                  <div class="mt-5" v-if="commentid === item._id">
                    <!-- 回复表单 -->
                    <LazyCommentForm
                      v-if="sourceArticleId"
                      :id="`${item._id}-reply`"
                      :postid="sourceArticleId"
                      :commentid="commentid"
                      :parentNickname="item.nickname || item.user?.nickname"
                      @refresh="refreshCommentList"
                      :allowRemark="postData.data.allowRemark"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 翻页 -->
          <div class="comment-page-body">
            <WUIPagination
              v-model="commentPage"
              :page-count="commentSize"
              :total="commentTotal"
              size="md"
              :inactiveButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs'
              }"
              :activeButton="{
                size: 'xs'
              }"
              :firstButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs'
              }"
              :lastButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs'
              }"
              :prevButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs'
              }"
              :nextButton="{
                variant: 'ghost',
                color: 'gray',
                size: 'xs'
              }"
              :showFirst="true"
              :showLast="true"
              :max="7"
              v-if="commentTotal > 0"
            />
            <!-- 无数据 -->
            <div
              class="text-center pb-5"
              v-else-if="
                options.siteEnableComment &&
                postData.data.allowRemark &&
                sourceArticleId &&
                !commentLoading
              "
            >
              <span class="text-gray-500">{{ t('common.comment.empty') }}</span>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
    <ClientOnly>
      <!-- headerList -->
      <Teleport to="#rightToolBarMenu">
        <transition name="fade">
          <div
            class="common-right-tool-menu-body"
            v-show="showHeaderListMenu"
            ref="headerListMenuRef"
            @keydown.tab="e => trapFocus(headerListMenuRef, e)"
            @keydown.esc="showHeaderListMenu = false"
            tabindex="-1"
          >
            <div class="common-right-tool-menu-box">
              <div
                class="flex justify-between items-center bg-white dark:bg-gray-900 border-b border-solid border-gray-200 dark:border-gray-700 text-base px-4 py-3"
              >
                <div>{{ t('common.post.tableOfContents') }}</div>
                <button
                  class="text-gray-500 hover:text-gray-700 common-focus-visible-btn-outline"
                  @click="switchShowHeaderListMenu"
                >
                  <WUIIcon name="i-heroicons-x-mark" />
                </button>
              </div>
              <div class="custom-scroll common-right-tool-menu">
                <LazyPostHeaderItem
                  :list="headerList"
                  :activeHeaderDom="activeHeaderDom"
                  @goToHeader="showHeaderListMenu = false"
                />
              </div>
            </div>
          </div>
        </transition>
      </Teleport>
      <Teleport to="#rightToolBar">
        <LazyPostShowHeaderListBtn
          @btnClick="switchShowHeaderListMenu"
          @close="showHeaderListMenu = false"
          ref="headerListTriggerRef"
          v-if="headerList.length > 0"
        />
      </Teleport>
    </ClientOnly>
  </div>
</template>
<script setup>
import {
  getDetailApi,
  putViewCountApi,
  postLikeLogListApi,
  postLikeLogApi,
  getPostLanguageExistenceApi
} from '@/api/post'
import {
  getCommentListApi,
  postCommentLikeLogApi,
  postCommentLikeLogListApi
} from '@/api/comment'
import { LANGUAGE_CONFIG_LIST } from '#shared/languages'

const { options } = useOptions()

const route = useRoute()
const id = route.params.id
const routeName = route.name
const toast = useWToast()
const { isLocalizedRoute, languageCode, t } = useLang()
const { formatNumberText, fromNowText } = useLocalizedText()
const { isLayoutLanguageSwitching } = useLayoutLanguageSnapshot()
languageCode.value

let type = null
switch (routeName) {
  case 'postDetail':
    type = [1, 2]
    break
  case 'pageDetail':
    type = [3]
    break

  default:
    break
}
const [postDataResponse] = await Promise.all([
  getDetailApi({
    id,
    type,
    randompost: routeName === 'postDetail' ? 1 : 0,
    languageCode: route.params.code
  })
])
const { data: postData } = postDataResponse
const postAuthor = computed(() => {
  const author = postData.value?.data?.author
  if (author) {
    return author
  }

  return {
    nickname: options.value?.siteTitle || 'Wikimoe',
    photo: '/img/avatar/1.webp'
  }
})
const pageTemplate = computed(() => {
  return postData.value?.data?.template
})
const code = computed(() => {
  return postData.value?.data?.code
})
const runCode = () => {
  const runCodeContent = code.value
  // 打开新窗口并运行代码
  const newWindow = window.open()
  newWindow.document.write(runCodeContent)
}
// const postid = postData.value.data._id
// 源站交互和多语言存在性都使用源文章 ID；主站文章没有 sourceId 时使用自身 _id。
const sourceArticleId =
  postData.value?.data?.sourceId || postData.value?.data?._id
// 语言切换属于增强信息，SSR 最多等 1 秒，避免拖慢文章主内容输出。
const POST_LANGUAGE_EXISTENCE_TIMEOUT = 1000
const isSiteMultilingualEnabled = computed(() => {
  return options.value?.siteEnableMultilingual === true
})
// 语言配置转为 map，便于根据 code 显示当前语言名称。
const languageConfigMap = LANGUAGE_CONFIG_LIST.reduce((map, item) => {
  map[item.code] = item
  return map
}, {})
// 统一表示“多语言信息不可用”；这种状态下模板不会渲染语言块。
const createUnavailablePostLanguageInfo = () => {
  return {
    sourceLanguageCode: '',
    existenceMap: {},
    // 无可用接口数据时不生成任何语言切换链接。
    languagePostMap: {}
  }
}
// 接口成功时直接使用上游给出的语言信息；前端不补齐或推断语言数据。
const normalizePostLanguageInfo = data => {
  // languagePostMap 由接口提供，保存每个语言的 alias、公开 id 和源文章 id。
  let languagePostMap = {}
  if (data.languagePostMap && typeof data.languagePostMap === 'object') {
    languagePostMap = data.languagePostMap
  }

  return {
    sourceLanguageCode: data.sourceLanguageCode,
    existenceMap: data.existenceMap,
    languagePostMap
  }
}
// 未配置多语言上游或缺少源文章 ID 时，SSR 阶段不发起这个辅助接口。
const shouldFetchPostLanguageExistence = () => {
  if (!isSiteMultilingualEnabled.value) {
    return false
  }

  if (!sourceArticleId) {
    return false
  }

  if (import.meta.server) {
    const runtimeConfig = useRuntimeConfig()
    const apiDomain = String(runtimeConfig.apiMultilingualDomain || '').trim()
    return Boolean(apiDomain)
  }

  return true
}
// 在文章详情 SSR 阶段读取语言状态；失败只返回不可用状态，不触发前端语言块。
const fetchPostLanguageExistence = async () => {
  if (!shouldFetchPostLanguageExistence()) {
    return createUnavailablePostLanguageInfo()
  }

  try {
    const response = await getPostLanguageExistenceApi(
      { sourceId: sourceArticleId },
      {
        shouldSkipErrorPage: true,
        timeout: POST_LANGUAGE_EXISTENCE_TIMEOUT
      }
    )
    return normalizePostLanguageInfo(response.data.value)
  } catch {
    return createUnavailablePostLanguageInfo()
  }
}
const postLanguageInfo = ref(await fetchPostLanguageExistence())
/**
 * 统一把接口返回的文章标识转成路由可用文本；空值表示不能生成链接。
 * @param {any} value 输入的 alias、id 或 sourceId。
 * @returns {string} 清理后的路由标识。
 */
const normalizePostIdentifier = value => {
  if (value === undefined || value === null) {
    return ''
  }

  return String(value).trim()
}
/**
 * 获取指定语言的文章路由信息。
 * @param {string} targetLanguageCode 目标语言码。
 * @returns {{ alias: string, id: string, sourceId: string }|null} 当前语言的文章标识信息。
 */
const getPostLanguageRouteInfo = targetLanguageCode => {
  const routeInfo =
    postLanguageInfo.value?.languagePostMap?.[targetLanguageCode]
  if (!routeInfo || typeof routeInfo !== 'object') {
    return null
  }

  const alias = normalizePostIdentifier(routeInfo.alias)
  const id = normalizePostIdentifier(routeInfo.id)
  const sourceId = normalizePostIdentifier(routeInfo.sourceId)

  return {
    alias,
    id,
    sourceId
  }
}
/**
 * 按 alias > id 的优先级选择语言切换 URL 标识。
 * 源语言的 id 已由接口处理为源文章 id，译文语言的 id 为译文文章 id。
 * @param {string} targetLanguageCode 目标语言码。
 * @returns {string} 可用于 /post 或 /page 路径的文章标识。
 */
const getPostLanguageIdentifier = targetLanguageCode => {
  const routeInfo = getPostLanguageRouteInfo(targetLanguageCode)
  if (!routeInfo) {
    return ''
  }

  if (routeInfo.alias) {
    return routeInfo.alias
  }

  return routeInfo.id
}
/**
 * 判断指定语言是否具备生成语言切换链接所需的文章标识。
 * @param {string} targetLanguageCode 目标语言码。
 * @returns {boolean} 是否可以生成链接。
 */
const hasPostLanguageRoute = targetLanguageCode => {
  return Boolean(getPostLanguageIdentifier(targetLanguageCode))
}
// 只有请求成功并确认当前页面语言可访问时，才允许页面展示多语言块。
const hasPostLanguageInfo = computed(() => {
  const sourceLanguageCode = postLanguageInfo.value?.sourceLanguageCode
  if (!sourceLanguageCode) {
    return false
  }

  let currentLanguageCode = sourceLanguageCode
  if (isLocalizedRoute.value) {
    currentLanguageCode = languageCode.value
  }

  if (postLanguageInfo.value?.existenceMap?.[currentLanguageCode] !== true) {
    return false
  }

  return hasPostLanguageRoute(currentLanguageCode)
})
// 源文章 URL 不带语言 code；这种情况下当前语言来自接口返回的源语言。
const currentPostLanguageCode = computed(() => {
  if (!hasPostLanguageInfo.value) {
    return ''
  }

  const sourceLanguageCode = postLanguageInfo.value?.sourceLanguageCode
  if (!isLocalizedRoute.value) {
    return sourceLanguageCode
  }

  return languageCode.value
})
// 没有有效多语言信息时返回空字符串，模板会因此完全隐藏语言块。
const currentLanguageLabel = computed(() => {
  if (!currentPostLanguageCode.value) {
    return ''
  }

  const currentLanguageConfig = languageConfigMap[currentPostLanguageCode.value]
  if (currentLanguageConfig) {
    return currentLanguageConfig.label
  }

  return ''
})
// 只列出接口确认存在且已启用的语言，不根据本地语言配置补齐。
const availablePostLanguageList = computed(() => {
  if (!hasPostLanguageInfo.value) {
    return []
  }

  return LANGUAGE_CONFIG_LIST.filter(item => {
    if (postLanguageInfo.value?.existenceMap?.[item.code] !== true) {
      return false
    }

    return hasPostLanguageRoute(item.code)
  })
})
// 下拉列表只显示可切换的其他语言，当前语言不重复出现。
const selectablePostLanguageList = computed(() => {
  return availablePostLanguageList.value.filter(item => {
    return item.code !== currentPostLanguageCode.value
  })
})
// 有其他语言可选时才显示 Popover；否则展示静态语言文本。
const hasPostLanguageSwitcher = computed(() => {
  return selectablePostLanguageList.value.length > 0
})
const languageOptionTabindex = computed(() => {
  if (isLayoutLanguageSwitching.value) {
    return -1
  }

  return 0
})
const handlePostLanguageOptionClick = (event, close) => {
  if (isLayoutLanguageSwitching.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  close()
}
// 总开关：没有可靠接口数据时，前端页面不显示任何多语言块。
const hasPostLanguageBlock = computed(() => {
  if (!isSiteMultilingualEnabled.value) {
    return false
  }

  if (!hasPostLanguageInfo.value) {
    return false
  }

  return Boolean(currentLanguageLabel.value)
})
// 源语言链接走无 code 的源文章地址；译文语言链接使用 code 前缀，标识符统一使用 alias > id。
const getPostLanguagePath = targetLanguageCode => {
  const postIdentifier = getPostLanguageIdentifier(targetLanguageCode)
  if (!postIdentifier) {
    return ''
  }

  let postTypePath = 'post'
  if (postData.value?.data?.type === 3) {
    postTypePath = 'page'
  }

  const postPath = `/${postTypePath}/${postIdentifier}`
  if (targetLanguageCode === postLanguageInfo.value?.sourceLanguageCode) {
    return buildPlainPath(postPath)
  }

  return buildLanguagePath(targetLanguageCode, postPath)
}
// comment
const commentPage = ref(1)
const commentData = ref({
  list: [],
  total: 0,
  size: 1
})
const commentList = computed(() => {
  return commentData.value.list
})
const commentTotal = computed(() => {
  return commentData.value.total
})
const commentSize = computed(() => {
  return commentData.value.size
})
const commentLoading = ref(true)
const postDetailBody = ref(null)
const commentSortType = ref('date')
const changeCommentSort = type => {
  if (commentLoading.value) {
    return
  }
  commentSortType.value = type
  getCommentList()
}
const getCommentList = async goToCommentListRef => {
  if (!sourceArticleId) {
    commentData.value = {
      list: [],
      total: 0,
      size: 1
    }
    commentLoading.value = false
    return
  }

  commentLoading.value = true
  await getCommentListApi({
    id: sourceArticleId,
    sorttype: commentSortType.value,
    page: commentPage.value
  })
    .then(res => {
      console.log(res)
      commentData.value = res
      commentLikeLogList()
      if (goToCommentListRef && commentListRef.value) {
        // const rect = commentListRef.value.getBoundingClientRect()
        const elementRect = commentListRef.value.getBoundingClientRect()
        const parentRect = postDetailBody.value.getBoundingClientRect()
        const distanceToParentTop = elementRect.top - parentRect.top
        window.scrollTo({
          top: distanceToParentTop - 100,
          behavior: 'smooth'
        })
      }
    })
    .finally(() => {
      commentLoading.value = false
    })
}
const commentListRef = ref(null)

const commentid = ref('')
const openComment = id => {
  commentid.value = id
  nextTick(() => {
    // 根据id找textarea
    const textareaBlock = document.getElementById(`${id}-reply`)
    // 找到.comment-form-textarea 下的textarea
    const textarea = textareaBlock.querySelector(
      '.comment-form-textarea textarea'
    )
    if (textarea) {
      textarea.focus()
    }
  })
}
const closeComment = () => {
  commentid.value = ''
}
const refreshCommentList = () => {
  commentPage.value = 1
  getCommentList(true)
}

watch(
  () => commentPage.value,
  () => {
    getCommentList(true)
  }
)
// 评论点赞
const commentLikeListInited = ref(false)
const commentLikeListLoading = ref(false)
const commentLikeList = ref([])
const commentLikeLogList = () => {
  const commentIdList = commentData.value.list.map(item => item._id)
  commentLikeListLoading.value = true
  postCommentLikeLogListApi({ commentIdList })
    .then(res => {
      commentLikeList.value = res.list
    })
    .finally(() => {
      commentLikeListInited.value = true
      commentLikeListLoading.value = false
    })
}
const checkIsCommentLike = commentId => {
  const likeData = commentLikeList.value.find(
    item => item.comment === commentId
  )
  if (likeData) {
    return likeData.like
  } else {
    return false
  }
}
const getLikeDataByCommentId = commentId => {
  const likeData = commentLikeList.value.find(
    item => item.comment === commentId
  )
  if (likeData) {
    return likeData
  } else {
    return null
  }
}

const likeCommentIsLoading = reactive({})
const likeComment = commentId => {
  if (likeCommentIsLoading[commentId]) {
    return
  }
  // 如果找到了，判断里面的Like，没有就是false
  let like = checkIsCommentLike(commentId)
  const __v = getLikeDataByCommentId(commentId)?.__v
  likeCommentIsLoading[commentId] = true

  postCommentLikeLogApi({ id: commentId, like: !like, __v })
    .then(res => {
      // 将对应的likeList里的commentId替换为res.data
      const index = commentLikeList.value.findIndex(
        item => item.comment === commentId
      )
      if (index > -1) {
        commentLikeList.value[index] = res.data
      } else {
        commentLikeList.value.push(res.data)
      }
      const newLike = res.data.like
      // commentData.value.list 找到对应的commentId，将likes数量根据newLike加减
      const commentIndex = commentData.value.list.findIndex(
        item => item._id === commentId
      )

      const comment = commentData.value.list[commentIndex]
      const newLikeCount = newLike ? comment.likes + 1 : comment.likes - 1
      commentData.value.list[commentIndex].likes = newLikeCount
    })
    .catch(err => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach(item => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red'
          })
        })
      }
    })
    .finally(() => {
      likeCommentIsLoading[commentId] = false
    })
}

// viewCount
const putViewCount = () => {
  if (!sourceArticleId) {
    return
  }

  putViewCountApi({
    id: sourceArticleId
  })
}

// post like
const likeListInited = ref(false)
const likeListLoading = ref(false)
const likeList = ref([])
const postLikeLogList = () => {
  if (!sourceArticleId) {
    likeList.value = []
    likeListInited.value = true
    likeListLoading.value = false
    return
  }

  const postIdList = [sourceArticleId]
  likeListLoading.value = true
  postLikeLogListApi({ postIdList })
    .then(res => {
      likeList.value = res.list
      checkIsLike()
    })
    .finally(() => {
      likeListInited.value = true
      likeListLoading.value = false
    })
}
const checkIsLike = () => {
  const likeData = likeList.value.find(item => item.post === sourceArticleId)
  if (likeData) {
    postData.value.data.isLike = likeData.like
    if (likeData.like && postData.value.data.likes === 0) {
      // 缓存补偿
      postData.value.data.likes = 1
    }
  }
}
const getLikeDataByPostId = () => {
  const likeData = likeList.value.find(item => item.post === sourceArticleId)
  if (likeData) {
    return likeData
  } else {
    return null
  }
}

const likePostIsLoading = ref(false)
const likePost = () => {
  if (!sourceArticleId) {
    return
  }

  if (likePostIsLoading.value) {
    return
  }
  // 如果找到了，判断里面的Like，没有就是false
  let like = postData.value.data.isLike
  const __v = getLikeDataByPostId()?.__v
  likePostIsLoading.value = true

  postLikeLogApi({ id: sourceArticleId, like: !like, __v })
    .then(res => {
      // 将对应的likeList里的postId替换为res.data
      const index = likeList.value.findIndex(
        item => item.post === sourceArticleId
      )
      if (index > -1) {
        likeList.value[index] = res.data
      } else {
        likeList.value.push(res.data)
      }
      const newLike = res.data.like
      const newLikeCount = newLike
        ? postData.value.data.likes + 1
        : postData.value.data.likes - 1
      postData.value.data.likes = newLikeCount
      postData.value.data.isLike = newLike
    })
    .catch(err => {
      console.log(err)
      const errors = err.response?._data?.errors
      if (errors) {
        errors.forEach(item => {
          const message = item.message
          toast.add({
            title: message,
            icon: 'i-heroicons-x-circle',
            color: 'red'
          })
        })
      }
    })
    .finally(() => {
      likePostIsLoading.value = false
    })
}

// 设置SEO - 使用公共方法
const { generatePostSeoData } = usePostSeo()
const seoData = generatePostSeoData(postData.value.data)

useSeoMeta({
  title: seoData.title,
  ogTitle: seoData.title,
  description: seoData.description,
  keywords: seoData.keywords,
  ogDescription: seoData.description,
  ogImage: seoData.image,
  ogUrl: seoData.url,
  // twitter
  twitterTitle: seoData.title,
  twitterDescription: seoData.description,
  twitterImage: seoData.image
})

// Article JSON-LD 结构化数据 - 传入已计算的seoData避免重复计算
const { generateArticleJsonLd, setJsonLd } = useArticleJsonLd()
const articleJsonLd = generateArticleJsonLd(postData.value.data, seoData)
if (articleJsonLd) {
  setJsonLd(articleJsonLd)
}

// 文章导航
const showHeaderListMenu = ref(false)
const headerListMenuRef = ref(null)
const headerListTriggerRef = ref(null)

// 使用 useOutsideClick 监听外部点击
useOutsideClick(
  headerListMenuRef,
  () => {
    if (showHeaderListMenu.value) {
      showHeaderListMenu.value = false
    }
  },
  {
    ignore: [() => headerListTriggerRef.value?.$el]
  }
)

const switchShowHeaderListMenu = () => {
  showHeaderListMenu.value = !showHeaderListMenu.value
}

// 监听菜单显示状态，自动聚焦
watch(showHeaderListMenu, val => {
  if (val) {
    nextTick(() => {
      headerListMenuRef.value?.focus()
    })
  } else {
    headerListTriggerRef.value?.$el?.focus()
  }
})

const activeHeaderDom = ref(null)
const parseHeaders = () => {
  const parentElement = document.querySelector(
    '#postHtmlContent .html-content-body'
  )
  const headers = parentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const result = []
  let currentHeader = null

  headers.forEach(header => {
    const level = parseInt(header.tagName.slice(1))
    const headerObj = {
      tag: header.tagName,
      text: header.textContent,
      dom: header,
      children: []
    }

    if (currentHeader === null) {
      result.push(headerObj)
    } else {
      while (currentHeader && currentHeader.level >= level) {
        currentHeader = currentHeader.parent
      }
      if (currentHeader) {
        currentHeader.children.push(headerObj)
      } else {
        result.push(headerObj)
      }
    }

    headerObj.level = level
    headerObj.parent = currentHeader
    currentHeader = headerObj
  })
  console.log(result)
  return result
}

const headerList = ref([])
const getHeaderList = () => {
  // 只有 editorVersion 为 5 ，type 为 1 的文章才有文章导航
  if (
    postData.value?.data?.editorVersion === 5 &&
    postData.value?.data?.type === 1
  ) {
    headerList.value = parseHeaders()
    if (headerList.value.length > 0) {
      window.addEventListener('scroll', onScroll)
      onScroll()
    }
  }
}
let scrollTimer = null
const onScroll = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  scrollTimer = setTimeout(() => {
    getActiveHeader()
  }, 300)
}
const getActiveHeader = () => {
  const parentElement = document.querySelector(
    '#postHtmlContent .html-content-body'
  )
  if (!parentElement) {
    return
  }
  const headers = parentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let closest = null
  let closestDistance = Infinity
  const threshold = window.innerHeight / 2 // 设置阈值为窗口高度的一半
  headers.forEach(header => {
    const rect = header.getBoundingClientRect()
    const distance = Math.abs(rect.top)
    if (distance < closestDistance && distance <= threshold) {
      // 只有当元素距离窗口顶部的距离小于阈值时，才将其视为最近的元素
      closestDistance = distance
      closest = header
    }
  })
  if (closest) {
    console.log(closest)
    activeHeaderDom.value = closest
  }
}

const showPostCommonFooter = computed(() => {
  const type = postData.value?.data?.type
  if (type === 1) {
    return options.value.sitePostBlogCommonFooterOpen || false
  } else if (type === 2) {
    return options.value.sitePostTweetCommonFooterOpen || false
  } else {
    return false
  }
})

let postCommentId = null
const alertCommentId = ref(null)
let alertCommentTimer = null
const checkCommentScroll = () => {
  setTimeout(() => {
    if (route.hash.includes('comment-')) {
      postCommentId = route.hash.split('comment-')[1]
      const urlWithoutHash = window.location.href.split('#')[0]
      window.history.replaceState(window.history.state, '', urlWithoutHash)
    }
    if (postCommentId) {
      // 查询id对应的dom
      const commentDom = document.getElementById(`comment-${postCommentId}`)
      if (commentDom) {
        alertCommentId.value = postCommentId
        alertCommentTimer = setTimeout(() => {
          alertCommentId.value = null
          alertCommentTimer = null
        }, 4500)
      } else {
        console.warn('postCommentId 找不到对应的评论')
        // 提示用户
        let title = t('common.comment.lost')
        if (commentTotal.value / commentSize.value > 1) {
          title = t('common.comment.lostPaged')
        }
        toast.add({
          title: title,
          icon: 'i-heroicons-x-circle',
          color: 'red'
        })
      }
    }
  }, 100)
}

const seriesSortListCom = computed(() => {
  if (
    !postData.value?.data?.seriesSortList ||
    postData.value.data.seriesSortList.length === 0
  ) {
    return ['media', 'event', 'vote', 'post', 'tweet', 'acgn']
  }
  return postData.value.data.seriesSortList
})

const colorMode = useColorMode()
if (import.meta.client) {
  await getCommentList()
}

const isHydrated = ref(false)

const shareadd = () => {
  postData.value.data.shares += 1
}

onMounted(() => {
  putViewCount()
  postLikeLogList()
  getHeaderList()
  checkCommentScroll()
  isHydrated.value = true
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (alertCommentTimer) {
    clearTimeout(alertCommentTimer)
  }
})
</script>
<style scoped>
.post-detail-body {
  position: relative;
  padding: 18px;
}
.post-blog-head {
  display: flex;
  /* 垂直居中 */
  align-items: center;
  margin-bottom: 0px;
  @apply border-solid border-b border-gray-200 dark:border-gray-700;
  padding-bottom: 10px;
}
.post-author-avatar-body {
  margin-right: 10px;
  width: 50px;
  height: 50px;
}
.post-author-avatar {
  border-radius: 8px;
}
.post-right-info {
  flex: 1;
}
.post-title {
  font-size: 18px;
  font-weight: 700;
}
.post-extra {
  font-size: 14px;
  line-height: 1.5;
}
/* 推文 */
.post-tweet-detail-content-body {
  padding-top: 10px;
}
.post-tweet-detail-content {
  font-size: 16px;
  line-height: 1.5;
  /* 支持换行 */
  white-space: pre-wrap;
  word-break: break-word;
}
.post-detail-like-body {
  text-align: center;
}
/* 评论 */
.comment-list-body {
  @apply mt-4;
}
.comment-list-title {
  font-size: 16px;
  font-weight: 700;
}
.comment-list-item {
  @apply border-solid border-b border-gray-200 py-4;
  position: relative;
}
.comment-list-item-alert {
  @apply bg-primary-100 rounded-md dark:bg-primary-800/50;
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% + 10px);
  margin-left: -5px;
  height: 100%;
  z-index: 2;
  /* 穿透 */
  pointer-events: none;
  opacity: 0;
  animation: opacityAnimation 0.8s ease-in-out 0s 5;
}
@keyframes opacityAnimation {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
}
.comment-list-item-avatar-body {
  margin-right: 10px;
}
.comment-list-item-right-info {
  flex: 1;
}
.comment-list-item-author {
  font-size: 14px;
  font-weight: 700;
  margin-right: 10px;
}
.comment-list-item-date {
  font-size: 13px;
  color: #949494;
}
.comment-list-item-parent-content,
.comment-list-item-content {
  /* 允许换行 */
  white-space: pre-wrap;
  word-break: break-word;
}
.comment-list-item-parent-content {
  @apply border-l-4 border-gray-200 dark:border-gray-500 p-2 mt-2 mb-2 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-md;
}
.comment-list-item-content {
  font-size: 14px;
  line-height: 1.6;
}
.comment-list-item-btns {
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.comment-list-item-btn {
  font-size: 12px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.comment-list-item-btn.type-like {
  @apply border-solid border-b border-gray-200 dark:border-gray-700;
  color: #949494;
  padding: 1px 8px;
  border-radius: 10px;
}
.comment-page-body {
  /* 居中 */
  @apply mt-3;
  display: flex;
  justify-content: center;
}
.post-html-content-body,
.post-tweet-detail-content-body {
  font-size: 16px;
}

.comment-list-sort-line {
  display: inline-block;
  width: 1px;
  height: 0.75rem;
  background-color: #949494;
}
.comment-list-item-avatar-link:focus-visible {
  @apply ring-0 block outline-2 outline-primary-500 outline rounded;
}
.post-language-switcher,
.post-language-static,
.post-language-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.post-language-trigger {
  color: inherit;
  line-height: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
  padding: 0;
}
.post-language-trigger-disabled,
.post-language-trigger:disabled,
.post-language-option-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.post-language-option-disabled {
  pointer-events: none;
}
.post-language-panel {
  min-width: 150px;
}
</style>
