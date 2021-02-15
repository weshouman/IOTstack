#!/bin/bash

source ./.internal/meta.sh
DNAME=iostack_wui
FULL_NAME="$DNAME:$VERSION"

if [ "$1" = "stop" ]; then
  docker stop $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") 2> /dev/null
  docker stop $(docker ps -q --format "{{.ID}} {{.Ports}}" | grep "$WUI_PORT" | cut -d ' ' -f1) 2> /dev/null
else
  if [[ $IOTENV == "development" ]]; then
    docker stop $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") 2> /dev/null || docker rmi $FULL_NAME --force 2> /dev/null
    docker stop $(docker ps -q --format "{{.ID}} {{.Ports}}" | grep "$WUI_PORT" | cut -d ' ' -f1) 2> /dev/null
    docker pull node:alpine # Docker occasionally fails to pull image when building when it is not cached.
    docker build --no-cache -t $FULL_NAME -f ./.internal/wui.Dockerfile .
  else
    if [[ "$(docker images -q $FULL_NAME 2> /dev/null)" == "" ]]; then
      echo "Building '$FULL_NAME'"
      docker pull node:alpine # Docker occasionally fails to pull image when building when it is not cached.
      docker build --quiet -t $FULL_NAME -f ./.internal/wui.Dockerfile .
    else
      echo "Build for '$FULL_NAME' already exists. Skipping..."
    fi
  fi

  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    if [[ $IOTENV == "development" ]]; then
      echo "Starting in development watch mode the IOTstack WUI Server"
      docker run -p $WUI_PORT:$WUI_PORT \
        -e PORT=$WUI_PORT \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/wui,target=/usr/iotstack_wui \
        --restart unless-stopped $FULL_NAME
    else
      echo "Starting IOTstack WUI Server"
      docker run -d -p $WUI_PORT:$WUI_PORT -e PORT=$WUI_PORT --restart unless-stopped $FULL_NAME
    fi
  else
    echo "IOTstack WUI Server is running"
  fi

  # docker run -d -p $WUI_PORT:$WUI_PORT $FULL_NAME
  # docker run -p $WUI_PORT:$WUI_PORT -e PORT=$WUI_PORT $FULL_NAME

  # docker run -p $WUI_PORT:$WUI_PORT -it $FULL_NAME /bin/bash
fi
