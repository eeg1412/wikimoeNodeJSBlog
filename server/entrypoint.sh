#!/bin/bash

LOCK_FILE="/app/log/install.lock"
function start() {
    echo "Starting service"
    yarn run start
}
function init() {
    echo "Initializing user: $USER_NAME"
    yarn run create-user "$USER_NAME" '7@wVUo6BL6LHjNR*#x' "$USER_NAME"
    # 检查/app/log目录是否存在，如果不存在，则创建它
    if [ ! -d "/app/log" ]; then
        mkdir -p "/app/log"
    fi
    touch "$LOCK_FILE"
}
if [ -n "$USER_NAME" ]; then

    if [ ! -f "$LOCK_FILE" ]; then
        init
    fi
fi
start