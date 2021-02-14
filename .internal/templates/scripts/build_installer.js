const renderPostbuildScripts = (scripts) => {
  let contents = '';

  if (Array.isArray(scripts)) {
    scripts.forEach((script) => {
      contents += `
# Postbuild Service script:
# Injected by: ${script?.serviceName}
# Comment: ${script?.comment}`;

if (script?.multilineComment) {
  contents += `
: <<'END_COMMENT'

${script?.multilineComment}

END_COMMENT

`;
}
contents += `
${script?.code}

# End script (${script?.serviceName})`;
    });
  }

  return contents;
};

const renderPrebuildScripts = (scripts) => {
  let contents = '';

  if (Array.isArray(scripts)) {
    scripts.forEach((script) => {
      contents += `
# Prebuild Service script:
# Injected by: ${script?.serviceName}
# Comment: ${script?.comment}`;

if (script?.multilineComment) {
  contents += `
: <<'END_COMMENT'

${script?.multilineComment}

END_COMMENT

`;
}
contents += `
${script?.code}

# End script (${script?.serviceName})`;
    });
  }

  return contents;
};

const BuildInstaller = ({
  scriptName,
  options,
  server,
  settings,
  version,
  logger
}) => {
  return new Promise((resolve, reject) => {
    try {
      const result = {
        filename: 'scripts',
        data: 'No Data'
      };

      result.data = `
#!/bin/bash

# IOTstack build installer
# Build: ${options?.build}
# API Version: ${version}

# This script is automatically generated during build time
# To be executed at install time.

FROM_NET="false"
PREREQ_CHECK="true"
OVERWRITE_EXISTING_ASK="true"
CLEAN_CURRENT="false"
DISPLAY_WARNINGS="true"
BAD_OPTION_TRIGGER="false"

# Process input args
while test $# -gt 0
do
	case "$1" in
    --from-net) FROM_NET="true"
			;;
    --no-check) PREREQ_CHECK="false"
      ;;
    --overwrite) OVERWRITE_EXISTING_ASK="false"
      ;;
    --clean-current) CLEAN_CURRENT="true"
      ;;
    --no-warnings) DISPLAY_WARNINGS="false"
      ;;
		--*) echo "bad option $1" && BAD_OPTION_TRIGGER="true"
			;;
	esac
	shift
done

if [[ $BAD_OPTION_TRIGGER == "true" ]]; then
  if [[ $DISPLAY_WARNINGS == "true" ]]; then
    echo "Bad option detected."
    read -n 1 -t 5 -s -r -p "Press any key within 5 seconds to cancel build and exit " READIN
    if [[ ! -z "$READIN" ]]; then
      echo ""
      echo "Exiting..."
      exit 0
    fi
  else
    # Automatically exit if bad option detected and warnings are disabled.
    exit 1
  fi
fi

if [[ ! -f ./menu.sh ]]; then
  echo "Couldn't detect menu.sh file for IOTstack. Ensure you are in the correct directory:"
  pwd
  exit 2
fi

#### Prebuild service scripts
${renderPrebuildScripts(options?.prebuildScripts)}

#### End prebuild service scripts


# Merge docker-compose and docker-compose-overrides


#### Postbuild service scripts
${renderPostbuildScripts(options?.postbuildScripts)}

#### End postbuild service scripts

cp docker-compose-base.yml docker-compose.yml

echo ""
echo "Setup complete. You can start the stack with: "
echo "  docker-compose up"
echo "or"
echo "  docker-compose up -d --remove-orphans"

`;

      return resolve(result);
    } catch (err) {
      console.error(err);
      console.trace();
      console.trace();
      console.debug("\nParams:");
      console.debug({ scriptName });
      console.debug({ version });
      console.debug({ options });
      return reject({
        component: `BuildInstaller: - '${scriptName}'`,
        message: 'Unhandled error occured',
        error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
      });
    }
  });
};

module.exports = BuildInstaller;
