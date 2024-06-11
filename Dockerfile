FROM node:20-alpine as builder
WORKDIR /app
COPY . .
RUN cd admin && \
    yarn install && \
    yarn build && \
    cd ../server && \
    yarn install 

FROM node:20-alpine as runner
WORKDIR /app
COPY --from=builder /app/server /app
RUN chmod +x /app/entrypoint.sh && \
    apk add bash
CMD ["/app/entrypoint.sh"]
EXPOSE 3000