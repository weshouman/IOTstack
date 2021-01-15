const ServiceBuilder = ({
  settings,
  version,
  logger
}) => {
  const retr = {};
  const serviceName = 'mariadb';

  retr.init = () => {
    logger.debug(`ServiceBuilder:init() - '${serviceName}'`);
  };

  const createVolumesDirectory = () => {
    return `
mkdir -p ./volumes/mariadb/config
`;
  };

  const checkVolumesDirectory = () => {
    return `
if [[ ! -d ./volumes/mariadb/config ]]; then
  echo "MariaDB config directory is missing!"
  sleep 2
fi
`;
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
        return resolve();
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

  retr.issues = ({
    outputTemplateJson,
    buildOptions,
    tmpPath
  }) => {
    return new Promise((resolve, reject) => {
      try {
        console.info(`ServiceBuilder:issues() - '${serviceName}' started`);
        // Code here
        console.info(`ServiceBuilder:issues() - '${serviceName}' completed`);
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

  return retr;
}

module.exports = ServiceBuilder;
