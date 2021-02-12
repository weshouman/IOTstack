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

module.exports = {
  checkPortConflicts
};
