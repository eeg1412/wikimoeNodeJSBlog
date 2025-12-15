FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

# env debug info
RUN node -e "console.log(process.env)" && \
    yarn install && \
    yarn build


FROM node:20-alpine AS runner 

WORKDIR /app
COPY --from=builder /app/build /app
CMD ["yarn", "run","start"]
EXPOSE 3007
