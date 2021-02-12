import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from '@material-ui/lab/Skeleton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import { makeStyles } from '@material-ui/core/styles';
import ServiceConfigModal from '../serviceConfigModal';
import { useTheme } from '@material-ui/core/styles';
import {
  getBuildIssuesAction
} from '../../actions/checkBuildIssues.action';
import {
  getServiceMetadataAction
} from '../../actions/getServiceMetadata.action';
import {
  getServiceConfigOptionsAction
} from '../../actions/getServiceConfigOptions.action';
import {
  addSelectedService,
  removeSelectedService
} from '../../actions/updateSelectedServices.action';
import styles from './services-grid-item.module.css';

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchGetServiceMetadata: (serviceName) => dispatch(getServiceMetadataAction(serviceName)),
    dispatchGetServiceConfigOptions: (serviceName) => dispatch(getServiceConfigOptionsAction(serviceName)),
    dispatchGetBuildIssues: (selectedServices, serviceConfigurations) => dispatch(getBuildIssuesAction(selectedServices, serviceConfigurations)),
    dispatchAddSelectedService: (serviceName) => dispatch(addSelectedService(serviceName)),
    dispatchRemoveSelectedService: (serviceName) => dispatch(removeSelectedService(serviceName))
  };
};

const mapStateToProps = (selector) => {
  return {
    templateList: selector(state => state.templateList),
    configServiceMetadata: selector(state => state.configServiceMetadata),
    configServiceConfigOptions: selector(state => state.configServiceConfigOptions),
    hideServiceTags: selector(state => state.hideServiceTags),
    selectedServices: selector(state => state.selectedServices),
    buildIssues: selector(state => state.buildIssues)
  };
};

const useStyles = makeStyles({
  serviceCard: {
    "&:hover": {
      borderColor: ({ theme }) => theme.palette.text.primary
    }
  }
});

const ServiceItem = (props) => {
  const theme = useTheme();
  const classes = useStyles({ props, theme });
  // console.log('theme.palette', theme.palette)
  props = {
    ...props,
    ...mapDispatchToProps(useDispatch()),
    ...mapStateToProps(useSelector)
  };

  const {
    serviceName,
    networkTemplateList,
    serviceTemplates,
    dispatchGetServiceMetadata,
    dispatchGetServiceConfigOptions,
    dispatchAddSelectedService,
    dispatchRemoveSelectedService,
    dispatchGetBuildIssues,
    configServiceMetadata,
    configServiceConfigOptions,
    selectedServices,
    hideServiceTags,
    buildIssues,
    buildOptions,
    setBuildOptions,
    getBuildOptions,
    buildOptionsInit,
    setServiceOptions,
    setTemporaryBuildOptions,
    getTemporaryBuildOptions,
    setTemporaryServiceOptions,
    setupTemporaryBuildOptions,
    saveTemporaryBuildOptions
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [serviceMetadata, setServiceMetadata] = useState({});
  const [serviceMetadataError, setServiceMetadataError] = useState({});
  useEffect(() => {
    if (
      typeof configServiceMetadata.services.completed[serviceName] === 'undefined'
      && typeof configServiceMetadata.services.failed[serviceName] === 'undefined'
      && !configServiceMetadata.services.pending.includes(serviceName)
      && !isLoading
    ) {
      setIsLoading(true);
      return void dispatchGetServiceMetadata(serviceName);
    }

    setIsLoading(false);

    if (typeof configServiceMetadata.services.completed[serviceName] === 'object') {
      setServiceMetadata(configServiceMetadata.services.completed[serviceName].payload);
    } else if (!configServiceMetadata.services.pending.includes(serviceName)) {
      setServiceMetadataError({
        hasError: true
      });
    }
  }, [
    isLoading,
    serviceName,
    dispatchGetServiceMetadata,
    configServiceMetadata.services.completed,
    configServiceMetadata.services.pending,
    configServiceMetadata.services.failed
  ]);

  const [serviceConfigOptions, setServiceConfigOptions] = useState({});
  const [serviceConfigOptionsError, setServiceConfigOptionsError] = useState({});
  useEffect(() => {
    if (
      typeof configServiceConfigOptions.services.completed[serviceName] === 'undefined'
      && typeof configServiceConfigOptions.services.failed[serviceName] === 'undefined'
      && !configServiceConfigOptions.services.pending.includes(serviceName)
      && !isLoading
    ) {
      setIsLoading(true);
      return void dispatchGetServiceConfigOptions(serviceName);
    }

    // setIsLoading(false);

    if (typeof configServiceConfigOptions.services.completed[serviceName] === 'object') {
      setServiceConfigOptions(configServiceConfigOptions.services.completed[serviceName].payload);
    } else if (!configServiceConfigOptions.services.pending.includes(serviceName)) {
      setServiceConfigOptionsError({
        hasError: true
      });
    }
  }, [
    isLoading,
    serviceName,
    dispatchGetServiceConfigOptions,
    configServiceConfigOptions.services.completed,
    configServiceConfigOptions.services.pending,
    configServiceConfigOptions.services.failed
  ]);

  const [updated, setIsUpdated] = useState(false);
  useEffect(() => {
    if (updated) {
      dispatchGetBuildIssues(selectedServices.selectedServices, getBuildOptions());
    }
    setIsUpdated(false);
  }, [
    updated,
    serviceName,
    selectedServices.selectedServices,
    dispatchGetBuildIssues
  ]);

  const [hasIssue, setHasIssue] = useState(false);
  useEffect(() => {
    if (!selectedServices.selectedServices.includes(serviceName)) {
      return void setHasIssue(false);
    }
    const issueList = buildIssues?.payload?.issueList ?? {};
    if (Array.isArray(issueList.services)) {
      issueList.services.forEach((service) => {
        if (service.name === serviceName) {
          return void setHasIssue(true);
        }
      });
    }
  }, [buildIssues, selectedServices.selectedServices, serviceName]);

  const handleBuildSelectChange = (evt) => {
    setIsUpdated(true);
    if (evt.target.checked) {
      return dispatchAddSelectedService(serviceName);
    }
    return dispatchRemoveSelectedService(serviceName);
  }

  const [modalOpen, setModalOpen] = useState(false);

  const serviceComponent = () => {
    return (
      <Box
        p={1}
        m={1}
        justifyContent="center"
      >
        <ServiceConfigModal
          isOpen={modalOpen}
          handleClose={() => setModalOpen(false)}
          serviceMetadata={serviceMetadata}
          serviceConfigOptions={serviceConfigOptions}
          serviceName={serviceName}
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
          serviceTemplates={serviceTemplates}
        />
        <Box
          display="flex"
          p={1}
          justifyContent="center"
          className={`${styles.serviceName}`}
        >
          {serviceMetadata.displayName}
        </Box>
        <Box display="flex" p={1} justifyContent="center">
          {!serviceMetadata.iconUri
          && (
            <Tooltip title="Service icon not provided in config">
              <ErrorOutlineOutlinedIcon style={{ fontSize: '6rem' }} />
            </Tooltip>
          )}
          {serviceMetadata.iconUri
          && (
            <Tooltip title={`${serviceMetadata.displayName} icon`}>
              <div className={styles.serviceIconContainer}>
                <img className={styles.serviceIcon} src={serviceMetadata.iconUri} alt={`${serviceMetadata.displayName} icon`} />
              </div>
            </Tooltip>
          )}
        </Box>
        <Box display="flex" p={1} m={1} justifyContent="center">
          <Button
            variant="contained"
            onClick={() => { setTemporaryBuildOptions(buildOptions); setModalOpen(true); }}
            className={`${styles.configButton}`}
          >
            {serviceMetadata.displayName} Configuration
          </Button>
        </Box>
        <Box display="flex" p={1} justifyContent="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedServices.selectedServices.includes(serviceName)}
                onChange={handleBuildSelectChange}
                name={`chkBuild${serviceName}`}
                color="primary"
              />
            }
            label={`Add ${serviceMetadata.displayName} to build`}
          />
        </Box>
        <Box display="flex" m={1} justifyContent="center">
          <Link
            href="#"
            rel="noopener"
            target="_blank"
            className={styles.docsLink}
            color="inherit"
          >
            {serviceMetadata.displayName} Help and Docs
          </Link>
        </Box>
      </Box>
    )
  };

  const errorComponent = () => {
    return (
      <Fragment>
        <div>Error loading: {serviceName}</div>
        <div>Try refreshing, and ensuring the API server is running correctly.</div>
      </Fragment>
    )
  };

  const loadingComponent = () => {
    return (
      <Fragment>
        Loading '{serviceName}' metadata...
        <Box display="flex" justifyContent="center">
          <Skeleton height={'6rem'} width={'80%'} variant="text" />
        </Box>
        <Box display="flex" justifyContent="center" m={1} p={1} >
          <Skeleton variant="circle" width={120} height={120} />
        </Box>
        <Box display="flex" justifyContent="center">
          <Skeleton height={'3rem'} width={'70%'} variant="text" />
        </Box>
        <Box display="flex" justifyContent="center">
          <Skeleton height={'4rem'} width={'90%'} variant="text" />
        </Box>
      </Fragment>
    )
  };

  const highlightClass = () => {
    if (selectedServices.selectedServices.includes(serviceName)) {
      if (hasIssue) {
        return styles.serviceError;
      } else {
        return styles.selectedForBuild;
      }
    }

    return '';
  };

  const tagIsHidden = (hiddenTags, serviceTags) => {
    let hide = false;

    hiddenTags.forEach((hiddenTag) => {
      serviceTags.forEach((serviceTag) => {
        if (hiddenTag === serviceTag) {
          hide = true;
        }
      });
    });

    return hide;
  }

  if (!isLoading && tagIsHidden(hideServiceTags.hideServiceTags, serviceMetadata.serviceTypeTags)) {
    return null;
  }

  return (
    <Fragment>
      <Box
        className={`${styles.serviceCard} ${classes.serviceCard} ${highlightClass()}`}
        borderRadius="borderRadius"
        borderColor="primary.main"
        margin={1}
        border={1}
      >
        {isLoading
        && (loadingComponent())}
        {!isLoading
        && serviceMetadata.displayName
        && (
          serviceComponent()
        )}
        {!isLoading
        && serviceMetadataError.hasError === true
        && (
          errorComponent()
        )}
      </Box>
    </Fragment>
  );
};

export default ServiceItem;
