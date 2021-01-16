#!/bin/bash

VERSION=v0.0.1
DNAME=iostack_cli
FULL_NAME="$DNAME:$VERSION"

if [[ $IOTENV == "development" ]]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME) || docker rmi $FULL_NAME --force
  docker build --no-cache -t $FULL_NAME -f cli.Dockerfile .
else
  docker build --quiet -t $FULL_NAME -f cli.Dockerfile .
fi

if [ "$1" = "stop" ]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME)
else
  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    echo "Starting IOTstack CLI instance"

    docker run \
      --mount type=bind,source="$(pwd)"/saved_builds,target=/usr/iotstack_api/builds,readonly \
      --mount type=bind,source="$(pwd)"/.ssh,target=/root/.ssh,readonly \
      -e HOSTUSER="$(whoami)" \
      --restart no \
       -it $FULL_NAME

    # docker run -d \
    #   --mount type=bind,source="$(pwd)"/saved_builds,target=/usr/iotstack_api/builds \
    #   --mount type=bind,source="$(pwd)"/.ssh,target=/root/.ssh,readonly \
    #   -e HOSTUSER="$(whoami)" \
    #   --restart no \
    #   $FULL_NAME

    # docker run  \
    #   --mount type=bind,source="$(pwd)"/saved_builds,target=/usr/iotstack_api/builds,readonly \
    #   --mount type=bind,source="$(pwd)"/.ssh,target=/root/.ssh,readonly \
    #   -e cors="yourLanIpHere:32777" \
    #   -e HOSTUSER="$(whoami)" \
    #   --restart no \
    #   $FULL_NAME

    # docker run \
    #   --mount type=bind,source="$(pwd)"/saved_builds,target=/usr/iotstack_api/builds,readonly \
    #   --mount type=bind,source="$(pwd)"/.ssh,target=/root/.ssh,readonly \
    #   -e HOSTUSER="$(whoami)" \
    #   --restart no \
    #   -it $FULL_NAME /bin/bash
  else
    echo "IOTstack CLI is running. Check with 'docker ps'."
  fi
fi
