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

  /*
    Order:
      1. compile() - merges build options into the final JSON output.
      2. issues()  - runs checks on the compile()'ed JSON, and can also test for errors.
      3. build()   - sets up scripts and files.
  */

  retr.init = () => {
    logger.debug(`ServiceBuilder:init() - '${serviceName}'`);
  };

  retr.compile = ({
    outputTemplateJson,
    buildOptions,
  }) => {
    return new Promise((resolve, reject) => {
      try {
        console.info(`ServiceBuilder:compile() - '${serviceName}' started`);
        // Code here
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
        let addonsSelected = false;
        const addonsList = buildOptions?.services?.nodered?.addons ?? [];
        if (addonsList.length > 0) {
          addonsSelected = true;
        }
        console.info(`ServiceBuilder:issues() - '${serviceName}' completed`);
        if (!addonsSelected) {
          return resolve([{
            type: 'service',
            name: serviceName,
            issueType: 'no addons',
            message: 'No pallette addons selected for NodeRed. Select addons in options to remove this warning. This is optional.'
          }]);
        }
        return resolve([]);
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
        const addonsList = buildOptions?.services?.nodered?.addons ?? [];
        const noderedDockerfileTemplate = path.join(__dirname, settings.paths.buildFiles, 'Dockerfile.template');
        const noderedDockerfileCommandTemplate = require(path.join(__dirname, settings.paths.buildFiles, 'addons.json'));
        const tempDockerfileName = `${fileTimePrefix}_Dockerfile.template`;

        const templateData = fs.readFileSync(noderedDockerfileTemplate, { encoding: 'utf8', flag: 'r' });
        let addonDockerCommandOutput = noderedDockerfileCommandTemplate.data.dockerFileInstallCommand;

        if (addonsList.length > 0) {
          addonsList.forEach((addon) => {
            addonDockerCommandOutput += `${addon} `
          });
        } else {
          addonDockerCommandOutput = '';
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
