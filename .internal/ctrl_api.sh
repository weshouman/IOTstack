#!/bin/bash

source ./.internal/meta.sh
DNAME=iostack_api
FULL_NAME="$DNAME:$VERSION"

if [ "$1" = "stop" ]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME ) 2> /dev/null
else
  if [[ $IOTENV == "development" ]]; then
    docker stop $(docker ps -q --filter ancestor=$FULL_NAME) || docker rmi $FULL_NAME --force
    docker build --no-cache -t $FULL_NAME -f ./.internal/api.Dockerfile .
  else
    if [[ "$(docker images -q $FULL_NAME 2> /dev/null)" == "" ]]; then
      echo "Building '$FULL_NAME'"
      docker build --quiet -t $FULL_NAME -f ./.internal/api.Dockerfile .
    else
      echo "Build for '$FULL_NAME' already exists. Skipping..."
    fi
  fi

  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    echo "Starting IOTstack API Server"
    docker run -d -p 32128:32128 \
      --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
      --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds \
      --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
      -e HOSTUSER="$HOSTUSER" \
      -e IOTSTACKPWD="$IOTSTACKPWD" \
      -e CORS="comma.separated,list.of.ip,addresses" \
      --restart unless-stopped \
      $FULL_NAME

    # docker run -p 32128:32128 \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
    #   -e cors="yourLanIpHere:32777" \
    #   -e HOSTUSER="$HOSTUSER" \
    #   -e IOTSTACKPWD="$IOTSTACKPWD" \
    #   -e CORS="comma.separated,list.of.ip,addresses" \
    #   --restart unless-stopped \
    #   $FULL_NAME

    # docker run -p 32128:32128 \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
    #   -e HOSTUSER="$HOSTUSER" \
    #   -e IOTSTACKPWD="$IOTSTACKPWD" \
    #   -e CORS="comma.separated,list.of.ip,addresses" \
    #   --restart unless-stopped \
    #   -it $FULL_NAME /bin/bash
  else
    echo "IOTstack API Server is running"
  fi
fi
