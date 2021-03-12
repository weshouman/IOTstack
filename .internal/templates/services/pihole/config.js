const pihole = () => {
  const retr = {};

  const serviceName = 'pihole';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "8089:80": 'http'
      },
      modifyableEnvironment: [
        {
          key: 'TZ',
          value: 'Etc/UTC'
        },
        {
          key: 'WEBPASSWORD',
          value: 'password'
        },
        {
          key: 'DNS1',
          value: '8.8.8.8'
        },
        {
          key: 'DNS2',
          value: '8.8.4.4'
        },
        {
          key: 'INTERFACE',
          value: 'eth0'
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
      displayName: 'PiHole',
      serviceTypeTags: ['wui', 'dns', 'dashboard']
    };
  };

  return retr;
};

module.exports = pihole;
