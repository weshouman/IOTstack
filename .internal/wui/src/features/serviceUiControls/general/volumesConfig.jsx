import React, { Fragment, useState, useEffect } from 'react';
// import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {
  getExternalVolume,
  getInternalVolume
  // replaceExternalVolume
} from '../../../utils/parsers';

const VolumesConfig = (props) => {

  const {
    serviceConfigOptions,
    serviceName,
    setBuildOptions,
    getBuildOptions,
    buildOptionsInit,
    setServiceOptions,
    setTemporaryBuildOptions,
    getTemporaryBuildOptions,
    setTemporaryServiceOptions,
    setupTemporaryBuildOptions,
    saveTemporaryBuildOptions,
    serviceTemplates,
    onChange
  } = props;

  const tempBuildOptions = getTemporaryBuildOptions();
  const yamlVolumeSettings = getBuildOptions()?.services?.[serviceName]?.volumes || [];

  const [volumeSettings, setVolumeSettings] = useState(yamlVolumeSettings);
  useEffect(() => {
    // setTemporaryServiceOptions(serviceName, {
    //   ...getTemporaryBuildOptions()?.services?.[serviceName] ?? {},
    //   ports: portSettings
    // });
  }, [
    // portSettings
  ]);

  const onChangeCb = (portKey, portLabelValue, event) => {
    // const newPort = event.target.value;
    // // const defaultTemplatePort = defaultValue(portKey, portKey);
    // setPortSettings({
    //   ...portSettings,
    //   [portKey]: replaceExternalVolume((portSettings[portKey] || portKey), newPort)
    // });
    // if (typeof(onChange) === 'function') {
    //   onChange(portKey, portLabelValue, newPort);
    // }
  };

  return (
    <Fragment>
      Volumes
      <Grid container spacing={3}>
        {yamlVolumeSettings.map((volume) => {
          console.log(1111, volume)
          const internalVolume = getInternalVolume(volume);

          let temporaryVolume = '';
          (getTemporaryBuildOptions()?.services?.[serviceName]?.volumes ?? []).forEach((tempVolume) => {
            if (getInternalVolume(tempVolume) === internalVolume) {
              temporaryVolume = getTemporaryBuildOptions()?.services?.[serviceName]?.volumes ?? '';
            } else {
              temporaryVolume = volume;
            }
          });
          const defaultExternalVolume = getExternalVolume(volume);
          const currntExternalVolume = getExternalVolume(temporaryVolume);

          return (
            <Grid
              item
              xs={12}
              md={6}
              lg={3}
              key={internalVolume}
            >
              <TextField
                id={`volumeConfig_${internalVolume}`}
                label={`Volume: ${internalVolume}`}
                onChange={(event) => { onChangeCb(internalVolume, event) }}
                value={temporaryVolume ? currntExternalVolume : defaultExternalVolume}
              />
            </Grid>
          );
        })}
      </Grid>
    </Fragment>
  );
};

export default VolumesConfig;
