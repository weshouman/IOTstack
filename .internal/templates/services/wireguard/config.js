const wireguard = () => {
  const retr = {};

  const serviceName = 'wireguard';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "51820:51820": 'vpn'
      },
      volumes: false,
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
      displayName: 'Wire Guard (untested)',
      serviceTypeTags: ['vpn']
    };
  };

  return retr;
};

module.exports = wireguard;
