const blynk_server = () => {
  const retr = {};

  const serviceName = 'blynk_server';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "8180:8080": 'http',
        "8441:8441": 'other',
        "9443:9443": 'ssl'
      },
      volumes: false,
      networks: false,
      logging: true
    }
  };

  retr.getHelp = () => {
    return {
      serviceName, // Required
      website: 'https://github.com/blynkkk/blynk-server', // Website of service
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
      displayName: 'Blynk Server (untested)',
      serviceTypeTags: ['wui', 'iot']
    };
  };

  return retr;
};

module.exports = blynk_server;
