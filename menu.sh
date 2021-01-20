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
	SKIPCHECKS="true"
else
	echo "Please enter sudo pasword if prompted"

	project_checks

	echo ""
	printf "Checking Container keys...  "
	if [[ "$(check_container_ssh)" == "false" ]]; then
		echo "SSH keys for containers do not exist. the menu containers will not be able to execute commands on your host."
		echo "To regenerate these keys, run:"
		echo "  bash ./menu.sh --run-env-setup"
	else
		echo "Keys found."
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
	printf "Checking User group...  "
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

	if [[ "$PREBUILT_IMAGES" == "false" ]]; then
		echo " Rebuild requied"
		echo "You either recently installed or upgraded IOTstack. The menu docker images need to be rebuilt in order for the menu to run correctly. This will take about a minute and is completely automatic."
		bash ./.internal/docker_menu.sh stop > /dev/null &

		sleep 1

		# Build all asynchronously, so it's faster. Give PyCLI a slight headstart to keep the user waiting the shortest time.
		docker build --quiet -t iostack_pycli:$VERSION -f ./.internal/pycli.Dockerfile . > /dev/null &
		sleep 1
		docker build --quiet -t iostack_api:$VERSION -f ./.internal/api.Dockerfile . > /dev/null &
		sleep 2
		docker build --quiet -t iostack_wui:$VERSION -f ./.internal/wui.Dockerfile . > /dev/null &

		SLEEP_COUNTER=0
		API_REBUILD_DONE="not completed"
		PYCLI_REBUILD_DONE="not completed"

		until [[ $SLEEP_COUNTER -gt 300 || ("$API_REBUILD_DONE" == "completed" && "$PYCLI_REBUILD_DONE" == "completed") ]];	do
			if [[ ! "$(docker images -q iostack_api:$VERSION)" == "" ]]; then
				API_REBUILD_DONE="completed"
			fi

			if [[ ! "$(docker images -q iostack_pycli:$VERSION)" == "" ]]; then
				PYCLI_REBUILD_DONE="completed"
			fi

			printf .
			sleep 1

			((SLEEP_COUNTER++))
		done

		echo ""
	fi

	if [[ $SLEEP_COUNTER -gt 300 ]]; then
		echo ""
		echo "Something seems to have gone wrong when rebuilding the menu docker images."
		echo "API Rebuild: $API_REBUILD_DONE"
		echo "PyCLI Rebuild: $PYCLI_REBUILD_DONE"
		echo ""
	fi
fi
echo " Menu check completed."
echo ""

while test $# -gt 0
do
	case "$1" in
		--branch) CURRENT_BRANCH=${2:-$(git name-rev --name-only HEAD)}
			;;
		--no-check) echo ""
			;;
		--stop) echo "Stopping all menu containers" && bash ./.internal/docker_menu.sh stop
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

echo "Spinning up menu containers... "

if [[ "$SKIPCHECKS" == "false" ]]; then
	if nc -w 1 localhost 32777 ; then
		echo "WUI detected on localhost:32777"
	fi

	if nc -w 1 localhost 32128 ; then
		echo "API detected on localhost:32128"
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
