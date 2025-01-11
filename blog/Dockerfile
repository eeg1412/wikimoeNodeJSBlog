FROM node:20-alpine as builder

WORKDIR /app
COPY . .
ENV NODE_ENV production
ARG NUXT_API_DOMAIN=http://wikimoe-blog-server:3006
ARG SWR_ENABLED=0

# env debug info
RUN node -e "console.log(process.env)" && \
    yarn install && \
    yarn build


FROM node:20-alpine as runner 

WORKDIR /app
COPY --from=builder /app/build /app
CMD ["yarn", "run","start-linux"]
EXPOSE 3007