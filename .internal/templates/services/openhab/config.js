const adminer = () => {
  const retr = {};

  const serviceName = 'adminer';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "4050:4050": 'http',
        "4051:4051": 'ssl'
      },
      modifyableEnvironment: [
        {
          key: 'OPENHAB_HTTP_PORT',
          value: '4050'
        },
        {
          key: 'OPENHAB_HTTPS_PORT',
          value: '4051'
        },
        {
          key: 'EXTRA_JAVA_OPTS',
          value: '-Duser.timezone=Etc/UTC'
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
      displayName: 'Open Hab (untested)',
      serviceTypeTags: ['wui', 'dashboard', 'home automation']
    };
  };

  return retr;
};

module.exports = adminer;
