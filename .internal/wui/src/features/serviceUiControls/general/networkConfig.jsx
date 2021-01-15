import React, { Fragment, useState, useEffect } from 'react';
// import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const NetworkConfig = (props) => {
  const {
    serviceConfigOptions,
    serviceName,
    setBuildOptions,
    getBuildOptions,
    buildOptionsInit,
    setServiceOptions,
    networkTemplateList,
    setTemporaryBuildOptions,
    getTemporaryBuildOptions,
    setTemporaryServiceOptions,
    setupTemporaryBuildOptions,
    saveTemporaryBuildOptions,
    serviceTemplates,
    onChange
  } = props;

  const tempBuildOptions = getTemporaryBuildOptions();

  const [modifiedNetworkList, setModifiedNetworkList] = useState({});
  useEffect(() => {
    const defaultOnNetworks = { ...getBuildOptions()?.services?.[serviceName]?.networks ?? {} };
    serviceTemplates[serviceName]?.networks?.forEach((networkName) => {
      defaultOnNetworks[networkName] = true;
    });
    setModifiedNetworkList({
      ...defaultOnNetworks
    });
  }, []);

  useEffect(() => {
    setTemporaryServiceOptions(serviceName, {
      ...getTemporaryBuildOptions()?.services?.[serviceName] ?? {},
      networks: modifiedNetworkList
    });
  }, [
    modifiedNetworkList
  ]);

  const onChangeCb = (networkName, event) => {
    const networkSelected = event.target.checked;
    setModifiedNetworkList({
      ...modifiedNetworkList,
      [networkName]: networkSelected
    });
    if (typeof(onChange) === 'function') {
      onChange(networkName, networkName);
    }
  };

  const defaultValue = (networkName) => {
    return (serviceTemplates[serviceName]?.networks ?? []).includes(networkName);
  };

  return (
    <Fragment>
      IOTstack Networks:
      <Grid container spacing={3} justify="space-between">
        {(networkTemplateList?.payload ?? []).map((networkName) => {
          return (
            <Grid
              item
              xs={12}
              md={5}
              lg={4}
              xl={2}
              key={networkName}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={modifiedNetworkList?.[networkName] ?? defaultValue(networkName)}
                    onChange={(evt) => onChangeCb(networkName, evt) }
                    name={networkName}
                    color="primary"
                  />
                }
                label={networkName}
              />
            </Grid>
          );
        }).filter((ele) => {
          return ele !== null;
        })}
      </Grid>
    </Fragment>
  );
};

export default NetworkConfig;
