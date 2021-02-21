const plex = () => {
  const retr = {};

  const serviceName = 'plex';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "32400:32400": 'http',
        "1900:1900": 'dlna2',
        "5353:5353": 'bonjour',
        "32400:32400": 'roku',
        "32400:32400": 'dlna2',
      },
      modifyableEnvironment: [
        {
          key: 'VERSION',
          value: 'docker'
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
      displayName: 'Plex',
      serviceTypeTags: ['wui', 'video', 'media']
    };
  };

  return retr;
};

module.exports = plex;
