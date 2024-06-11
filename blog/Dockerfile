FROM node:20-alpine as builder

WORKDIR /app
COPY . .
ENV NODE_ENV production
ENV NUXT_API_DOMAIN=http://wikimoe-server:3000
ENV GOOGLE_ADSENSE_ID=
ENV GOOGLE_ADSENSE_TEST_MODE=
ENV GOOGLE_ADSENSE_POST_DETAIL_BT=
ENV SWR_ENABLED=1
ENV SWR_CACHE_MAXAGE=10
ENV SWR_CACHE_STALEMAXAGE=3600
ENV CACHE_MAX_PAGE=10
ENV CACHE_TTL=60000
ENV SHOW_LOADING=1
RUN node -e "console.log(process.env)" && \
    yarn install && \
    yarn build


FROM node:20-alpine as runner 

WORKDIR /app

COPY --from=builder /app/build /app
CMD ["yarn", "run","start-linux"]
EXPOSE 3007