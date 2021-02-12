const telegraf = () => {
  const retr = {};

  const serviceName = 'telegraf';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
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
      displayName: 'Telegraf (untested)',
      serviceTypeTags: ['iot']
    };
  };

  return retr;
};

module.exports = telegraf;
