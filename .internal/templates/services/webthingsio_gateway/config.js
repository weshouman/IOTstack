const webthingsio_gateway = () => {
  const retr = {};

  const serviceName = 'webthingsio_gateway';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "4060:8080": 'http',
        "4443:4443": 'other'
      },
      volumes: true,
      networks: false,
      logging: true
    }
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
      displayName: 'Web Things (untested)',
      serviceTypeTags: ['wui', 'iot']
    };
  };

  return retr;
};

module.exports = webthingsio_gateway;
