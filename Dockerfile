FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN cd admin && \
    yarn install && \
    yarn build && \
    cd ../server && \
    yarn install 

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/server /app
RUN chmod +x /app/entrypoint.sh && \
    apk add --no-cache bash
CMD ["/app/entrypoint.sh"]
EXPOSE 3006