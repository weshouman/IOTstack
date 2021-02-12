const deconz = () => {
  const retr = {};

  const serviceName = 'deconz';

  retr.getConfigOptions = () => {
    return {
      serviceName, // Required
      labeledPorts: {
        "8090:80": 'http',
        "433:433": 'ssl',
        "5900:5900": 'other'
      },
      modifyableEnvironment: [
        {
          key: 'DECONZ_VNC_MODE',
          value: '1'
        },
        {
          key: 'DECONZ_VNC_PASSWORD',
          value: '{$randomPassword}'
        },
        {
          key: 'DECONZ_DEVICE',
          value: '{$selectedDevice}'
        }
      ],
      devices: true,
      volumes: true,
      networks: true,
      deconzSelectedDevice: true,
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
      displayName: 'Deconz (untested)',
      serviceTypeTags: ['iot']
    };
  };

  return retr;
};

module.exports = deconz;
