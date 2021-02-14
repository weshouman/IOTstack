const qbittorrent = () => {
  const retr = {};

  const serviceName = 'qbittorrent';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "15080:15080": 'http'
      },
      modifyableEnvironment: [
        {
          key: 'WEBUI_PORT',
          value: '15080'
        }
      ],
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
      displayName: 'Q Bittorrent',
      serviceTypeTags: ['bittorrent']
    };
  };

  return retr;
};

module.exports = qbittorrent;
