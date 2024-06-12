FROM node:20-alpine as builder
WORKDIR /app
RUN npm install --global yarn
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
    apk add --no-cache bash
CMD ["/app/entrypoint.sh"]
EXPOSE 3000