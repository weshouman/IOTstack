const timescaledb = () => {
  const retr = {};

  const serviceName = 'timescaledb';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      modifyableEnvironment: [
        {
          key: 'POSTGRES_USER',
          value: 'timescaleuser'
        },
        {
          key: 'POSTGRES_PASSWORD',
          value: 'PASSword'
        },
        {
          key: 'POSTGRES_DB',
          value: 'postdb'
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
      displayName: 'Timescale DB',
      serviceTypeTags: ['timeseries', 'database']
    };
  };

  return retr;
};

module.exports = timescaledb;
