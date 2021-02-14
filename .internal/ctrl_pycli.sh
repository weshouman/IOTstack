#!/bin/bash

source ./.internal/meta.sh
DNAME=iostack_pycli
FULL_NAME="$DNAME:$VERSION"

if [ "$1" = "stop" ]; then
  docker stop $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") 2> /dev/null
else
  if [[ $IOTENV == "development" ]]; then
    echo "[Development] Stopping container:"
    echo "docker stop $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") || docker rmi $FULL_NAME --force"
    docker stop $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") 2> /dev/null || docker rmi $FULL_NAME --force 2> /dev/null
    echo ""
    echo "Rebuilding container:"
    echo "docker build --no-cache -t $FULL_NAME -f ./.internal/pycli.Dockerfile ."
    docker pull python:3 # Docker occasionally fails to pull image when building when it is not cached.
    docker build --no-cache -t $FULL_NAME -f ./.internal/pycli.Dockerfile .
    echo ""
  else
    if [[ "$(docker images -q $FULL_NAME 2> /dev/null)" == "" ]]; then
      echo "Building '$FULL_NAME'"
      docker pull python:3 # Docker occasionally fails to pull image when building when it is not cached.
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
      -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
      -e HOSTSSH_PORT="$HOSTSSH_PORT" \
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
