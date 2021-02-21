const fs = require('fs');
const path = require('path');
const { byName } = require('../../../src/utils/interpolate');

const ServiceBuilder = ({
  settings,
  version,
  logger
}) => {
  const retr = {};
  const serviceName = 'nodered';

  const {
    setModifiedPorts,
    setLoggingState,
    setNetworkMode,
    setNetworks,
    setEnvironmentVariables,
    setDevices
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

  const createVolumesDirectory = () => {
    return `
mkdir -p ./volumes/nodered/data
`;
  };

  const checkVolumesDirectory = () => {
    return `
if [[ ! -d ./volumes/nodered/data ]]; then
  echo "Nodered data directory is missing!"
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
          modifiedNetworks: setNetworks({ buildTemplate: outputTemplateJson, buildOptions, serviceName }),
          modifiedEnvironment: setEnvironmentVariables({ buildTemplate: outputTemplateJson, buildOptions, serviceName }),
          modifiedDevices: setDevices({ buildTemplate: outputTemplateJson, buildOptions, serviceName })
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

        let addonsSelected = false;
        const addonsList = buildOptions?.services?.nodered?.addons ?? [];
        if (addonsList.length > 0) {
          addonsSelected = true;
        }
        console.info(`ServiceBuilder:issues() - '${serviceName}' completed`);
        if (!addonsSelected) {
          issues.push({
            type: 'service',
            name: serviceName,
            issueType: 'no addons',
            message: 'No pallette addons selected for NodeRed. Select addons in options to remove this warning. Default modules will be installed.'
          });
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
    fileTimePrefix,
    buildOptions,
    tmpPath,
    zipList,
    prebuildScripts,
    postbuildScripts
  }) => {
    return new Promise((resolve, reject) => {
      try {
        console.info(`ServiceBuilder:build() - '${serviceName}' started`);
        const addonsList = buildOptions?.services?.nodered?.addons ?? false;
        const noderedDockerfileTemplate = path.join(__dirname, settings.paths.buildFiles, 'Dockerfile.template');
        const noderedDockerfileCommandTemplate = require(path.join(__dirname, settings.paths.buildFiles, 'addons.json'));
        const tempDockerfileName = `${fileTimePrefix}_Dockerfile.template`;

        const templateData = fs.readFileSync(noderedDockerfileTemplate, { encoding: 'utf8', flag: 'r' });
        let addonDockerCommandOutput = noderedDockerfileCommandTemplate.data.dockerFileInstallCommand;

        if (Array.isArray(addonsList)) {
          if (addonsList.length > 0) {
            addonsList.forEach((addon) => {
              addonDockerCommandOutput += `${addon} `;
            });
          } else {
            addonDockerCommandOutput = '';
          }
        } else {
          // Use default addons
          const defaultAddons = require("./buildFiles/addons.json");
          (defaultAddons?.data?.addons?.defaultOn ?? []).forEach((addon) => {
            addonDockerCommandOutput += `${addon} `;
          });
        }
  
        const outputDockerFile = byName(templateData, {
          'npmInstallModulesList': addonDockerCommandOutput
        });

        const tempBuildFile = path.join(tmpPath, tempDockerfileName);

        fs.writeFileSync(tempBuildFile, outputDockerFile);

        zipList.push({
          fullPath: tempBuildFile,
          zipName: '/services/nodered/Dockerfile'
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
