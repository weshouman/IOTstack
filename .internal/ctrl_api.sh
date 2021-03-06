#!/bin/bash

source ./.internal/meta.sh
DNAME=iostack_api
FULL_NAME="$DNAME:$VERSION"

RUN_MODE="production"

if [ "$1" = "stop" ]; then
  docker stop $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") 2> /dev/null
  docker stop $(docker ps -q --format "{{.ID}} {{.Ports}}" | grep "$API_PORT" | cut -d ' ' -f1) 2> /dev/null
else
  if [[ $IOTENV == "development" || "$1" == "development" ]]; then
    RUN_MODE="development"
    echo "[Development: '$FULL_NAME'] Stopping container:"
    echo "docker stop \$(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") || docker rmi $FULL_NAME --force"
    docker stop $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep "${DNAME}") 2> /dev/null || docker rmi $FULL_NAME --force 2> /dev/null
    echo "docker stop \$(docker ps -q --format "{{.ID}} {{.Ports}}" | grep $API_PORT | cut -d ' ' -f1) 2> /dev/null"
    docker stop $(docker ps -q --format "{{.ID}} {{.Ports}}" | grep "$API_PORT" | cut -d ' ' -f1) 2> /dev/null
    echo ""
    echo "Rebuilding container:"
    echo "docker build --no-cache -t $FULL_NAME -f ./.internal/api.Dockerfile ."
    docker pull node:14 # Docker occasionally fails to pull image when building when it is not cached.
    docker build --no-cache -t $FULL_NAME -f ./.internal/api.Dockerfile .
  else
    if [[ "$(docker images -q $FULL_NAME 2> /dev/null)" == "" ]]; then
      echo "Building '$FULL_NAME'"
      docker pull node:14 # Docker occasionally fails to pull image when building when it is not cached.
      docker build --quiet -t $FULL_NAME -f ./.internal/api.Dockerfile .
    else
      echo "Build for '$FULL_NAME' already exists. Skipping..."
    fi
  fi

  CORS_LIST=""
  for sepspace in "$(hostname --all-ip-addresses)"; do
    sepspace="$(echo $sepspace | xargs)"
    CORS_LIST="$CORS_LIST $sepspace:$API_PORT "
  done

  if ! docker ps --format '{{.Image}}' | grep -w $FULL_NAME &> /dev/null; then
    if [[ $IOTENV == "development" || "$1" == "development"  ]]; then
      echo "Starting in development watch mode the IOTstack API Server on port: $API_PORT"
      docker run -p $API_PORT:$API_PORT \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/api,target=/usr/iotstack_api \
        -e IOTENV="$RUN_MODE" \
        -e API_PORT="$API_PORT" \
        -e API_INTERFACE="$API_INTERFACE" \
        -e HOSTUSER="$HOSTUSER" \
        -e IOTSTACKPWD="$IOTSTACKPWD" \
        -e CORS="$CORS_LIST" \
        -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
        -e HOSTSSH_PORT="$HOSTSSH_PORT" \
        --restart unless-stopped \
        $FULL_NAME
    else
      echo "Starting IOTstack API Server on port: $API_PORT"
      docker run -d -p $API_PORT:$API_PORT \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds \
        --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
        --net=host \
        -e IOTENV="$RUN_MODE" \
        -e API_PORT="$API_PORT" \
        -e API_INTERFACE="$API_INTERFACE" \
        -e HOSTUSER="$HOSTUSER" \
        -e IOTSTACKPWD="$IOTSTACKPWD" \
        -e CORS="$CORS_LIST" \
        -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
        -e HOSTSSH_PORT="$HOSTSSH_PORT" \
        --restart unless-stopped \
        $FULL_NAME

      # docker run -p $API_PORT:$API_PORT \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
      #   -e API_PORT="$API_PORT" \
      #   -e API_INTERFACE="$API_INTERFACE" \
      #   -e cors="yourLanIpHere:$WUI_PORT" \
      #   -e HOSTUSER="$HOSTUSER" \
      #   -e IOTSTACKPWD="$IOTSTACKPWD" \
      #   -e CORS="$(CORS_LIST)" \
      #   -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
      #   -e HOSTSSH_PORT="$HOSTSSH_PORT" \
      #   --restart unless-stopped \
      #   $FULL_NAME

      # docker run -p $API_PORT:$API_PORT \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/templates,target=/usr/iotstack_api/templates,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/saved_builds,target=/usr/iotstack_api/builds,readonly \
      #   --mount type=bind,source="$IOTSTACKPWD"/.internal/.ssh,target=/root/.ssh,readonly \
      #   -e API_PORT="$API_PORT" \
      #   -e API_INTERFACE="$API_INTERFACE" \
      #   -e HOSTUSER="$HOSTUSER" \
      #   -e IOTSTACKPWD="$IOTSTACKPWD" \
      #   -e CORS="$(CORS_LIST)" \
      #   -e HOSTSSH_ADDR="$HOSTSSH_ADDR" \
      #   -e HOSTSSH_PORT="$HOSTSSH_PORT" \
      #   --restart unless-stopped \
      #   -it $FULL_NAME /bin/bash
    fi
  else
    echo "IOTstack API Server is running. Check port: $API_PORT or run 'docker ps'"
  fi
fi
