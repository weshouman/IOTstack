import config from '../config';

const getBuildHistoryList = () => {
  return new Promise((resolve, reject) => {
    try {
      return fetch(`${config.apiProtocol}${config.apiUrl}/build/list`).then((response) => {
        return response.json().then((data) => {
          return resolve(data);
        }).catch((err) => {
          console.error('getBuildHistoryList: error parsing JSON response:');
          console.error(response);
          return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        });
      }).catch((err) => {
        console.error('getBuildHistoryList: error communicating with API.');
        console.error(err);
        return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      });
    } catch (err) {
      console.error('getBuildHistoryList: an unhandled error occured');
      console.error(err);
      return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  });
};

const getBuildIssues = ({ selectedServices, serviceConfigurations }) => {
  return new Promise((resolve, reject) => {
    try {
      if (!Array.isArray(selectedServices)) {
        console.error('getBuildIssues: selectedServices is not an array');
        return reject('getBuildIssues: selectedServices is not an array');
      }
      const bodyObject = {
        buildOptions: {
          selectedServices,
          serviceConfigurations
        }
      }

      return fetch(
        `${config.apiProtocol}${config.apiUrl}/build/dryrun`,
        {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyObject)
        }).then((response) => {
        return response.json().then((data) => {
          return resolve(data);
        }).catch((err) => {
          console.error('getBuildIssues: error parsing JSON response:');
          console.error(response);
          return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        });
      }).catch((err) => {
        console.error('getBuildIssues: error communicating with API.');
        console.error(err);
        return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      });
    } catch (err) {
      console.error('getBuildIssues: an unhandled error occured');
      console.error(err);
      return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  });
};

const createAndBuildStack = ({ selectedServices, serviceConfigurations }) => {
  return new Promise((resolve, reject) => {
    try {
      if (!Array.isArray(selectedServices)) {
        console.error('createAndBuildStack: selectedServices is not an array');
        return reject('createAndBuildStack: selectedServices is not an array');
      }
      const bodyObject = {
        buildOptions: {
          selectedServices,
          serviceConfigurations
        }
      }

      return fetch(
        `${config.apiProtocol}${config.apiUrl}/build/save`,
        {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyObject)
        }).then((response) => {
        return response.json().then((data) => {
          return resolve(data);
        }).catch((err) => {
          console.error('createAndBuildStack: error parsing JSON response:');
          console.error(response);
          return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        });
      }).catch((err) => {
        console.error('createAndBuildStack: error communicating with API.');
        console.error(err);
        return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      });
    } catch (err) {
      console.error('createAndBuildStack: an unhandled error occured');
      console.error(err);
      return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  });
};

const downloadBuild = ({ build, type, linkRef }) => {
  return new Promise((resolve, reject) => {
    try {
      return fetch(
        `${config.apiProtocol}${config.apiUrl}/build/get/${build}/${type}`,
        {
          cache: 'no-cache'
        }).then((response) => {
          return response.blob().then((data) => {
            try {
              const href = window.URL.createObjectURL(data);
              const a = linkRef.current;
              a.download = `${build}.${type}`;
              a.href = href;
              a.click();
              a.href = '';
            } catch (err) {
              console.error('downloadBuild: error creating link for blob download:');
              console.error(err)
            }

            return resolve(data);
          }).catch((err) => {
            console.error('downloadBuild: error parsing text response:');
            console.error(response);
            return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
          });
      }).catch((err) => {
        console.error('downloadBuild: error communicating with API.');
        console.error(err);
        return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      });
    } catch (err) {
      console.error('downloadBuild: an unhandled error occured');
      console.error(err);
      return reject(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  });
};

export {
  downloadBuild,
  getBuildHistoryList,
  getBuildIssues,
  createAndBuildStack
};
