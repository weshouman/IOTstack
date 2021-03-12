const diyhue = () => {
  const retr = {};

  const serviceName = 'diyhue';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "8070:8070": 'http'
      },
      modifyableEnvironment: [
        {
          key: 'TZ',
          value: 'Etc/UTC'
        },
        {
          key: 'IP',
          value: 'Your.LAN.IP'
        },
        {
          key: 'MAC',
          value: 'MAC:Address:Here'
        }
      ],
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
      displayName: 'diyhue',
      serviceTypeTags: ['wui', 'iot']
    };
  };

  return retr;
};

module.exports = diyhue;
