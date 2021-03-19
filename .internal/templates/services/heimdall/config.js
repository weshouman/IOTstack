const heimdall = () => {
  const retr = {};

  const serviceName = 'heimdall';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      modifyableEnvironment: [
        {
          key: 'TZ',
          value: 'Etc/UTC2'
        }
      ],
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
      displayName: 'Heimdall',
      serviceTypeTags: ['wui', 'database manager'],
      iconUri: '/logos/heimdall.png'
    };
  };

  return retr;
};

module.exports = heimdall;
