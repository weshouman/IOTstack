#!/bin/bash

CURRENT_BRANCH=$(git name-rev --name-only HEAD)

# Minimum Software Versions
REQ_DOCKER_VERSION=18.2.0

sys_arch=$(uname -m)

# ----------------------------------------------
# Helper functions
# ----------------------------------------------
source ./scripts/setup_iotstack.sh
source ./.internal/meta.sh

SKIPCHECKS="false"
FORCE_REBUILD="false"

function check_git_updates() {
  UPSTREAM=${1:-'@{u}'}
  LOCAL=$(git rev-parse @)
  REMOTE=$(git rev-parse "$UPSTREAM")
  BASE=$(git merge-base @ "$UPSTREAM")

  if [ $LOCAL = $REMOTE ]; then
    echo "Up-to-date"
  elif [ $LOCAL = $BASE ]; then
    echo "Need to pull"
  elif [ $REMOTE = $BASE ]; then
    echo "Need to push"
  else
    echo "Diverged"
  fi
}

function update_project() {
  git pull origin $CURRENT_BRANCH
  git status
}

function project_checks() {
  echo "Checking for project update" >&2
  git fetch origin $CURRENT_BRANCH

  if [[ "$(check_git_updates)" == "Need to pull" ]]; then
    echo "An update is available for IOTstack" >&2
    if [ ! -f .ignore_project_outofdate ]; then
      if (whiptail --title "Project update" --yesno "An update is available for IOTstack\nYou will not be reminded again until after you update.\nYou can upgrade manually by typing:\n  git pull origin $CURRENT_BRANCH \n\n\nWould you like to update now?" 14 78); then
        update_project
      else
        touch .ignore_project_outofdate
      fi
    fi
  else
    [ -f .ignore_project_outofdate ] && rm .ignore_project_outofdate
    echo "Project is up to date" >&2
  fi
}

while test $# -gt 0
do
  case "$1" in
    --branch) CURRENT_BRANCH=${2:-$(git name-rev --name-only HEAD)}
      ;;
    --no-check) echo ""
      ;;
    --stop) echo "Stopping all menu containers" && bash ./.internal/docker_menu.sh stop
      ;;
    --rebuild) echo "Force rebuild all menu containers" && FORCE_REBUILD="true"
      ;;
    --run-env-setup)
        echo "Setting up environment:"
        generate_container_ssh
        install_ssh_keys
        if [[ ! "$(user_in_group bluetooth)" == "notgroup" ]] && [[ ! "$(user_in_group bluetooth)" == "true" ]]; then
          echo "User is NOT in 'bluetooth' group. Adding:" >&2
          echo "sudo -E usermod -G bluetooth -a $USER" >&2
          echo "You will need to restart your system before the changes take effect."
          sudo -E usermod -G "bluetooth" -a $USER
        fi

        if [ ! "$(user_in_group docker)" == "true" ]; then
          echo "User is NOT in 'docker' group. Adding:" >&2
          echo "sudo -E usermod -G docker -a $USER" >&2
          echo "You will need to restart your system before the changes take effect."
          sudo -E usermod -G "docker" -a $USER
        fi

        echo "Setup completed"
      ;;
    --encoding) ENCODING_TYPE=$2
      ;;
    --*) echo "bad option $1"
      ;;
  esac
  shift
done

# ----------------------------------------------
# Menu bootstrap entry point
# ----------------------------------------------
if [[ "$*" == *"--no-check"* ]]; then
  echo "Skipping preflight checks."
  SKIPCHECKS="true"
else
  echo "Please enter sudo pasword if prompted"

  if [[ ! -f .installed ]]; then
    echo "IOTstack has not yet been installed. Please reboot your system after installation is completed. "
    echo "  ./install.sh"
    bash ./install.sh
    exit 0
  fi

  project_checks

  echo ""
  printf "Checking Container keys...  "
  if [[ "$(check_container_ssh)" == "false" ]]; then
    echo "SSH keys for containers do not exist. the menu containers will not be able to execute commands on your host."
    echo "To regenerate these keys, run:"
    echo "  bash ./menu.sh --run-env-setup"
  else
    echo "Keys file found."
      printf "Checking Host Authorised keys...  "
      if [[ "$(check_host_ssh_keys)" == "false" ]]; then
        echo "SSH key for menu containers not found in authorized_keys file"
        echo "To regenerate and install keys, run:"
        echo "  bash ./menu.sh --run-env-setup"
      else
        echo "Key found in authorized_keys file."
      fi
  fi

  echo ""
  printf "Checking Docker state...  "
  DOCKER_CHECK_RESULT="$(docker_check)"
  if [[ "$DOCKER_CHECK_RESULT" == "fail" ]]; then
    echo "Docker is not setup. Cannot continue"
    exit 2
  fi

  if [[ "$DOCKER_CHECK_RESULT" == "outdated" ]]; then
    echo ""
    echo "Docker is outdated. You should consider updating. To be reprompted, type:"
    echo "  rm .ignore_docker_outofdate"
    echo ""
  fi

  echo ""
  printf "Checking User groups ['bluetooth', 'docker']:  "
  if [[ "$(group_check)" == "fail" ]]; then
    echo "User not in correct groups. Run:"
    echo "  bash ./menu.sh --run-env-setup"
  else
    echo "User in required groups."
  fi
  
  # ----------------------------------------------
  # Check state of running menu instances
  # ----------------------------------------------
  echo ""
  printf "Checking menu container state... "

  PREBUILT_IMAGES="true"
  if [[ "$(docker images -q iostack_api:$VERSION 2> /dev/null)" == "" ]]; then
    PREBUILT_IMAGES="false"
  fi

  if [[ "$(docker images -q iostack_pycli:$VERSION 2> /dev/null)" == "" ]]; then
    PREBUILT_IMAGES="false"
  fi

  if [[ "$(docker images -q iostack_wui:$VERSION 2> /dev/null)" == "" ]]; then
    PREBUILT_IMAGES="false"
  fi

  if [[ "$PREBUILT_IMAGES" == "false" || "$FORCE_REBUILD" == "true" ]]; then
    echo " Rebuild requied. All running menu containers will be restarted."
    echo "You either recently installed or upgraded IOTstack. The menu docker images need to be rebuilt in order for the menu to run correctly. This will take about 10 minutes and is completely automatic."
    echo ""
    echo "Spinning down container instances"
    bash ./.internal/docker_menu.sh stop

    sleep 1

    docker rmi $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep 'iostack_wui') --force 2> /dev/null
    docker rmi $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep 'iostack_api') --force 2> /dev/null
    docker rmi $(docker images -q --format "{{.Repository}}:{{.Tag}}" | grep 'iostack_pycli') --force 2> /dev/null

    sleep 1

    # Build all asynchronously, so it's faster. Give PyCLI a slight headstart to keep the user waiting the shortest time.
    docker build --quiet -t iostack_pycli:$VERSION -f ./.internal/pycli.Dockerfile . > /dev/null &
    sleep 1
    docker build --quiet -t iostack_api:$VERSION -f ./.internal/api.Dockerfile . > /dev/null &
    docker build --quiet -t iostack_wui:$VERSION -f ./.internal/wui.Dockerfile . > /dev/null &

    SLEEP_COUNTER=0
    API_REBUILD_DONE="not completed"
    PYCLI_REBUILD_DONE="not completed"
    WUI_REBUILD_DONE="not completed"

    until [[ $SLEEP_COUNTER -gt 601 || ("$API_REBUILD_DONE" == "completed" && "$PYCLI_REBUILD_DONE" == "completed" && "$WUI_REBUILD_DONE" == "completed") ]]; do
      if [[ ! "$(docker images -q iostack_api:$VERSION)" == "" && ! $API_REBUILD_DONE == "completed" ]]; then
        API_REBUILD_DONE="completed"
        echo ""
        echo "iostack_api:$VERSION build complete"
      fi

      if [[ ! "$(docker images -q iostack_pycli:$VERSION)" == "" && ! $PYCLI_REBUILD_DONE == "completed" ]]; then
        PYCLI_REBUILD_DONE="completed"
        echo ""
        echo "iostack_pycli:$VERSION build complete"
      fi

      if [[ ! "$(docker images -q iostack_wui:$VERSION)" == "" && ! $WUI_REBUILD_DONE == "completed" ]]; then
        WUI_REBUILD_DONE="completed"
        echo ""
        echo "iostack_wui:$VERSION build complete"
      fi

      if [ "$(( $SLEEP_COUNTER % 60 ))" -eq 0 ]; then
        echo ""
        if [[ $SLEEP_COUNTER -gt 1 ]]; then
          echo "$SLEEP_COUNTER seconds passed. Still building..."
        fi
      else
        printf .
      fi
      sleep 1

      ((SLEEP_COUNTER++))
    done

    echo ""
  fi

  if [[ $SLEEP_COUNTER -gt 600 ]]; then
    echo ""
    echo "Something seems to have gone wrong when rebuilding the menu docker images."
    echo "API Rebuild: $API_REBUILD_DONE"
    echo "PyCLI Rebuild: $PYCLI_REBUILD_DONE"
    echo "WUI Rebuild: $WUI_REBUILD_DONE"
    echo ""
  fi
fi
echo " Menu check completed."
echo ""

echo "Spinning up menu containers... "

if [[ "$SKIPCHECKS" == "false" ]]; then
  if nc -w 1 $HOST_CON_IP $API_PORT ; then
    echo "WUI detected on $HOST_CON_IP:$API_PORT"
  fi

  if nc -w 1 $HOST_CON_IP $WUI_PORT ; then
    echo "API detected on $HOST_CON_IP:$WUI_PORT"
  fi
fi

# If PyCLI is already running then reattach
PYCLI_ID="$(docker ps --format '{{.ID}} {{.Image}}' | grep -w iostack_pycli:$VERSION | cut -d ' ' -f1 | head -n 1)"
if [[ "$PYCLI_ID" == "" ]]; then
  bash ./.internal/docker_menu.sh
else
  bash ./.internal/ctrl_api.sh > /dev/null
  echo "PyCLI menu is already running. Reattaching..."
  docker attach --sig-proxy=false $PYCLI_ID
fi
