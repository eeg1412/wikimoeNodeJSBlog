#!/bin/bash

LOCK_FILE="/app/log/install.lock"
function start() {
    echo "Starting service"
    yarn run start
}
function init() {
    echo "Initializing user: $USER_NAME"
    yarn run create-user "$USER_NAME" '7@wVUo6BL6LHjNR*#x' "$USER_NAME"
    touch "$LOCK_FILE"
}
if [ -n "$USER_NAME" ]; then

    if [ ! -f "$LOCK_FILE" ]; then
        init
    fi
fi
start
