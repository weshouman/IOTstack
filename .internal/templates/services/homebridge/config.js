const homebridge = () => {
  const retr = {};

  const serviceName = 'homebridge';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "8581:8581": 'http'
      },
      volumes: false,
      networks: false,
      logging: true
    }
  };

  retr.getHelp = () => {
    return {
      serviceName, // Required
      website: 'https://homebridge.io/', // Website of service
      rawMarkdownRemote: '', // Usually links to github raw help pages.
      rawMarkdownLocal: '', // Relative path to docs locally
      onlineRendered: '' // Usually links to the github page for this service.
    };
  };

  retr.getCommands = () => {
    return {
      commands: {} // Key/value pair of helper commands user can run locally
    };
  };

  retr.getMeta = () => {
    return {
      serviceName, // Required
      displayName: 'Home Bridge',
      serviceTypeTags: ['wui', 'iot']
    };
  };

  return retr;
};

module.exports = homebridge;
