const ServiceBuilder = ({
  settings,
  version,
  logger
}) => {
  const path = require('path');
  const retr = {};
  const serviceName = 'mosquitto';

  const {
    setModifiedPorts,
    setLoggingState,
    setNetworkMode,
    setNetworks
  } = require('../../../src/utils/commonCompileLogic');

  const {
    checkPortConflicts,
    checkNetworkConflicts
  } = require('../../../src/utils/commonBuildChecks');

  /*
    Order:
      1. compile() - merges build options into the final JSON output.
      2. issues()  - runs checks on the compile()'ed JSON, and can also test for errors.
      3. build()   - sets up scripts and files.
  */

  retr.init = () => {
    logger.debug(`ServiceBuilder:init() - '${serviceName}'`);
  };

  const checkServiceFilesCopied = () => {
    return `
if [[ ! -f ./services/mosquitto/mosquitto.conf ]]; then
  echo "Mosquitto config file is missing!"
  sleep 2
fi
`;
  };

  const createVolumesDirectory = () => {
    return `
mkdir -p ./volumes/mosquitto/data
mkdir -p ./volumes/mosquitto/pwfile
mkdir -p ./volumes/mosquitto/data
`;
  };

  const checkVolumesDirectory = () => {
    return `
if [[ ! -d ./volumes/mosquitto/data ]]; then
  echo "Mosquitto data directory is missing!"
  sleep 2
fi

if [[ ! -d ./volumes/mosquitto/pwfile ]]; then
  echo "Mosquitto pwfile directory is missing!"
  sleep 2
fi

if [[ ! -d ./volumes/mosquitto/log ]]; then
  echo "Mosquitto log directory is missing!"
  sleep 2
fi
`;
  };

  retr.compile = ({
    outputTemplateJson,
    buildOptions,
  }) => {
    return new Promise((resolve, reject) => {
      try {
        console.info(`ServiceBuilder:compile() - '${serviceName}' started`);

        const compileResults = {
          modifiedPorts: setModifiedPorts({ buildTemplate: outputTemplateJson, buildOptions, serviceName }),
          modifiedLogging: setLoggingState({ buildTemplate: outputTemplateJson, buildOptions, serviceName }),
          modifiedNetworkMode: setNetworkMode({ buildTemplate: outputTemplateJson, buildOptions, serviceName }),
          modifiedNetworks: setNetworks({ buildTemplate: outputTemplateJson, buildOptions, serviceName })
        };
        console.info(`ServiceBuilder:compile() - '${serviceName}' Results:`, compileResults);

        console.info(`ServiceBuilder:compile() - '${serviceName}' completed`);
        return resolve({ type: 'service' });
      } catch (err) {
        console.error(err);
        console.trace();
        console.debug("\nParams:");
        console.debug({ outputTemplateJson });
        console.debug({ buildOptions });
        return reject({
          component: `ServiceBuilder::compile() - '${serviceName}'`,
          message: 'Unhandled error occured',
          error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        });
      }
    });
  };

  retr.issues = ({
    outputTemplateJson,
    buildOptions,
    tmpPath
  }) => {
    return new Promise((resolve, reject) => {
      try {
        console.info(`ServiceBuilder:issues() - '${serviceName}' started`);
        let issues = [];

        const portConflicts = checkPortConflicts({ buildTemplate: outputTemplateJson, buildOptions, serviceName });
        issues = [...issues, ...portConflicts];

        const networkConflicts = checkNetworkConflicts({ buildTemplate: outputTemplateJson, buildOptions, serviceName });
        if (networkConflicts) {
          issues.push(networkConflicts);
        }

        console.info(`ServiceBuilder:issues() - '${serviceName}' Issues found: ${issues.length}`);
        console.info(`ServiceBuilder:issues() - '${serviceName}' completed`);
        return resolve(issues);
      } catch (err) {
        console.error(err);
        console.trace();
        console.debug("\nParams:");
        console.debug({ outputTemplateJson });
        console.debug({ buildOptions });
        console.debug({ tmpPath });
        return reject({
          component: `ServiceBuilder::issues() - '${serviceName}'`,
          message: 'Unhandled error occured',
          error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        });
      }
    });
  };

  retr.build = ({
    outputTemplateJson,
    buildOptions,
    tmpPath,
    zipList,
    prebuildScripts,
    postbuildScripts
  }) => {
    return new Promise((resolve, reject) => {
      try {
        console.info(`ServiceBuilder:build() - '${serviceName}' started`);
        const mosquittoConfFilePath = path.join(__dirname, settings.paths.serviceFiles, 'mosquitto.conf');
        zipList.push({
          fullPath: mosquittoConfFilePath,
          zipName: '/services/mosquitto/mosquitto.conf'
        });
        console.debug(`ServiceBuilder:build() - '${serviceName}' Added '${mosquittoConfFilePath}' to zip`);

        postbuildScripts.push({
          serviceName,
          comment: 'Ensure required service files exist for launch',
          multilineComment: null,
          code: checkServiceFilesCopied()
        });

        prebuildScripts.push({
          serviceName,
          comment: 'Create required service directory exists for first launch',
          multilineComment: null,
          code: createVolumesDirectory()
        });

        postbuildScripts.push({
          serviceName,
          comment: 'Ensure required service directory exists for launch',
          multilineComment: null,
          code: checkVolumesDirectory()
        });

        console.info(`ServiceBuilder:build() - '${serviceName}' completed`);
        return resolve({ type: 'service' });
      } catch (err) {
        console.error(err);
        console.trace();
        console.debug("\nParams:");
        console.debug({ outputTemplateJson });
        console.debug({ buildOptions });
        console.debug({ tmpPath });
        return reject({
          component: `ServiceBuilder::build() - '${serviceName}'`,
          message: 'Unhandled error occured',
          error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        });
      }
    });
  };

  return retr;
}

module.exports = ServiceBuilder;
