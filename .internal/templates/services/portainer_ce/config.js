const portainer_ce = () => {
  const retr = {};

  const serviceName = 'portainer_ce';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "8000:8000": 'http'
      },
      volumes: true,
      networks: true,
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
      displayName: 'Portainer-CE',
      serviceTypeTags: ['wui', 'container manager', 'docker'],
      iconUri: '/logos/portainer.png'
    };
  };

  return retr;
};

module.exports = portainer_ce;
