const mosquitto = () => {
  const retr = {};

  const serviceName = 'mosquitto';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {},
      volumes: true,
      networks: true,
      logging: true
    };
  };

  retr.getHelp = () => {
    return {
      serviceName, // Required
      website: '', // Website of service
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
      displayName: 'Mosquitto',
      serviceTypeTags: ['mqtt', 'server']
    };
  };

  return retr;
};

module.exports = mosquitto;
