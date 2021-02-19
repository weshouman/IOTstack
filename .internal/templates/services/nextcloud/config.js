const nextcloud = () => {
  const retr = {};

  const serviceName = 'nextcloud';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      modifyableEnvironment: [
        {
          key: 'TZ',
          value: 'Etc/UTC'
        },
        {
          key: 'MYSQL_HOST',
          value: 'nextcloud_db'
        },
        {
          key: 'MYSQL_PASSWORD',
          value: '{$nextcloudRandomPassword}'
        },
        {
          key: 'MYSQL_DATABASE',
          value: 'nextcloud'
        },
        {
          key: 'MYSQL_USER',
          value: 'nextcloud'
        },
        {
          key: 'MYSQL_ROOT_PASSWORD',
          value: '{$nextcloudRootRandomPassword}'
        }
      ],
      labeledPorts: {
        "9321:80": 'http'
      },
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
      displayName: 'NextCloud',
      serviceTypeTags: ['wui']
    };
  };

  return retr;
};

module.exports = nextcloud;
