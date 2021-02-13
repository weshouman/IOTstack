const {
  getExternalVolume,
  getInternalVolume,
  replaceExternalVolume,
  getEnvironmentKey,
  getEnvironmentValue,
  replaceEnvironmentValue,
} = require('./dockerParse');

const {
  generateFileOrFolderName,
  generatePassword,
  generateAlphanumeric,
  generateRandomPort
} = require('./stringGenerate');

const { byName } = require('./interpolate');

const setCommonInterpolations = ({ stringList, inputString }) => {
  let result = [];
  if (Array.isArray(stringList)) {
    result = stringList.map((iString) => {
      return byName(iString, {
        randomPassword: generatePassword(),
        password: generatePassword(),
        adminPassword: generatePassword(),
        folderName: generateFileOrFolderName(),
        compiledTime: new Date().getTime(),
        randomAlphanumeric: generateAlphanumeric(),
        randomPort: generateRandomPort()
      });
    });
  }

  if (typeof inputString === 'string') {
    return byName(inputString, {
      randomPassword: generatePassword(),
      password: generatePassword(),
      adminPassword: generatePassword(),
      folderName: generateFileOrFolderName(),
      compiledTime: new Date().getTime(),
      randomAlphanumeric: generateAlphanumeric(),
      randomPort: generateRandomPort()
    });
  }

  return result;
};

const setModifiedPorts = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];

  const modifiedPortList = Object.keys(serviceConfig?.ports ?? {});
  let updated = false;

  for (let i = 0; i < modifiedPortList.length; i++) {
    (serviceTemplate?.ports ?? []).forEach((port, index) => {
      if (port === modifiedPortList[i]) {
        if (serviceTemplate.ports[index] !== serviceConfig.ports[modifiedPortList[i]]) {
          updated = true;
        }

        serviceTemplate.ports[index] = serviceConfig.ports[modifiedPortList[i]];
        serviceTemplate.ports[index] = setCommonInterpolations({ inputString: serviceTemplate.ports[index] });
      }
    });
  }

  return updated;
};

const setLoggingState = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];

  const currentLogging = Object.keys(serviceTemplate?.logging ?? {});

  if (serviceConfig?.loggingEnabled === false) {
    if (serviceTemplate.logging) {
      delete serviceTemplate?.logging;
      return true;
    }
    return false;
  }

  return Object.keys(serviceTemplate?.logging ?? {}).length !== currentLogging.length;
};

const setNetworkMode = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];

  const currentNetworkMode = serviceTemplate?.['network_mode'];

  if (serviceConfig?.networkMode) {
    if (
      serviceTemplate['network_mode'] !== serviceConfig.networkMode
      && serviceConfig.networkMode !== 'Unchanged'
      && serviceConfig.networkMode !== ''
    ) {
      serviceTemplate['network_mode'] = serviceConfig.networkMode;
    }
  }

  return currentNetworkMode !== serviceTemplate['network_mode'];
};

const setNetworks = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];
  let updated = false;

  Object.keys(serviceConfig?.networks ?? {}).forEach((network) => {
    serviceTemplate.networks = [];
    if (serviceConfig.networks[network] === true) {
      serviceTemplate.networks.push(network);
    }
    updated = true;
  });

  return updated;
};

const setVolumes = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];
  let updated = false;

  if (Array.isArray(serviceConfig?.volumes ?? false)) {
    serviceConfig.volumes.forEach((configVolume, volumeIndex) => {
      const configInternalVolume = getInternalVolume(configVolume);
      let found = false;
      for (let i = 0; i < (serviceTemplate?.volumes ?? []).length; i++) {
        const templateInternalVolume = getInternalVolume(serviceTemplate.volumes[i]);
  
        if (templateInternalVolume === configInternalVolume) {
          const configExternalVolume = getExternalVolume(configVolume);
          if (configExternalVolume === '') {
            serviceTemplate.volumes.splice(i, 1);
          } else {
            serviceTemplate.volumes[i] = replaceExternalVolume(configVolume, configExternalVolume);
            serviceTemplate.volumes[i] = setCommonInterpolations({ inputString: serviceTemplate.volumes[i] });
          }
          updated = true;
          found = true;
          break;
        }
      }

      if (!found) {
        serviceTemplate.volumes[i].push(configVolume);
      }
    });
  }

  return updated;
};

const setEnvironmentVariables = ({ buildTemplate, buildOptions, serviceName }) => {
  const serviceTemplate = buildTemplate?.services?.[serviceName];
  const serviceConfig = buildOptions?.serviceConfigurations?.services?.[serviceName];
  let updated = false;

  if (Array.isArray(serviceConfig?.environment ?? false)) {
    serviceConfig.environment.forEach((configEnvironment, environmenteIndex) => {
      const configEnvironmentKey = getEnvironmentKey(configEnvironment);
      let found = false;
      for (let i = 0; i < (serviceTemplate?.environment ?? []).length; i++) {
        const templateEnvironmentKey = getEnvironmentKey(serviceTemplate.environment[i]);

        if (templateEnvironmentKey === configEnvironmentKey) {
          const newEnvironmentValue = getEnvironmentValue(configEnvironment);
          if (newEnvironmentValue === '') {
            serviceTemplate.environment.splice(i, 1);
          } else {
            serviceTemplate.environment[i] = replaceEnvironmentValue(configEnvironment, newEnvironmentValue);
            serviceTemplate.environment[i] = setCommonInterpolations({ inputString: serviceTemplate.environment[i] });
          }
          updated = true;
          found = true;
          break;
        }
      }

      if (!found) {
        serviceTemplate.environment[i].push(configEnvironment);
      }
    });
  }

  return updated;
};

module.exports = {
  setModifiedPorts,
  setLoggingState,
  setNetworkMode,
  setNetworks,
  setVolumes,
  setEnvironmentVariables,
  setCommonInterpolations
};
