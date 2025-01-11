FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
ARG NUXT_API_DOMAIN=http://wikimoe-blog-server:3006
ARG SWR_ENABLED=0
ARG SWR_CACHE_MAXAGE
ARG SWR_CACHE_STALEMAXAGE
ARG CACHE_MAX_PAGE
ARG CACHE_TTL
# env debug info
RUN node -e "console.log(process.env)" && \
    yarn install && \
    yarn build


FROM node:20-alpine AS runner 

WORKDIR /app
COPY --from=builder /app/build /app
CMD ["yarn", "run","start-linux"]
EXPOSE 3007