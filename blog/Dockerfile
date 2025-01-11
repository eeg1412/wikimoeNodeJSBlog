FROM node:20-alpine as builder

WORKDIR /app
COPY . .
ENV NODE_ENV production
ARG NUXT_API_DOMAIN=http://wikimoe-blog-server:3000
ARG SWR_ENABLED=1
ARG SWR_CACHE_MAXAGE=10
ARG SWR_CACHE_STALEMAXAGE=3600
ARG CACHE_MAX_PAGE=10
ARG CACHE_TTL=60000
# env debug info
RUN node -e "console.log(process.env)" && \
    yarn install && \
    yarn build


FROM node:20-alpine as runner 

WORKDIR /app
COPY --from=builder /app/build /app
CMD ["yarn", "run","start-linux"]
EXPOSE 3007