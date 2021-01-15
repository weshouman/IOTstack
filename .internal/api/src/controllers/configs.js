const ConfigsController = ({ server, settings, version, logger }) => {
  const { getDirectoryList, getFileList, emptyDirectory } = require('../utils/fsUtils');
  const retr = {};

  const path = require('path');
  const fs = require('fs');

  retr.init = () => {
    logger.debug('ConfigsController:init()');
  };

  retr.getConfigOptions = async ({ serviceName }) => {
    return new Promise(async (resolve, reject) => {
      let serviceBuildScript;
      try {
        const {
          localTemplatesPath,
          localServicesRelativePath,
          configLogicFile
        } = settings.paths;
        const servicesBuildPath = path.join(localTemplatesPath, localServicesRelativePath);
        serviceBuildScript = path.join(servicesBuildPath, serviceName, configLogicFile);

        const configLogic = require(serviceBuildScript)();

        return resolve(configLogic.getConfigOptions());
      } catch (err) {
        console.log(err);
        console.trace();
        console.debug("\nParams:");
        console.debug({ serviceName });
        console.debug({ serviceBuildScript });
        return reject({
          component: 'ConfigsController::getConfigOptions',
          message: 'Unhandled error occured',
          error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        });
      }
    });
  };

  retr.getHelp = async ({ serviceName }) => {
    return new Promise(async (resolve, reject) => {
      let serviceBuildScript;
      try {
        const {
          localTemplatesPath,
          localServicesRelativePath,
          configLogicFile
        } = settings.paths;
        const servicesBuildPath = path.join(localTemplatesPath, localServicesRelativePath);
        serviceBuildScript = path.join(servicesBuildPath, serviceName, configLogicFile);

        const configLogic = require(serviceBuildScript)();

        return resolve(configLogic.getHelp());
      } catch (err) {
        console.log(err);
        console.trace();
        console.debug("\nParams:");
        console.debug({ serviceName });
        console.debug({ serviceBuildScript });
        return reject({
          component: 'ConfigsController::getHelp',
          message: 'Unhandled error occured',
          error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        });
      }
    });
  };

  retr.getScripts = async ({ serviceName, scriptName }) => {
    return new Promise(async (resolve, reject) => {
      let serviceBuildScript;
      try {
        const {
          localTemplatesPath,
          localServicesRelativePath,
          configLogicFile
        } = settings.paths;
        const servicesBuildPath = path.join(localTemplatesPath, localServicesRelativePath);
        serviceBuildScript = path.join(servicesBuildPath, serviceName, configLogicFile);

        const configLogic = require(serviceBuildScript)();

        if (scriptName) {
          return resolve(configLogic.getCommands().commands[scriptName]);
        }

        return resolve(configLogic.getCommands());
      } catch (err) {
        console.log(err);
        console.trace();
        console.debug("\nParams:");
        console.debug({ serviceName });
        console.debug({ serviceBuildScript });
        console.debug({ scriptName });
        return reject({
          component: 'ConfigsController::getScripts',
          message: 'Unhandled error occured',
          error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        });
      }
    });
  };

  retr.getMeta = async ({ serviceName }) => {
    return new Promise(async (resolve, reject) => {
      let serviceBuildScript;
      try {
        const {
          localTemplatesPath,
          localServicesRelativePath,
          configLogicFile
        } = settings.paths;
        const servicesBuildPath = path.join(localTemplatesPath, localServicesRelativePath);
        serviceBuildScript = path.join(servicesBuildPath, serviceName, configLogicFile);

        const configLogic = require(serviceBuildScript)();

        return resolve(configLogic.getMeta());
      } catch (err) {
        console.log(err);
        console.trace();
        console.debug("\nParams:");
        console.debug({ serviceName });
        console.debug({ serviceBuildScript });
        return reject({
          component: 'ConfigsController::getMeta',
          message: 'Unhandled error occured',
          error: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
        });
      }
    });
  };

  return retr;
}
module.exports = ConfigsController;
