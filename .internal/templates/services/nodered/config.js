const path = require('path');

const nodered = ({
  settings,
  version,
  logger
}) => {
  const retr = {};

  const serviceName = 'nodered';

  retr.getConfigOptions = () => {
    const noderedModules = require(path.join(__dirname, settings.paths.buildFiles, 'addons.json'));

    return {
      serviceName, // Required
      labeledPorts: {
        "1880:1880": 'http'
      },
      volumes: true,
      networks: true,
      devices: true,
      nodered_npmSelection: noderedModules?.data?.addons ?? [],
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
      displayName: 'NodeRed',
      serviceTypeTags: ['wui', 'dashboard', 'low code', 'graphs', 'aggregator', 'iot', 'server']
    };
  };

  return retr;
};

module.exports = nodered;
