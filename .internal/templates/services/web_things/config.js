const web_things = () => {
  const retr = {};

  const serviceName = 'web_things';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "4060:4060": 'http',
        "4061:4061": 'other'
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
      displayName: 'Web Things (untested)',
      serviceTypeTags: ['wui', 'iot']
    };
  };

  return retr;
};

module.exports = web_things;
