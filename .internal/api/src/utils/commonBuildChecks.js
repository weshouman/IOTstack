const {
  getExternalPort
} = require('./dockerParse');

const checkPortConflicts = ({ buildTemplate, buildOptions, serviceName }) => {
  const portConflicts = [];
  const currentServiceExternalPorts = buildTemplate?.services?.[serviceName]?.ports?.map((port) => {
    return getExternalPort(port);
  }) ?? [];

  Object.keys(buildTemplate?.services ?? {}).forEach((service) => {
    if (service === serviceName) {
      return null; // Skip self
    }
    
    const checkingServiceExternalPorts = buildTemplate?.services?.[service]?.ports?.map((port) => {
      return getExternalPort(port);
    }) ?? [];

    checkingServiceExternalPorts.forEach((port) => {
      if (currentServiceExternalPorts.includes(port)) {
        portConflicts.push({
          type: 'service',
          name: serviceName,
          issueType: 'portConflict',
          message: `Port '${port}' is also used by '${service}'`
        });
      }
    });
  });

  return portConflicts;
};

const checkNetworkConflicts = ({ buildTemplate, buildOptions, serviceName }) => {
  const currentServiceNetworkMode = buildTemplate?.services?.[serviceName]?.network_mode ?? null;
  const currentServiceNetworks = buildTemplate?.services?.[serviceName]?.networks ?? [];

  if (currentServiceNetworks.length > 0 && currentServiceNetworkMode) {
    return {
      type: 'service',
      name: serviceName,
      issueType: 'networkConflict',
      message: `Networks configured: ${currentServiceNetworks.length} and 'Network Mode' is set. You can only choose to set networks or network mode.`
    }
  }

  return false;
};

const checkDependencyServices = ({ buildTemplate, buildOptions, serviceName, ignoreDependencies }) => {
  const dependsOnServicesList = buildTemplate?.services?.[serviceName]?.depends_on ?? [];
  const selectedServices = buildOptions?.selectedServices ?? [];
  const missingServices = [];

  dependsOnServicesList.forEach((requiredService) => {
    if (selectedServices.indexOf(requiredService) < 0) {
      if (ignoreDependencies.indexOf(requiredService) < 0) {
        missingServices.push({
          type: 'service',
          name: serviceName,
          issueType: 'dependsOn',
          message: `Service '${requiredService}' is missing from selected services`
        });
      }
    }
  });

  return missingServices;
};

module.exports = {
  checkPortConflicts,
  checkNetworkConflicts,
  checkDependencyServices
};
