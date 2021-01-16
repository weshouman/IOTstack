#!/bin/bash

VERSION=v0.0.1
DNAME=iostack_api
FULL_NAME="$DNAME:$VERSION"

if [[ $IOTENV == "development" ]]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME) || docker rmi $FULL_NAME --force
  docker build --no-cache -t $FULL_NAME -f api.Dockerfile .
else
  docker build -t $FULL_NAME -f api.Dockerfile .
fi

if [ "$1" = "stop" ]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME)
else
  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    echo "Starting IOTstack API Server"
    # docker run -d -p 32128:32128 \
    #   --mount type=bind,source="$(pwd)"/templates,target=/usr/iotstack_api/templates,readonly \
    #   --mount type=bind,source="$(pwd)"/saved_builds,target=/usr/iotstack_api/builds \
    #   --mount type=bind,source="$(pwd)"/.ssh,target=/root/.ssh,readonly \
    #   -e HOSTUSER="$(whoami)" \
    #   --restart unless-stopped \
    #   $FULL_NAME

    # docker run -p 32128:32128 \
    #   --mount type=bind,source="$(pwd)"/templates,target=/usr/iotstack_api/templates,readonly \
    #   --mount type=bind,source="$(pwd)"/saved_builds,target=/usr/iotstack_api/builds,readonly \
    #   --mount type=bind,source="$(pwd)"/.ssh,target=/root/.ssh,readonly \
    #   -e cors="yourLanIpHere:32777" \
    #   -e HOSTUSER="$(whoami)" \
    #   --restart unless-stopped \
    #   $FULL_NAME

    docker run -p 32128:32128 \
      --mount type=bind,source="$(pwd)"/templates,target=/usr/iotstack_api/templates,readonly \
      --mount type=bind,source="$(pwd)"/saved_builds,target=/usr/iotstack_api/builds,readonly \
      --mount type=bind,source="$(pwd)"/.ssh,target=/root/.ssh,readonly \
      -e HOSTUSER="$(whoami)" \
      --restart unless-stopped \
      -it $FULL_NAME /bin/bash
  else
    echo "IOTstack API Server is running"
  fi
fi
