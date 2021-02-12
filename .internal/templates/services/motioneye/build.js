const ServiceBuilder = ({
  settings,
  version,
  logger
}) => {
  const retr = {};
  const serviceName = 'motioneye';

  /*
    Order:
      1. compile() - merges build options into the final JSON output.
      2. issues()  - runs checks on the compile()'ed JSON, and can also test for errors.
      3. build()   - sets up scripts and files.
  */

  retr.init = () => {
    logger.debug(`ServiceBuilder:init() - '${serviceName}'`);
  };

  const checkVideoDevice = () => {
    return `
if [[ ! -f /dev/video0 ]]; then
  echo "MotionEye /dev/video0 doesn't exist. May cause errors on startup."
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

        postbuildScripts.push({
          serviceName,
          comment: 'Ensure MotionEye can see video device',
          multilineComment: null,
          code: checkVideoDevice()
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
