#!/bin/bash

if [ "$1" = "stop" ]; then
  bash ./ctrl_api.sh stop
  bash ./ctrl_wui.sh stop
  # bash ./ctrl_cli.sh stop
else
  bash ./ctrl_api.sh
  bash ./ctrl_wui.sh
  # bash ./ctrl_cli.sh
fi
