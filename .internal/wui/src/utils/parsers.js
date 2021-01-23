const getExternalPort = (intExtStr) => {
  if (typeof(intExtStr) === 'string') {
    const splitted = intExtStr.split(':');
    if (splitted.length === 2) {
      return splitted[0];
    }
  }

  return intExtStr;
};

const getInternalPort = (intExtStr) => {
  if (typeof(intExtStr) === 'string') {
    const portSection = intExtStr.split('/'); // So that /TCP or /UDP is not returned.
    const splitted = portSection[0].split(':');
    if (splitted.length === 2) {
      return splitted[1];
    }
  }

  return intExtStr;
};

const getPortProtocol = (intExtProtStr) => {
  if (typeof(intExtProtStr) === 'string') {
    const splitted = intExtProtStr.split('/');
    if (splitted.length === 2) {
      return splitted[1];
    }
  }

  return intExtProtStr;
};

const replaceExternalPort = (intExtStr, newExtPort) => {
  if (typeof(intExtStr) === 'string' && (typeof(newExtPort) === 'string' || typeof(newExtPort) === 'number')) {
    const intAndProtLoc = intExtStr.indexOf(':');
    if (intAndProtLoc > 0 && intAndProtLoc < 6) {
      const portsWithoutExt = intExtStr.substring(intAndProtLoc, intExtStr.length);
      return `${newExtPort}${portsWithoutExt}`;
    }
  }

  return intExtStr;
};

const getExternalVolume = (intExtStr) => {
  if (typeof(intExtStr) === 'string') {
    const splitted = intExtStr.split(':');
    if (splitted.length === 2) {
      return splitted[0];
    }
  }

  return intExtStr;
};

const getInternalVolume = (intExtStr) => {
  if (typeof(intExtStr) === 'string') {
    const splitted = intExtStr.split(':');
    if (splitted.length === 2) {
      return splitted[1];
    }
  }

  return intExtStr;
};

const replaceExternalVolume = (intExtStr, newExtVolume) => {
  if (typeof(intExtStr) === 'string' && (typeof(newExtVolume) === 'string')) {
    const intLoc = intExtStr.indexOf(':');
    const VolumesWithoutExt = intExtStr.substring(intLoc, intExtStr.length);
    return `${newExtVolume}${VolumesWithoutExt}`;
  }

  return intExtStr;
};


module.exports = {
  getExternalPort,
  getInternalPort,
  replaceExternalPort,
  getPortProtocol,
  getExternalVolume,
  getInternalVolume,
  replaceExternalVolume
};