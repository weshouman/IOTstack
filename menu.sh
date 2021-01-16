#!/bin/bash

CURRENT_BRANCH=$(git name-rev --name-only HEAD)

# Minimum Software Versions
REQ_DOCKER_VERSION=18.2.0
REQ_PYTHON_VERSION=3.6.9
REQ_PIP_VERSION=3.6.9
REQ_PYAML_VERSION=0.16.12
REQ_BLESSED_VERSION=1.17.5

PYTHON_CMD=python3
VGET_CMD="$PYTHON_CMD ./scripts/python_deps_check.py"

sys_arch=$(uname -m)

# ----------------------------------------------
# Helper functions
# ----------------------------------------------
source ./scripts/setup_iotstack.sh

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
		echo "Docker is not setup."
		if (whiptail --title "Install Docker" --yesno "Docker or docker-compose doesn't seem to be installed. After installation the system will need to be rebooted.\r\n\r\nInstall Docker and docker-compose now?" 14 78); then
			docker_installed_check
		fi
	fi

	if [[ "$(group_check)" == "fail" ]]; then
		echo "User not in correct groups. Run:"
		echo "bash ./menu.sh --run-env-setup"
	fi

	if [[ "$DOCKER_VERSION_GOOD" == "true" ]]; then
		echo "Project dependencies up to date"
		echo ""
	else
		echo "Project dependencies not up to date. Menu may crash."
		echo "To be prompted to update again, run command:"
		echo "  rm .docker_notinstalled || rm .docker_outofdate || rm .project_outofdate"
		echo ""
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

# Hand control to new menu
echo "Started!"
# $PYTHON_CMD ./scripts/menu_main.py $ENCODING_TYPE
