#!/bin/bash

source ./.internal/meta.sh
DNAME=iostack_pycli
FULL_NAME="$DNAME:$VERSION"

if [ "$1" = "stop" ]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME ) 2> /dev/null
else
  if [[ $IOTENV == "development" ]]; then
    docker stop $(docker ps -q --filter ancestor=$FULL_NAME) || docker rmi $FULL_NAME --force
    docker build --no-cache -t $FULL_NAME -f ./.internal/pycli.Dockerfile .
  else
    if [[ "$(docker images -q $FULL_NAME 2> /dev/null)" == "" ]]; then
      echo "Building '$FULL_NAME'"
      docker build --quiet -t $FULL_NAME -f ./.internal/pycli.Dockerfile .
    else
      echo "Build for '$FULL_NAME' already exists. Skipping..."
    fi
  fi

  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    echo "Starting IOTstack PyCLI instance"

    docker run \
      --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
      --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
      -e HOSTUSER="$HOSTUSER" \
      -e IOTSTACKPWD="$IOTSTACKPWD" \
      --restart no \
       -it $FULL_NAME

    # docker run -d \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
    #   -e HOSTUSER="$HOSTUSER" \
    #   -e IOTSTACKPWD="$IOTSTACKPWD" \
    #   --restart no \
    #   $FULL_NAME

    # docker run  \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
    #   -e cors="yourLanIpHere:32777" \
    #   -e HOSTUSER="$HOSTUSER" \
    #   -e IOTSTACKPWD="$IOTSTACKPWD" \
    #   --restart no \
    #   $FULL_NAME

    # docker run \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
    #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
    #   -e HOSTUSER="$HOSTUSER" \
    #   -e IOTSTACKPWD="$IOTSTACKPWD" \
    #   --restart no \
    #   -it $FULL_NAME /bin/bash
  else
    echo "IOTstack CLI is running. Check with 'docker ps'."
  fi
fi
