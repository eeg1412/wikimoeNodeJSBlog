FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
ARG NUXT_API_DOMAIN=http://wikimoe-blog-server:3006
ARG NUXT_SWR_ENABLED=0
ARG NUXT_SWR_CACHE_MAXAGE=10
ARG NUXT_SWR_CACHE_STALEMAXAGE=3600
ARG NUXT_SWR_CACHE_MAX_PAGE=100
ARG NUXT_SWR_CACHE_TTL=86400
ARG NITRO_PORT=3007
# env debug info
RUN node -e "console.log(process.env)" && \
    yarn install && \
    yarn build


FROM node:20-alpine AS runner 

WORKDIR /app
COPY --from=builder /app/build /app
CMD ["yarn", "run","start-linux"]
EXPOSE 3007
