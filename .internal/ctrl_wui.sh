#!/bin/bash

VERSION=v0.0.1
DNAME=iostack_wui
FULL_NAME="$DNAME:$VERSION"

if [[ $IOTENV == "development" ]]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME) || docker rmi $FULL_NAME --force
  docker build --no-cache -t $FULL_NAME -f wui.Dockerfile .
else
  docker build -t $FULL_NAME -f wui.Dockerfile .
fi

if [ "$1" = "stop" ]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME )
else
  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    echo "Starting IOTstack WUI Server"
    docker run -d -p 32777:32777 -e PORT=32777 --restart unless-stopped $FULL_NAME
  else
    echo "IOTstack WUI Server is running"
  fi

  # docker run -d -p 32777:32777 $FULL_NAME
  # docker run -p 32777:32777 -e PORT=32777 $FULL_NAME

  # docker run -p 32777:32777 -it $FULL_NAME /bin/bash
fi
