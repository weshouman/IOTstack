// import React, { Fragment, useState, useEffect } from 'react';
import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ServiceGridItem from '../../features/servicesGridItem';
import BuildSidebar from '../../features/BuildSidebar';
import { getServiceTemplateListAction } from '../../actions/getServiceTemplateList.action';
import { getServiceTemplatesAction } from '../../actions/getServiceTemplates.action';
import { getNetworkTemplateListAction } from '../../actions/getNetworkTemplateList.action';
import {
  getBuildOptions,
  setBuildOptions,
  buildOptionsInit,
  setServiceOptions,
  setTemporaryBuildOptions,
  getTemporaryBuildOptions,
  setTemporaryServiceOptions,
  setupTemporaryBuildOptions,
  saveTemporaryBuildOptions
} from '../../utils/buildOptionSync';

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchGetServiceTemplatesList: () => dispatch(getServiceTemplateListAction()),
    dispatchGetNetworkTemplatesList: () => dispatch(getNetworkTemplateListAction()),
    dispatchGetServiceTemplates: () => dispatch(getServiceTemplatesAction())
  };
};

const mapStateToProps = (selector) => {
  return {
    serviceTemplateList: selector(state => state.serviceTemplateList),
    networkTemplateList: selector(state => state.networkTemplateList),
    serviceTemplates: selector(state => state.serviceTemplates)
  };
};

const Main = (props) => {
  props = {
    ...props,
    ...mapDispatchToProps(useDispatch()),
    ...mapStateToProps(useSelector)
  };

  const {
    dispatchGetServiceTemplatesList,
    dispatchGetNetworkTemplatesList,
    dispatchGetServiceTemplates,
    serviceTemplateList,
    networkTemplateList,
    serviceTemplates
  } = props;
  const buildOptions = getBuildOptions();

  useEffect(() => {
    dispatchGetServiceTemplatesList();
    dispatchGetNetworkTemplatesList();
    dispatchGetServiceTemplates();
  }, []);

  return (
    <Fragment>
      <div  style={{ width: '100%' }}>
        <Box display="flex" p={1}>
          <Box p={1} flexGrow={1}>
            <Grid
              container
              justify="center"
            >
              {Array.isArray(serviceTemplateList.payload) && serviceTemplateList.payload.map((templateName) => {
                return (
                  <Grid item
                    key={templateName}
                    display="flex"
                  >
                    <ServiceGridItem
                      serviceName={templateName}
                      buildOptions={buildOptions}
                      setBuildOptions={setBuildOptions}
                      setServiceOptions={setServiceOptions}
                      getBuildOptions={getBuildOptions}
                      buildOptionsInit={buildOptionsInit}
                      setTemporaryBuildOptions={setTemporaryBuildOptions}
                      getTemporaryBuildOptions={getTemporaryBuildOptions}
                      setTemporaryServiceOptions={setTemporaryServiceOptions}
                      setupTemporaryBuildOptions={setupTemporaryBuildOptions}
                      saveTemporaryBuildOptions={saveTemporaryBuildOptions}
                      networkTemplateList={networkTemplateList}
                      serviceTemplates={serviceTemplates?.payload ?? {}}
                    />
                  </Grid>
                );
              })}
          </Grid>
          </Box>
          <Box p={1}>
            <BuildSidebar
              serviceTemplateList={serviceTemplateList}
              networkTemplateList={networkTemplateList}
              serviceTemplates={serviceTemplates?.payload ?? {}}
            />
          </Box>
        </Box>

      </div>
    </Fragment>
  );
};

export default Main;
