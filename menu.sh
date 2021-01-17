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

# ----------------------------------------------
# Menu bootstrap entry point
# ----------------------------------------------
if [[ "$*" == *"--no-check"* ]]; then
	echo "Skipping preflight checks."
else
	echo "Please enter sudo pasword if prompted"

	project_checks

	if [[ "$(docker_checks)" == "fail" ]]; then
		echo "Docker is not setup. Cannot continue"
		exit 2
	fi

	if [[ "$(docker_checks)" == "outdated" ]]; then
		echo ""
		echo "Docker is outdated. You should consider updating. To be reprompted, type:"
		echo "  rm .ignore_docker_outofdate"
		echo ""
	fi

	if [[ "$(group_check)" == "fail" ]]; then
		echo "User not in correct groups. Run:"
		echo "bash ./menu.sh --run-env-setup"
	fi
fi

while test $# -gt 0
do
	case "$1" in
		--branch) CURRENT_BRANCH=${2:-$(git name-rev --name-only HEAD)}
			;;
		--no-check) echo ""
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
			;;
		--encoding) ENCODING_TYPE=$2
			;;
		--*) echo "bad option $1"
			;;
	esac
	shift
done

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

if [[ "$PREBUILT_IMAGES" == "" ]]; then
	echo "You either recently installed or upgraded IOTstack. The menu docker images need to be rebuilt in order for the menu to run correctly. This will take a few minutes."

	# Build all asynchronously, so it's faster. Give PyCLI a slight headstart to keep the user waiting the shortest time.
	docker build --quiet -t iostack_pycli:$VERSION -f ./.internal/pycli.Dockerfile . &
	sleep 1
	docker build --quiet -t iostack_api:$VERSION -f ./.internal/api.Dockerfile . &
	sleep 2
	docker build --quiet -t iostack_wui:$VERSION -f ./.internal/wui.Dockerfile . &

	SLEEP_COUNTER=0
	API_REBUILD_DONE="false"
	PYCLI_REBUILD_DONE="false"

	until [[ $SLEEP_COUNTER -gt 60 || ("$API_REBUILD_DONE" == "true" && "$PYCLI_REBUILD_DONE" == "true") ]];	do
		if [[ ! "$(docker images -q iostack_api:$VERSION 2> /dev/null)" == "" ]]; then
			API_REBUILD_DONE="true"
		fi

		if [[ ! "$(docker images -q iostack_pycli:$VERSION 2> /dev/null)" == "" ]]; then
			PYCLI_REBUILD_DONE="false"
		fi

		printf(".")
		sleep 1

		((SLEEP_COUNTER++))
	done
fi

if [[ $SLEEP_COUNTER -gt 60 ]]; then
	echo "Something seems to have gone wrong when rebuilding the menu docker images."
fi

# Hand control to new menu
echo "Started!"
# $PYTHON_CMD ./scripts/menu_main.py $ENCODING_TYPE
