#!/bin/bash

source ./.internal/meta.sh
DNAME=iostack_api
FULL_NAME="$DNAME:$VERSION"

if [ "$1" = "stop" ]; then
  docker stop $(docker ps -q --filter ancestor=$FULL_NAME ) 2> /dev/null
else
  if [[ $IOTENV == "development" ]]; then
    docker stop $(docker ps -q --filter ancestor=$FULL_NAME) || docker rmi $FULL_NAME --force
    docker node:14 # Docker occasionally fails to pull image when building when it is not cached.
    docker build --no-cache -t $FULL_NAME -f ./.internal/api.Dockerfile .
  else
    if [[ "$(docker images -q $FULL_NAME 2> /dev/null)" == "" ]]; then
      echo "Building '$FULL_NAME'"
      docker node:14 # Docker occasionally fails to pull image when building when it is not cached.
      docker build --quiet -t $FULL_NAME -f ./.internal/api.Dockerfile .
    else
      echo "Build for '$FULL_NAME' already exists. Skipping..."
    fi
  fi

  CORS_LIST=""
  for sepspace in "$(hostname --all-ip-addresses)"; do
    sepspace="$(echo $sepspace | xargs)"
    CORS_LIST="$CORS_LIST $sepspace:32777 "
  done

  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    if [[ $IOTENV == "development" ]]; then
      echo "Starting in development watch mode the IOTstack API Server"
      docker run -p 32128:32128 \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/api,target=/usr/iotstack_api \
        -e HOSTUSER="$HOSTUSER" \
        -e IOTSTACKPWD="$IOTSTACKPWD" \
        -e CORS="$CORS_LIST" \
        -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
        -e HOSTSSH_PORT="$HOSTSSH_PORT" \
        --restart unless-stopped \
        $FULL_NAME
    else
      echo "Starting IOTstack API Server"
      docker run -d -p 32128:32128 \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
        -e HOSTUSER="$HOSTUSER" \
        -e IOTSTACKPWD="$IOTSTACKPWD" \
        -e CORS="$CORS_LIST" \
        -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
        -e HOSTSSH_PORT="$HOSTSSH_PORT" \
        --restart unless-stopped \
        $FULL_NAME

      # docker run -p 32128:32128 \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
      #   -e cors="yourLanIpHere:32777" \
      #   -e HOSTUSER="$HOSTUSER" \
      #   -e IOTSTACKPWD="$IOTSTACKPWD" \
      #   -e CORS="$(CORS_LIST)" \
      #   -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
      #   -e HOSTSSH_PORT="$HOSTSSH_PORT" \
      #   --restart unless-stopped \
      #   $FULL_NAME

      # docker run -p 32128:32128 \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
      #   -e HOSTUSER="$HOSTUSER" \
      #   -e IOTSTACKPWD="$IOTSTACKPWD" \
      #   -e CORS="$(CORS_LIST)" \
      #   -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
      #   -e HOSTSSH_PORT="$HOSTSSH_PORT" \
      #   --restart unless-stopped \
      #   -it $FULL_NAME /bin/bash
    fi
  else
    echo "IOTstack API Server is running"
  fi
fi
