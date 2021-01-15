const mariadb = () => {
  const retr = {};

  const serviceName = 'mariadb';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      modifyableEnvironment: [
        {
          key: 'TZ',
          value: 'Etc/UTC'
        },
        {
          key: 'MYSQL_ROOT_PASSWORD',
          value: 'PASSword'
        },
        {
          key: 'MYSQL_DATABASE',
          value: 'default'
        },
        {
          key: 'MYSQL_USER',
          value: 'mariadbuser'
        },
        {
          key: 'MYSQL_PASSWORD',
          value: 'PASSword'
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
      displayName: 'MariaDB',
      serviceTypeTags: ['database', 'sql']
    };
  };

  return retr;
};

module.exports = mariadb;
