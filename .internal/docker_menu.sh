#!/bin/bash

if [ "$1" = "stop" ]; then
  bash ./.internal/ctrl_api.sh stop
  bash ./.internal/ctrl_wui.sh stop
  bash ./.internal/ctrl_pycli.sh stop
else
  bash ./.internal/ctrl_api.sh
  bash ./.internal/ctrl_wui.sh
  bash ./.internal/ctrl_pycli.sh
fi
