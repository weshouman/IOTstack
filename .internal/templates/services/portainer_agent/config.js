const portainer_agent = () => {
  const retr = {};

  const serviceName = 'portainer_agent';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {},
      volumes: false,
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
      displayName: 'Portainer Agent',
      serviceTypeTags: ['container manager', 'docker']
    };
  };

  return retr;
};

module.exports = portainer_agent;
